import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple

import pandas as pd
import torch
import torch.nn as nn
from PIL import Image
from torch.utils.data import DataLoader, Dataset
from torchvision import models, transforms


class ImagingCsvDataset(Dataset):
    def __init__(self, csv_path: Path, label_to_idx: Dict[str, int], modality: str, image_size: int = 224):
        self.df = pd.read_csv(csv_path)
        self.df = self.df[self.df["modality"] == modality].reset_index(drop=True)
        self.label_to_idx = label_to_idx
        self.transform = transforms.Compose(
            [
                transforms.Resize((image_size, image_size)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ]
        )

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, idx: int):
        row = self.df.iloc[idx]
        image = Image.open(row["processed_path"]).convert("RGB")
        x = self.transform(image)
        y = self.label_to_idx[row["label"]]
        return x, y


def infer_label_map(train_csv: Path, modality: str) -> Dict[str, int]:
    df = pd.read_csv(train_csv)
    labels = sorted(df[df["modality"] == modality]["label"].unique().tolist())
    return {label: i for i, label in enumerate(labels)}


def create_dataloaders(
    train_csv: Path, val_csv: Path, label_to_idx: Dict[str, int], modality: str, batch_size: int
) -> Tuple[DataLoader, DataLoader]:
    train_ds = ImagingCsvDataset(train_csv, label_to_idx=label_to_idx, modality=modality)
    val_ds = ImagingCsvDataset(val_csv, label_to_idx=label_to_idx, modality=modality)
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0)
    return train_loader, val_loader


def build_resnet50_classifier(num_classes: int) -> nn.Module:
    model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)
    return model


@dataclass
class TrainConfig:
    epochs: int = 8
    learning_rate: float = 1e-4
    batch_size: int = 16
    patience: int = 3


def run_training(
    model: nn.Module,
    train_loader: DataLoader,
    val_loader: DataLoader,
    config: TrainConfig,
    device: torch.device,
):
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=config.learning_rate)
    model.to(device)

    best_val_loss = float("inf")
    best_state = None
    history: List[Dict] = []
    wait = 0

    for epoch in range(config.epochs):
        model.train()
        train_loss = 0.0
        train_correct = 0
        train_total = 0
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad()
            logits = model(x)
            loss = criterion(logits, y)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * x.size(0)
            train_correct += (logits.argmax(dim=1) == y).sum().item()
            train_total += x.size(0)

        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for x, y in val_loader:
                x, y = x.to(device), y.to(device)
                logits = model(x)
                loss = criterion(logits, y)
                val_loss += loss.item() * x.size(0)
                val_correct += (logits.argmax(dim=1) == y).sum().item()
                val_total += x.size(0)

        train_loss = train_loss / max(train_total, 1)
        val_loss = val_loss / max(val_total, 1)
        train_acc = train_correct / max(train_total, 1)
        val_acc = val_correct / max(val_total, 1)

        history.append(
            {
                "epoch": epoch + 1,
                "train_loss": round(train_loss, 6),
                "train_acc": round(train_acc, 6),
                "val_loss": round(val_loss, 6),
                "val_acc": round(val_acc, 6),
            }
        )

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_state = {k: v.cpu().clone() for k, v in model.state_dict().items()}
            wait = 0
        else:
            wait += 1
            if wait >= config.patience:
                break

    if best_state is not None:
        model.load_state_dict(best_state)

    return model, history


def save_training_artifacts(
    model: nn.Module,
    label_to_idx: Dict[str, int],
    history: List[Dict],
    model_path: Path,
    label_map_path: Path,
    metrics_path: Path,
) -> None:
    model_path.parent.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), model_path)

    with label_map_path.open("w", encoding="utf-8") as f:
        json.dump(label_to_idx, f, indent=2)

    metrics_payload = {
        "best_epoch": max(history, key=lambda x: x["val_acc"])["epoch"] if history else 0,
        "history": history,
    }
    with metrics_path.open("w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)
