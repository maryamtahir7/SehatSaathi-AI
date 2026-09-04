import argparse
from pathlib import Path

import torch

from common import (
    TrainConfig,
    build_resnet50_classifier,
    create_dataloaders,
    infer_label_map,
    run_training,
    save_training_artifacts,
)


def main() -> None:
    parser = argparse.ArgumentParser(description="Train MRI tumor classification model.")
    parser.add_argument(
        "--splits-dir",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "data" / "imaging" / "splits",
    )
    parser.add_argument(
        "--artifact-dir",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "models" / "imaging",
    )
    parser.add_argument("--epochs", type=int, default=8)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=1e-4)
    args = parser.parse_args()

    train_csv = args.splits_dir / "train.csv"
    val_csv = args.splits_dir / "val.csv"

    label_to_idx = infer_label_map(train_csv, modality="mri")
    train_loader, val_loader = create_dataloaders(
        train_csv=train_csv,
        val_csv=val_csv,
        label_to_idx=label_to_idx,
        modality="mri",
        batch_size=args.batch_size,
    )

    model = build_resnet50_classifier(num_classes=len(label_to_idx))
    config = TrainConfig(epochs=args.epochs, batch_size=args.batch_size, learning_rate=args.lr)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model, history = run_training(model, train_loader, val_loader, config, device)

    save_training_artifacts(
        model=model,
        label_to_idx=label_to_idx,
        history=history,
        model_path=args.artifact_dir / "mri_model.pt",
        label_map_path=args.artifact_dir / "label_map_mri.json",
        metrics_path=args.artifact_dir / "metrics_mri.json",
    )
    print("MRI training complete.")


if __name__ == "__main__":
    main()
