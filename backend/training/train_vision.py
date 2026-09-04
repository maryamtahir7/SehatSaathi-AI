import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models, transforms, datasets
from torch.utils.data import DataLoader
import os
import time

# --- CONFIGURATION ---
DATA_DIR = './data/medical_images'  # Must contain subfolders for each class (e.g. glioma_tumor, pneumonia)
MODEL_SAVE_PATH = '../models/medical_resnet.pth'
BATCH_SIZE = 32
EPOCHS = 10
LEARNING_RATE = 0.001

CLASSES = [
    "glioma_tumor", "meningioma_tumor", "pituitary_tumor", "tumor_unspecified", "no_tumor",
    "normal", "pneumonia", "tuberculosis", "covid19", "lung_opacity"
]

def main():
    if not os.path.exists(DATA_DIR):
        print(f"Error: Dataset directory {DATA_DIR} not found.")
        print("Please arrange your dataset in folders: data/medical_images/pneumonia/ image1.jpg ...")
        return

    print("Initializing ResNet50 Medical Transfer Learning Sequence...")
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using compute device: {device}")

    # 1. Data Augmentation and Normalization
    data_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    image_dataset = datasets.ImageFolder(DATA_DIR, data_transforms)
    dataloader = DataLoader(image_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=4)

    class_names = image_dataset.classes
    num_classes = len(class_names)
    print(f"Detected {num_classes} classes: {class_names}")

    # 2. Model Architecture
    model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
    
    # Freeze lower layers (optional)
    for param in model.parameters():
        param.requires_grad = False
        
    # Replace final fully connected layer for our specific classes
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, num_classes)
    model = model.to(device)

    # 3. Optimization Strategy
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.fc.parameters(), lr=LEARNING_RATE)

    # 4. Training Loop
    start_time = time.time()
    for epoch in range(EPOCHS):
        print(f"Epoch {epoch+1}/{EPOCHS}")
        print("-" * 10)
        
        model.train()
        running_loss = 0.0
        running_corrects = 0

        for inputs, labels in dataloader:
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()

            with torch.set_grad_enabled(True):
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                loss = criterion(outputs, labels)

                loss.backward()
                optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)

        epoch_loss = running_loss / len(image_dataset)
        epoch_acc = running_corrects.double() / len(image_dataset)

        print(f"Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}\n")

    time_elapsed = time.time() - start_time
    print(f"Training complete in {time_elapsed // 60:.0f}m {time_elapsed % 60:.0f}s")

    # 5. Save the trained weights for the Healthcare AI
    os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
    torch.save(model.state_dict(), MODEL_SAVE_PATH)
    print(f"Saved custom weights to {MODEL_SAVE_PATH}. Your neural image engine is now perfectly localized!")

if __name__ == '__main__':
    main()
