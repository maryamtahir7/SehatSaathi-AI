<div align="center">

# ?? SehatSaathi AI
### *Your Personal AI Healthcare Companion*

> **Empowering Pakistan & South Asia with Intelligent, Accessible, Bilingual Healthcare**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://sehat-saathi-ai.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/maryamtahir7/SehatSaathi-AI)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![ONNX](https://img.shields.io/badge/ONNX_Runtime-005CED?style=flat-square&logo=onnx&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Appwrite](https://img.shields.io/badge/Appwrite-FD366E?style=flat-square&logo=appwrite&logoColor=white)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [ML Pipeline](#ml-pipeline)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Models & AI](#models--ai)
- [Deployment](#deployment)

---

## Overview

**SehatSaathi AI** (Sehat = Health, Saathi = Companion in Urdu) is a full-stack, AI-powered healthcare web application built specifically for Pakistan and South Asia. It democratizes access to advanced medical diagnostics by putting hospital-grade AI tools directly into the hands of patients — accessible from any device, in any language, at any time.

The platform combines **custom-trained ONNX deep learning models**, **LLM-powered medical chat**, **offline OCR for prescription reading**, **ML-based symptom analysis**, and a **real-time pharmacy store** — all in one seamless, bilingual (English/Urdu) experience.

---

## Problem Statement

| Challenge | Impact |
|-----------|--------|
| 73% of rural Pakistan lacks specialist access | Delayed or missed diagnoses |
| Average diagnostic wait time: 3-7 days | Disease progression without treatment |
| Language barriers (Urdu-speaking majority) | Healthcare exclusion |
| Prescription misinterpretation | Medication errors |
| High cost of private specialist consultations | Financial burden on families |

---

## Key Features

### 1. AI Medical Image Diagnostics
Upload any MRI or chest X-ray image and get a full clinical report within seconds.
- **Brain MRI Analysis** — Classifies: Glioma, Meningioma, Pituitary Tumor, No Tumor
- **Chest X-Ray Analysis** — Classifies: Bacterial Pneumonia vs Healthy Lungs
- **Skin Analysis** — Detects: Acne, Melanoma, Eczema, Dark Spots, Wrinkles
- Powered by custom **ONNX models** (`braintumor.onnx`, `lung.onnx`, `skin.onnx`)
- Returns: Confidence score, Abnormality score, Medicines, Diet plan, Lab tests

### 2. Symptom Checker & Disease Prediction
Select from 132 symptoms and get an AI-predicted diagnosis with full recommendations.
- Powered by an **ONNX-optimized Support Vector Classifier (SVC)**
- Predicts across **41 diseases**
- Returns: Disease name, Description, Precautions, Medications, Diet, Workout plan

### 3. AI Medical Chat Assistant
Conversational AI for health questions in English or Urdu.
- Powered by **Groq LLaMA 3.3-70b** (fastest inference available)
- Contextual conversation history (last 10 turns)
- Auto-detects medicine mentions and surfaces **shoppable product cards**
- Culturally sensitive to South Asian healthcare context

### 4. Prescription OCR Scanner
Photograph a handwritten or printed prescription and get an orderable medicine list.
- Powered by **Tesseract.js** running 100% client-side (offline-capable)
- Falls back to **OCR.space cloud API** if local WASM fails
- Heuristic medicine detection (supports Tab, Cap, Syp, Inj, drops, topicals)
- One-click **Add All to Cart** directly from scan results

### 5. Pharmacy & Medicine Store
A full e-commerce pharmacy with real medicine data.
- **15,000+ medicines** from real Indian/Pakistani pharma dataset
- Search by name, browse by category
- Shopping cart with persistent local storage
- Checkout with Cash on Delivery (COD) support

### 6. Hospital Locator
Interactive map to find nearby hospitals.
- OpenStreetMap integration via React Leaflet
- Filter by city, specialty

### 7. Admin Dashboard
Full analytics dashboard for platform management.
- Order management, revenue metrics, AI model accuracy stats
- Role-based access via Appwrite labels

### 8. Bilingual Support (English / Urdu)
- Complete UI translation for both English and Urdu
- RTL layout auto-switches for Urdu
- AI chat supports Urdu responses natively

---

## System Architecture

```
+------------------------------------------------------------------+
|                        CLIENT (Browser)                          |
|  React 19 + TanStack Router/Start + Tailwind CSS + Framer Motion |
|  Deployed on Vercel (Node.js 24 via Nitro)                       |
+-----------------------------+------------------------------------+
                              | HTTP / REST API
                              v
+------------------------------------------------------------------+
|               FastAPI Python Backend (py-api)                    |
|  +---------------+  +--------------+  +----------------------+  |
|  |  Chat Routes  |  | Image Routes |  |   Disease Routes     |  |
|  | Groq LLaMA 3.3|  |ONNX Inference|  |  SVC ONNX Model      |  |
|  +---------------+  +--------------+  +----------------------+  |
|  +---------------+  +--------------+  +----------------------+  |
|  |  OCR Routes   |  |  Shop Routes |  |    Skin Routes       |  |
|  | Tesseract.js  |  |Medicine CSV  |  |  ONNX skin.onnx      |  |
|  +---------------+  +--------------+  +----------------------+  |
+----------+-------------------+---------------------+------------+
           |                   |                      |
           v                   v                      v
  +---------------+  +------------------+  +-------------------+
  |   Groq API    |  |  Appwrite Cloud  |  |  ONNX Model Files |
  | LLaMA 3.3-70b |  | Auth + Database  |  | braintumor.onnx   |
  |  (AI Chat)    |  | Orders, Reviews  |  | lung.onnx         |
  +---------------+  +------------------+  | skin.onnx svc.onnx|
                                           +-------------------+
```

---

## ML Pipeline

### Medical Image Analysis

```
Input Image (MRI / X-Ray / Skin)
          |
          v
    PIL Preprocessing
          |
    +-----+-----+
    |           |
    v           v
[X-Ray path] [MRI path]
lung.onnx   braintumor.onnx
224x224 RGB  168x168 Grayscale
    |           |
    v           v
 Binary     Softmax (3-4 classes)
 Classif.   Glioma / Meningioma
Pneumonia / Pituitary / No Tumor
Healthy
    |           |
    +-----+-----+
          v
   Confidence Score
   Abnormality Score
   Clinical Report
   Medicines + Diet
```

### Symptom Checker Pipeline

```
User selects symptoms (132 available)
          |
          v
One-hot encode -> [0,0,1,0,1,...] (132-dim vector)
          |
          v
    svc.onnx (ONNX Runtime)
    Support Vector Classifier
          |
          v
Predicted Disease (41 classes)
          |
          v
CSV Lookup: Description, Precautions,
Medications, Diet, Workout Plan
```

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI Framework |
| TanStack Router | Latest | File-based routing with type-safety |
| TanStack Start | Latest | SSR + Full-stack framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| Shadcn/UI | Latest | Accessible component library |
| Framer Motion | Latest | Animations & micro-interactions |
| Vite | 8.x | Build tool |
| Tesseract.js | 7.0 | Client-side OCR (offline) |
| React Leaflet | Latest | Hospital map |
| Recharts | Latest | Admin dashboard charts |

### Backend & AI
| Technology | Purpose |
|-----------|---------|
| FastAPI | Python REST API framework |
| ONNX Runtime | Run trained ML models in production |
| Pillow (PIL) | Medical image preprocessing |
| NumPy | Numerical computation |
| Groq SDK | LLaMA 3.3-70b AI chat inference |
| scikit-learn | SVC model training |
| TensorFlow/Keras | Neural network training |

### ONNX Models
| Model | Task | Input | Classes |
|-------|------|-------|---------|
| `braintumor.onnx` | Brain MRI classification | 168x168x1 grayscale | Glioma, Meningioma, Pituitary, No Tumor |
| `lung.onnx` | Chest X-Ray classification | 224x224x3 RGB | Pneumonia, Healthy Lungs |
| `skin.onnx` | Skin condition detection | 64x64x1 grayscale | Acne, Melanoma, Eczema |
| `svc.onnx` | Symptom to Disease | 132-dim one-hot vector | 41 diseases |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Vercel | Frontend + Nitro SSR deployment |
| Appwrite Cloud | Authentication, Database (Orders, Reviews) |
| Cloudflare | DNS, tunnel for local development |
| GitHub | Version control & CI/CD |

---

## Project Structure

```
SehatSaathi-AI/
+-- frontend/                    # Full-stack React app (TanStack Start)
|   +-- src/
|   |   +-- routes/              # File-based pages
|   |   |   +-- __root.tsx       # App shell, layout, providers
|   |   |   +-- index.tsx        # Landing page
|   |   |   +-- diagnostics.tsx  # Medical image analysis
|   |   |   +-- symptoms.tsx     # Symptom checker
|   |   |   +-- chat.tsx         # AI chat assistant
|   |   |   +-- prescription.tsx # OCR prescription scanner
|   |   |   +-- pharmacy.tsx     # Medicine store
|   |   |   +-- hospitals.tsx    # Hospital locator
|   |   |   +-- diet.tsx         # Diet planner
|   |   |   +-- admin.tsx        # Admin dashboard
|   |   +-- components/
|   |   |   +-- ui/              # Shadcn/UI primitives
|   |   |   +-- site/            # App-specific components
|   |   +-- lib/
|   |       +-- app-context.tsx  # Global state (cart, auth, lang)
|   |       +-- appwrite.ts      # Appwrite SDK client
|   |       +-- i18n.ts          # EN/UR translations
|   +-- py-api/                  # FastAPI Python backend
|       +-- index.py             # FastAPI app entry point
|       +-- routes/              # API route handlers
|       +-- services/            # Business logic / ML inference
|       +-- models/              # ONNX model files
|       +-- dataset/             # Kaggle medical datasets (CSV)
+-- backend/                     # Training Jupyter notebooks
+-- docs/                        # Project documentation
+-- .env.example                 # Environment variables template
+-- vercel.json                  # Vercel deployment config
+-- Dockerfile                   # Docker build config
+-- README.md
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- npm 10+

### 1. Clone the Repository
```bash
git clone https://github.com/maryamtahir7/SehatSaathi-AI.git
cd SehatSaathi-AI
```

### 2. Setup Environment Variables
```bash
cp .env.example frontend/py-api/.env.local
# Edit .env.local with your actual API keys
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 4. Install Python Dependencies
```bash
cd frontend/py-api
pip install fastapi uvicorn pillow onnxruntime numpy python-dotenv groq
```

### 5. Run the Python Backend
```bash
cd frontend/py-api
uvicorn index:app --reload --port 8000
```

### 6. Run the Frontend Dev Server
```bash
cd frontend
npm run dev
```

Visit http://localhost:3000

---

## Environment Variables

Create `frontend/py-api/.env.local` based on `.env.example`:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_BUCKET_ID=your_bucket_id
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## API Reference

### AI Chat
```
POST /api/assistant/chat
{ "message": "I have a headache", "language": "en", "history": [] }
```

### Medical Image Analysis
```
POST /analyze-medical-image
multipart/form-data: file=<image>, modality=auto|mri|xray
```

### Disease Prediction
```
POST /predict-disease
{ "symptoms": ["headache", "fever", "nausea"] }
```

### Medicine Search
```
GET /medicines/search?q=paracetamol
```

### Checkout
```
POST /checkout
{ "items": [...], "total": 300, "payment_method": "COD" }
```

---

## Models & AI

### Brain Tumor ONNX Model
- Architecture: CNN trained on Kaggle Brain MRI dataset (168x168x1)
- Training Accuracy: ~99%

### Lung/Pneumonia ONNX Model
- Architecture: CNN trained on Kaggle Chest X-Ray dataset (224x224x3)
- Binary classification: Pneumonia vs Healthy

### SVC Disease Classifier
- Algorithm: Support Vector Classifier (sklearn -> ONNX)
- Input: 132-dimensional one-hot symptom vector
- Output: One of 41 disease classes

---

## Deployment

The app auto-deploys on push to `master` via Vercel CI/CD.

```bash
vercel deploy --prod
```

---

**Built with heart for Pakistan - SehatSaathi AI**
*Making healthcare intelligent, accessible, and human.*
