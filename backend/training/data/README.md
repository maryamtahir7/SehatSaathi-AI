# Imaging Data Pipeline

## 1) Prepare Raw Datasets

Place raw datasets from trusted sources in separate roots, for example:

- `D:/datasets/mri_brain_tumor/`
- `D:/datasets/chest_xray_abnormality/`

Expected layout is flexible as labels are inferred from folder names.

## 2) Build Clean Processed Dataset

Run:

```bash
python backend/training/data/prepare_imaging_datasets.py --mri-source "D:/datasets/mri_brain_tumor" --xray-source "D:/datasets/chest_xray_abnormality"
```

This step:
- validates image files
- removes duplicates (hash-based)
- normalizes labels to canonical classes
- copies images into `backend/data/imaging/processed/...`
- writes `backend/data/imaging/metadata.csv`

## 3) Create Stratified Splits

```bash
python backend/training/data/split_imaging_dataset.py
```

This writes:
- `backend/data/imaging/splits/train.csv`
- `backend/data/imaging/splits/val.csv`
- `backend/data/imaging/splits/test.csv`
