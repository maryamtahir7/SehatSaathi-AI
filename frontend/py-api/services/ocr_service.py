# Reload Trigger: Gemini Vision OCR integrated
import io
import re
import os
import ast
import csv
import requests

from services.ml_service import medications_data
from services.gemini_ocr import gemini_extract_text

medicine_catalog = []
_unique_meds = set()

# 1. Load Kaggle Subset from ml_service
if medications_data:
    for row in medications_data:
        try:
            _meds_list = ast.literal_eval(row.get('Medication', ''))
            for _m in _meds_list:
                _unique_meds.add(str(_m).strip())
        except Exception:
            pass

# 2. Load Extended Proprietary Catalogs
from pathlib import Path

try:
    base_dir = Path(__file__).resolve().parents[1]
    med_db_path = base_dir / "data" / "medicine_dataset.csv"
    if med_db_path.exists():
        with open(med_db_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                med_name = row.get('Name')
                if med_name and len(med_name) > 2:
                    _unique_meds.add(med_name.strip())
                
    details_db_path = base_dir / "data" / "Medicine_Details.csv"
    if details_db_path.exists():
        with open(details_db_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                med_name = row.get('Medicine Name')
                if med_name and len(med_name) > 2:
                    primary_name = med_name.split()[0].split('(')[0]
                    if len(primary_name) > 2:
                        _unique_meds.add(primary_name.strip())
except Exception as e:
    print(f"OCR: Could not load extended medicine DBs: {e}")

medicine_catalog = [{'name': m} for m in _unique_meds if len(m) > 2]

try:
    from PIL import Image, ImageEnhance, ImageFilter
    PIL_READY = True
except Exception:
    Image = None
    ImageEnhance = None
    ImageFilter = None
    PIL_READY = False

# --- OFFLINE OCR ENGINE CONFIGURATION ---
TESSERACT_READY = False
tesseract_paths = [
    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
    r'C:\Users\\' + os.getenv('USERNAME', 'HP') + r'\AppData\Local\Tesseract-OCR\tesseract.exe',
    r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
    r'C:\Tesseract-OCR\tesseract.exe'
]

try:
    import pytesseract
    try:
        pytesseract.get_tesseract_version()
        TESSERACT_READY = True
    except Exception:
        found = False
        for path in tesseract_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                try:
                    pytesseract.get_tesseract_version()
                    TESSERACT_READY = True
                    found = True
                    break
                except Exception:
                    pass
except Exception:
    pass

SPACY_READY = False
nlp = None
try:
    import spacy  # type: ignore
    try:
        nlp = spacy.load("en_core_web_sm")
        SPACY_READY = True
    except Exception:
        pass
except Exception:
    pass

def extract_text_from_image(image_bytes: bytes) -> str:
    """Hybrid OCR extraction: Gemini Vision (primary) → Tesseract → OCR.Space fallback."""

    # --- 1. PRIMARY: Gemini Vision API (most accurate, works on Vercel) ---
    try:
        gemini_text = gemini_extract_text(image_bytes)
        if gemini_text and not gemini_text.startswith("ERROR:"):
            print("[OCR] Gemini Vision succeeded.")
            return gemini_text.strip()
        else:
            print(f"[OCR] Gemini failed: {gemini_text}")
    except Exception as e:
        print(f"[OCR] Gemini exception: {e}")

    # --- 2. SECONDARY: Local Tesseract (works on dev machine) ---
    if TESSERACT_READY and PIL_READY:
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(1.5)
            image = image.filter(ImageFilter.SHARPEN)
            text = pytesseract.image_to_string(image)
            if text.strip():
                print("[OCR] Tesseract succeeded.")
                return text.strip()
        except Exception as e:
            print(f"[OCR] Tesseract failed: {e}")

    # --- 3. FALLBACK: Free OCR.Space API ---
    try:
        response = requests.post(
            'https://api.ocr.space/parse/image',
            files={'filename': ('image.jpg', image_bytes, 'image/jpeg')},
            data={'apikey': 'helloworld', 'language': 'eng', 'isOverlayRequired': False},
            timeout=15
        )
        if response.status_code == 200:
            result = response.json()
            if not result.get('IsErroredOnProcessing'):
                text = ""
                for res in result.get('ParsedResults', []):
                    text += res.get('ParsedText', '') + "\n"
                if text.strip():
                    print("[OCR] OCR.Space succeeded.")
                    return text.strip()
    except Exception as e:
        print(f"[OCR] OCR.Space failed: {e}")

    return "ERROR: All OCR engines failed. Please upload a clearer prescription image."

def identify_medicines(text: str) -> list[dict]:
    import difflib
    if not text or text.startswith("ERROR:"): return []
    
    identified_map = {}
    if not medicine_catalog: return []

    clean_text = re.sub(r'[^a-zA-Z0-9]', ' ', text).lower()
    
    def add_match(match_name):
        for med in medicine_catalog:
            if med['name'].lower() == match_name.lower():
                identified_map[med['name']] = med
                return True
        return False

    if SPACY_READY and nlp:
        try:
            doc = nlp(text)
            for chunk in doc.noun_chunks:
                if len(chunk.text.strip()) > 3:
                    add_match(chunk.text.lower().strip())
            for token in doc:
                if not token.is_stop and not token.is_punct and len(token.text) > 3:
                    add_match(token.text.lower())
        except Exception:
            pass

    for med in medicine_catalog:
        name = med['name'].lower()
        if len(name) > 3:
            pattern = r'\b' + re.escape(name) + r'\b'
            if re.search(pattern, clean_text):
                add_match(name)

    ignore_words = {"tablet", "tab", "capsule", "cap", "syrup", "syr", "injection", "inj", "ointment", "cream", 
                    "mg", "ml", "dr", "doctor", "name", "age", "sex", "gender", "date", "time", "morning", 
                    "evening", "night", "daily", "once", "twice", "thrice", "days", "months", "years", "patient", 
                    "signature", "clinic", "hospital", "prescription", "dose", "dosage", "take", "after", "before", "meal",
                    "pain", "fever", "cough", "cold", "body", "headache", "blood", "sugar", "pressure"}
    
    tokens = [t for t in clean_text.split() if len(t) > 3 and t not in ignore_words]
    
    db_words = []
    for m in medicine_catalog:
        for word in m['name'].lower().split():
            if len(word) > 3 and word not in ignore_words:
                db_words.append((word, m['name']))
                
    dict_choices = [c[0] for c in db_words]

    for token in tokens:
        token_len = len(token)
        if token_len <= 5: dynamic_cutoff = 0.85
        elif token_len <= 7: dynamic_cutoff = 0.75
        else: dynamic_cutoff = 0.65
            
        matches = difflib.get_close_matches(token, dict_choices, n=1, cutoff=dynamic_cutoff)
        if matches:
            matched_string = matches[0]
            if abs(len(token) - len(matched_string)) <= 2:
                original_medicine_name = next(c[1] for c in db_words if c[0] == matched_string)
                add_match(original_medicine_name)
            
    return list(identified_map.values())

def get_ocr_status() -> dict:
    return {
        "pillow": PIL_READY,
        "tesseract": TESSERACT_READY,
        "spacy_nlp": SPACY_READY,
        "medicine_catalog_size": len(medicine_catalog) if medicine_catalog else 0,
        "engines_available": {
            "ocr": True, # Fallback active
            "nlp": SPACY_READY,
            "full_pipeline": True
        }
    }
