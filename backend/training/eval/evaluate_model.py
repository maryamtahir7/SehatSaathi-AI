import argparse
import json
from pathlib import Path
from typing import Dict, List

import numpy as np
import torch
from sklearn.metrics import classification_report, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score

from training.eval.threshold_policy import ConfidencePolicy
from training.models.common import ImagingCsvDataset, build_resnet50_classifier


def _invert_label_map(label_to_idx: Dict[str, int]) -> Dict[int, str]:
    return {idx: label for label, idx in label_to_idx.items()}


def _load_label_map(path: Path) -> Dict[str, int]:
    with path.open("r", encoding="utf-8") as f:
        return {k: int(v) for k, v in json.load(f).items()}


def _predict(model, dataloader, device):
    probs_all, preds_all, y_true_all = [], [], []
    model.eval()
    with torch.no_grad():
        for x, y in dataloader:
            x = x.to(device)
            logits = model(x)
            probs = torch.softmax(logits, dim=1).cpu().numpy()
            preds = probs.argmax(axis=1)
            probs_all.append(probs)
            preds_all.extend(preds.tolist())
            y_true_all.extend(y.numpy().tolist())

    return np.vstack(probs_all), np.array(preds_all), np.array(y_true_all)


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate MRI/X-ray model and export metrics.")
    parser.add_argument("--model-path", type=Path, required=True)
    parser.add_argument("--label-map", type=Path, required=True)
    parser.add_argument("--test-csv", type=Path, required=True)
    parser.add_argument("--modality", type=str, choices=["mri", "xray"], required=True)
    parser.add_argument("--output-metrics", type=Path, required=True)
    parser.add_argument("--output-confusion", type=Path, required=True)
    args = parser.parse_args()

    label_to_idx = _load_label_map(args.label_map)
    idx_to_label = _invert_label_map(label_to_idx)

    dataset = ImagingCsvDataset(args.test_csv, label_to_idx=label_to_idx, modality=args.modality)
    dataloader = torch.utils.data.DataLoader(dataset, batch_size=16, shuffle=False, num_workers=0)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = build_resnet50_classifier(num_classes=len(label_to_idx))
    model.load_state_dict(torch.load(args.model_path, map_location=device))
    model.to(device)

    probs, y_pred, y_true = _predict(model, dataloader, device)

    macro_precision = precision_score(y_true, y_pred, average="macro", zero_division=0)
    macro_recall = recall_score(y_true, y_pred, average="macro", zero_division=0)
    macro_f1 = f1_score(y_true, y_pred, average="macro", zero_division=0)
    weighted_f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)

    roc_auc = None
    if len(label_to_idx) > 2:
        try:
            roc_auc = roc_auc_score(y_true, probs, multi_class="ovr")
        except ValueError:
            roc_auc = None

    confidence_policy = ConfidencePolicy()
    max_conf = probs.max(axis=1)
    confidence_distribution = {
        "high": int(np.sum(max_conf >= confidence_policy.high_threshold)),
        "moderate": int(
            np.sum((max_conf >= confidence_policy.moderate_threshold) & (max_conf < confidence_policy.high_threshold))
        ),
        "uncertain": int(np.sum(max_conf < confidence_policy.moderate_threshold)),
    }

    report = classification_report(
        y_true, y_pred, target_names=[idx_to_label[i] for i in range(len(idx_to_label))], output_dict=True, zero_division=0
    )
    matrix = confusion_matrix(y_true, y_pred)

    args.output_metrics.parent.mkdir(parents=True, exist_ok=True)
    args.output_confusion.parent.mkdir(parents=True, exist_ok=True)

    payload = {
        "modality": args.modality,
        "samples": int(len(y_true)),
        "macro_precision": round(float(macro_precision), 6),
        "macro_recall": round(float(macro_recall), 6),
        "macro_f1": round(float(macro_f1), 6),
        "weighted_f1": round(float(weighted_f1), 6),
        "roc_auc_ovr": None if roc_auc is None else round(float(roc_auc), 6),
        "confidence_policy": confidence_policy.as_dict(),
        "confidence_distribution": confidence_distribution,
        "classification_report": report,
    }
    with args.output_metrics.open("w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    with args.output_confusion.open("w", encoding="utf-8") as f:
        json.dump({"labels": [idx_to_label[i] for i in range(len(idx_to_label))], "matrix": matrix.tolist()}, f, indent=2)

    print(f"Saved evaluation metrics to {args.output_metrics}")


if __name__ == "__main__":
    main()
