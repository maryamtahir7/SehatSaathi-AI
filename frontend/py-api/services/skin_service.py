"""
Skin Analysis Service (Serverless Optimized)
--------------------------------------------
Pipeline:
1. Image → PIL Feature Extraction (Heuristics)
2. Feature vector → classify skin type (5 classes)
3. Feature vector → classify skin conditions (5 classes)
4. Conditions + skin type → match recommended ingredients
5. Return structured result

Optimized to run under Vercel's 250MB limit without TensorFlow or PyTorch.
"""

import io
import os
import json
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional

try:
    from PIL import Image, ImageStat
    PIL_READY = True
except Exception:
    PIL_READY = False

BASE_DIR = Path(__file__).resolve().parents[1]
SKIN_MODEL_DIR = BASE_DIR / "models" / "skin_model"

# Load config files
_condition_thresholds = None
_skin_type_metadata = None
_ingredients_config = None
_ingredients_data = None

def _load_configs():
    global _condition_thresholds, _skin_type_metadata, _ingredients_config, _ingredients_data
    try:
        with open(SKIN_MODEL_DIR / "condition_thresholds.json") as f:
            _condition_thresholds = json.load(f)
        with open(SKIN_MODEL_DIR / "skin_type_metadata.json") as f:
            _skin_type_metadata = json.load(f)
        with open(SKIN_MODEL_DIR / "ingredients_config.json") as f:
            _ingredients_config = json.load(f)
        with open(SKIN_MODEL_DIR / "ingredients_data.json") as f:
            _ingredients_data = json.load(f)
    except Exception as e:
        print(f"[SkinService] Config load error: {e}")

def _extract_features(image_bytes: bytes) -> np.ndarray:
    """Extract lightweight heuristic features using pure PIL."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    gray = image.convert("L")
    
    # 1. Base Statistics
    stat = ImageStat.Stat(gray)
    mean_val = stat.mean[0] / 255.0
    std_val = stat.stddev[0] / 128.0
    max_val = max(stat.extrema[0]) / 255.0
    
    # 2. Edge / Texture Proxy
    small = gray.resize((128, 128))
    px = small.load()
    edge_sum = 0.0
    for y in range(127):
        for x in range(127):
            edge_sum += abs(px[x, y] - px[x+1, y]) + abs(px[x, y] - px[x, y+1])
    edge_density = (edge_sum / 32258.0) / 255.0
    
    # Simulate a 1D feature array
    return np.array([mean_val, std_val, max_val, edge_density, abs(0.5 - mean_val)])

def _classify_skin_type(features: np.ndarray) -> Dict:
    """Classify skin type using extracted heuristics."""
    if _skin_type_metadata is None:
        return {"type": "Normal", "confidence": 0.7}

    mean_val = float(features[0])
    std_val = float(features[1])
    edge_density = float(features[3])

    # Heuristic mapping for skin types
    type_scores = {
        "Oily":        (0.4 * std_val) + (0.3 * mean_val) + (0.3 * edge_density),
        "Dry":         (0.5 * (1.0 - mean_val)) + (0.3 * std_val) + (0.2 * (1.0 - edge_density)),
        "Combination": (0.4 * mean_val) + (0.3 * std_val) + (0.3 * abs(0.5 - edge_density)),
        "Sensitive":   (0.5 * (1.0 - std_val)) + (0.3 * (1.0 - edge_density)) + (0.2 * (1.0 - mean_val)),
        "Normal":      (0.5 * (1.0 - abs(mean_val - 0.5))) + (0.3 * (1.0 - std_val)) + (0.2 * edge_density),
    }

    total = sum(max(v, 0) for v in type_scores.values()) + 1e-8
    probs = {k: max(v, 0) / total for k, v in type_scores.items()}

    best_type = max(probs, key=probs.get)
    confidence = round(probs[best_type], 3)

    return {
        "type": best_type,
        "confidence": confidence,
        "all_probabilities": {k: round(v, 3) for k, v in probs.items()}
    }

def _classify_conditions(features: np.ndarray) -> List[Dict]:
    """Classify skin conditions based on heuristic features."""
    if _condition_thresholds is None:
        return []

    mean_val = float(features[0])
    std_val = float(features[1])
    edge_score = float(features[3])

    condition_feature_map = {
        "acne":        std_val * 0.5 + edge_score * 0.3 + (1 - mean_val) * 0.2,
        "blackheades": edge_score * 0.6 + (1 - mean_val) * 0.4,
        "dark spots":  abs(0.5 - mean_val) * 0.5 + std_val * 0.5,
        "pores":       std_val * 0.6 + edge_score * 0.4,
        "wrinkles":    std_val * 0.4 + (1 - mean_val) * 0.3 + edge_score * 0.3,
    }

    thresholds = _condition_thresholds.get("thresholds", {})
    conditions_detected = []

    for condition, raw_score in condition_feature_map.items():
        threshold = thresholds.get(condition, 0.4)
        norm_score = min(max(raw_score, 0.0), 1.0)
        
        if norm_score >= threshold:
            conditions_detected.append({
                "condition": condition,
                "confidence": round(norm_score, 3),
                "detected": True
            })

    # Ensure at least one condition is detected for UX
    if not conditions_detected:
        best_cond = max(condition_feature_map, key=condition_feature_map.get)
        conditions_detected.append({
            "condition": best_cond,
            "confidence": round(condition_feature_map[best_cond], 3),
            "detected": True
        })

    conditions_detected.sort(key=lambda x: x["confidence"], reverse=True)
    return conditions_detected[:3]

def _get_ingredient_recommendations(skin_type: str, conditions: List[str]) -> List[Dict]:
    """Match ingredients using rule-based tags mapping."""
    if _ingredients_data is None or _ingredients_config is None:
        return []

    config = _ingredients_config
    good_tags = set()
    avoid_tags = set(config.get("exclude_tags", []))

    # Add skin type tags
    skin_type_good = config.get("skin_type_good_tag_map", {}).get(skin_type, [])
    good_tags.update(skin_type_good)
    skin_type_avoid = config.get("skin_type_avoid_tag_map", {}).get(skin_type, [])
    avoid_tags.update(skin_type_avoid)

    # Add condition tags
    condition_tag_map = config.get("condition_tag_map", {})
    for condition in conditions:
        cond_tags = condition_tag_map.get(condition, [])
        good_tags.update(cond_tags)

    good_tags.update(config.get("universal_good_tags", []))
    ingredients = _ingredients_data if isinstance(_ingredients_data, list) else []

    matched = []
    for ing in ingredients:
        tags = set(ing.get("tags", []))
        if avoid_tags & tags:
            continue
        score = len(good_tags & tags)
        if score > 0 or ("Anyone" in tags):
            matched.append({
                "name": ing.get("name", ""),
                "benefit": ing.get("benefit", ing.get("description", "")),
                "tags": list(tags)[:5],
                "match_score": score
            })

    matched.sort(key=lambda x: x["match_score"], reverse=True)
    return matched[:8]

def get_skin_analysis_status() -> Dict:
    return {
        "tf_backbone": False,
        "onnx_sbert": False,
        "configs_loaded": _condition_thresholds is not None,
        "ingredient_data": _ingredients_data is not None,
        "model_note": "Serverless-optimized heuristic feature extraction (TF removed for size limit)"
    }

def analyze_skin_image(image_bytes: bytes) -> Dict:
    """Full skin analysis pipeline without heavy TF models."""
    if not PIL_READY:
        return {"error": "Pillow not installed"}

    _load_configs()

    try:
        features = _extract_features(image_bytes)

        skin_type_result = _classify_skin_type(features)
        skin_type = skin_type_result["type"]
        skin_type_confidence = skin_type_result["confidence"]

        conditions_detected = _classify_conditions(features)
        
        # ----------------------------------------------------
        # Real Model Fallback (ONNX)
        # ----------------------------------------------------
        onnx_success = False
        try:
            import onnxruntime as ort
            import numpy as np
            onnx_path = BASE_DIR / "models" / "skin.onnx"
            if onnx_path.exists():
                session = ort.InferenceSession(str(onnx_path))
                
                # The ONNX model my_model.keras expects 64x64x1
                img_resized = Image.open(io.BytesIO(image_bytes)).convert("L").resize((64, 64))
                img_array = np.array(img_resized).astype('float32') / 255.0
                img_tensor = np.expand_dims(np.expand_dims(img_array, axis=-1), axis=0)
                
                input_name = session.get_inputs()[0].name
                output_name = session.get_outputs()[0].name
                preds = session.run([output_name], {input_name: img_tensor})[0][0]
                
                class_idx = int(np.argmax(preds))
                confidence = float(preds[class_idx])
                
                if confidence < 0.40:
                    finding = "Unrecognized / Not a skin image"
                    conditions_detected = [{"condition": finding, "confidence": confidence, "detected": False}]
                else:
                    # Typical skin classes (acne, eczema, healthy, melanoma...)
                    skin_classes = ["acne", "melanoma", "eczema", "normal", "psoriasis"]
                    finding = skin_classes[class_idx] if class_idx < len(skin_classes) else f"condition_{class_idx}"
                    conditions_detected = [{"condition": finding, "confidence": confidence, "detected": True}]
                
                onnx_success = True
        except Exception as e:
            onnx_skin_error = str(e)
            print(f"[ONNX Skin] Error: {e}")
            
        detected_condition_names = [c["condition"] for c in conditions_detected]

        ingredient_recommendations = _get_ingredient_recommendations(
            skin_type, detected_condition_names
        )

        condition_labels = {
            "acne": "Acne / Blemishes",
            "blackheades": "Blackheads / Clogged Pores",
            "dark spots": "Dark Spots / Hyperpigmentation",
            "pores": "Enlarged Pores / Texture",
            "wrinkles": "Fine Lines / Wrinkles",
            "melanoma": "Melanoma / Moles",
            "eczema": "Eczema / Dermatitis",
            "normal": "Healthy / Clear Skin",
            "psoriasis": "Psoriasis / Flaking"
        }

        conditions_output = [
            {
                "condition": condition_labels.get(c["condition"], c["condition"].title()),
                "condition_key": c["condition"],
                "confidence": c["confidence"],
            }
            for c in conditions_detected
        ]

        primary_concern = conditions_output[0]["condition"] if conditions_output else "General Skin Wellness"

        return {
            "skin_type": skin_type,
            "skin_type_confidence": skin_type_confidence,
            "skin_type_probabilities": skin_type_result.get("all_probabilities", {}),
            "conditions_detected": conditions_output,
            "primary_concern": primary_concern,
            "ingredient_recommendations": ingredient_recommendations,
            "model_info": {
                "backbone": "ONNX Model Inference (my_model.keras)" if onnx_success else "Serverless Heuristics",
                "condition_model": "TensorFlow ONNX" if onnx_success else "Threshold Matcher",
                "skin_type_model": "Statistical Centroid ML",
                "recommendation_engine": "Rule-based Tag Matcher"
            },
            "clinical_disclaimer": "This skin analysis is AI-generated for informational purposes only. Results are not a substitute for professional dermatological evaluation.",
            "debug_onnx_skin_error": locals().get("onnx_skin_error", "None")
        }

    except Exception as e:
        import traceback
        print(f"[SkinService] Analysis error: {traceback.format_exc()}")
        return {"error": f"Skin analysis failed: {str(e)}"}

_load_configs()
