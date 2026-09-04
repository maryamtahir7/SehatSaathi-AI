import argparse
import csv
import random
from collections import defaultdict
from pathlib import Path
from typing import Dict, List


def _read_metadata(path: Path) -> List[Dict]:
    with path.open("r", newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def _write_rows(path: Path, rows: List[Dict], fieldnames: List[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def _stratified_split(
    rows: List[Dict], val_ratio: float, test_ratio: float, seed: int
) -> Dict[str, List[Dict]]:
    groups: Dict[str, List[Dict]] = defaultdict(list)
    for row in rows:
        key = f"{row['modality']}::{row['label']}::{row.get('source_dataset', 'unknown')}"
        groups[key].append(row)

    rng = random.Random(seed)
    train, val, test = [], [], []

    for group_rows in groups.values():
        rng.shuffle(group_rows)
        total = len(group_rows)
        n_test = max(1, int(total * test_ratio)) if total >= 10 else max(0, int(total * test_ratio))
        n_val = max(1, int(total * val_ratio)) if total >= 10 else max(0, int(total * val_ratio))
        n_test = min(n_test, total)
        n_val = min(n_val, total - n_test)

        test.extend(group_rows[:n_test])
        val.extend(group_rows[n_test : n_test + n_val])
        train.extend(group_rows[n_test + n_val :])

    return {"train": train, "val": val, "test": test}


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate stratified imaging train/val/test CSV splits.")
    parser.add_argument(
        "--metadata",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "data" / "imaging" / "metadata.csv",
        help="Path to prepared metadata.csv",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "data" / "imaging" / "splits",
        help="Output directory for split CSVs.",
    )
    parser.add_argument("--val-ratio", type=float, default=0.15)
    parser.add_argument("--test-ratio", type=float, default=0.15)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    rows = _read_metadata(args.metadata)
    if not rows:
        raise ValueError(f"No metadata rows found at {args.metadata}")

    split = _stratified_split(rows, val_ratio=args.val_ratio, test_ratio=args.test_ratio, seed=args.seed)
    fields = list(rows[0].keys())

    for split_name, split_rows in split.items():
        _write_rows(args.output_dir / f"{split_name}.csv", split_rows, fields)
        print(f"{split_name}: {len(split_rows)} samples")


if __name__ == "__main__":
    main()
