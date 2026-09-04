# AI-Based Healthcare Diagnosis and Recommendation System

This frontend is part of an AI-powered healthcare platform that combines machine learning and deep learning (ResNet50) to support disease prediction, medical image analysis, prescription understanding, and medicine purchase workflows.

## System Description

The system allows users to:

- Enter symptoms (fever, headache, fatigue, chest pain, etc.) for disease prediction
- Upload medical images (X-ray, MRI, prescription scans)
- Get disease, medicine, lab test, and diet recommendations
- Extract medicine names from prescription images using OCR + NLP
- Purchase recommended/prescribed medicines from an integrated e-commerce module

## System Workflow

### 1) Symptom-Based Input

Users enter symptoms in the diagnose flow.

### 2) Disease Prediction (Machine Learning)

A trained ML classifier predicts probable diseases and confidence scores.

### 3) Medical Image Analysis (ResNet50)

A pre-trained ResNet50 model is used for medical image feature extraction and pattern recognition:

- Feature extraction from images
- Pattern recognition (normal vs abnormal)
- Support for disease classification

### 4) Medicine Recommendation Module

The system maps predicted diseases to suitable medicines from a structured dataset.

### 5) Lab Test Recommendation

Relevant medical tests are suggested for further diagnosis support.

### 6) Diet Recommendation Module

Personalized diet suggestions are provided according to diagnosed conditions.

### 7) Prescription OCR + NLP Module

Uploaded prescriptions are processed to extract text and identify medicine names.

- OCR: Tesseract OCR
- NLP: spaCy

### 8) Medicine Purchase System (E-Commerce)

Users can browse, add to cart, and checkout medicines directly on the platform.

## System Modules

- Symptom-based Disease Prediction (ML Models)
- Medical Image Classification (ResNet50 Deep Learning)
- Medicine Recommendation System
- Lab Test Recommendation System
- Diet Recommendation System
- Prescription OCR + NLP System
- Medicine E-Commerce System

## Technology Stack

- Backend: FastAPI
- Frontend: React / Next.js
- Deep Learning: ResNet50
- Machine Learning: Scikit-learn
- OCR: Tesseract OCR
- NLP: spaCy

## Key Features

- Hybrid AI system (ML + Deep Learning)
- Symptom-based disease prediction
- Medical image analysis using ResNet50
- Prescription scanning and medicine extraction
- Medicine recommendation and purchase system
- Fully offline design (no external API dependency)

## Frontend Setup

Run in development mode:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.
