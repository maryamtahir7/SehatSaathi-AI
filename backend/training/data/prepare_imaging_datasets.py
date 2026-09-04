import argparse
import csv
import hashlib
import imghdr
import json
import shutil
from pathlib import Path
from typing import Dict, List, Tuple


ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff", ".webp"}

MRI_LABEL_MAP = {
    "glioma": "glioma_tumor",
    "meningioma": "meningioma_tumor",
    "pituitary": "pituitary_tumor",
    "tumor": "tumor_unspecified",
    "notumor": "no_tumor",
    "normal": "no_tumor",
}

XRAY_LABEL_MAP = {
    "normal": "normal",
    "pneumonia": "pneumonia",
    "tuberculosis": "tuberculosis",
    "tb": "tuberculosis",
    "covid": "covid19",
    "opacity": "lung_opacity",
}


def _sha1_file(path: Path) -> str:
    hasher = hashlib.sha1()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def _safe_copy(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def _is_valid_image(path: Path) -> bool:
    if path.suffix.lower() not in ALLOWED_EXTENSIONS:
        return False
    try:
        with path.open("rb") as f:
            header = f.read(64)
        return imghdr.what(None, header) is not None
    except OSError:
        return False


def _normalize_label(raw_label: str, modality: str) -> str:
    key = raw_label.strip().lower().replace(" ", "").replace("-", "")
    if modality == "mri":
        return MRI_LABEL_MAP.get(key, "other_mri")
    return XRAY_LABEL_MAP.get(key, "other_xray")


def _detect_label_from_path(path: Path) -> str:
    parts = [p.lower() for p in path.parts]
    for part in reversed(parts):
        if part in {"train", "val", "test"}:
            continue
        if any(ch.isalpha() for ch in part):
            return part
    return "unknown"


def _collect_images(source_root: Path, modality: str, output_root: Path) -> Tuple[List[Dict], Dict]:
    metadata: List[Dict] = []
    seen_hashes: Dict[str, str] = {}
    duplicates = 0
    invalid_files = 0

    for file_path in source_root.rglob("*"):
        if not file_path.is_file():
            continue
        if not _is_valid_image(file_path):
            invalid_files += 1
            continue

        file_hash = _sha1_file(file_path)
        if file_hash in seen_hashes:
            duplicates += 1
            continue

        seen_hashes[file_hash] = str(file_path)
        raw_label = _detect_label_from_path(file_path.parent)
        label = _normalize_label(raw_label, modality)

        file_name = f"{file_hash}{file_path.suffix.lower()}"
        dst = output_root / "processed" / modality / label / file_name
        _safe_copy(file_path, dst)

        metadata.append(
            {
                "id": file_hash,
                "modality": modality,
                "label": label,
                "source_path": str(file_path),
                "processed_path": str(dst),
                "source_dataset": source_root.name,
            }
        )

    summary = {
        "modality": modality,
        "source": str(source_root),
        "samples": len(metadata),
        "duplicates_removed": duplicates,
        "invalid_skipped": invalid_files,
    }
    return metadata, summary


def _write_csv(path: Path, rows: List[Dict], fieldnames: List[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare MRI/X-ray datasets for multi-task training.")
    parser.add_argument("--mri-source", type=Path, required=True, help="Root folder for raw MRI images.")
    parser.add_argument("--xray-source", type=Path, required=True, help="Root folder for raw X-ray images.")
    parser.add_argument(
        "--output-root",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "data" / "imaging",
        help="Output root for processed imaging data.",
    )
    args = parser.parse_args()

    all_metadata: List[Dict] = []
    run_summary: List[Dict] = []

    for modality, source in [("mri", args.mri_source), ("xray", args.xray_source)]:
        metadata, summary = _collect_images(source_root=source, modality=modality, output_root=args.output_root)
        all_metadata.extend(metadata)
        run_summary.append(summary)

    metadata_csv = args.output_root / "metadata.csv"
    _write_csv(
        metadata_csv,
        all_metadata,
        ["id", "modality", "label", "source_dataset", "source_path", "processed_path"],
    )

    summary_path = args.output_root / "prepare_summary.json"
    summary_path.parent.mkdir(parents=True, exist_ok=True)
    with summary_path.open("w", encoding="utf-8") as f:
        json.dump(run_summary, f, indent=2)

    print(f"Prepared {len(all_metadata)} samples.")
    print(f"Metadata written to: {metadata_csv}")
    print(f"Summary written to: {summary_path}")


if __name__ == "__main__":
    main()
