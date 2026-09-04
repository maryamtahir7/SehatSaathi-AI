# SehatSaathi AI: Intelligent Healthcare Ecosystem

## Executive Summary
SehatSaathi AI is an enterprise-grade, comprehensive healthcare intelligence platform designed to bridge the gap between clinical diagnostics, telemedicine, and pharmaceutical accessibility. Built for the Alibaba Cloud Hackathon, the system leverages a modular microservices architecture, integrating advanced optical character recognition (OCR), high-precision computer vision (CV) diagnostics, and localized healthcare e-commerce.

By seamlessly coupling a Next.js (React) frontend with a highly optimized, serverless FastAPI Python backend, SehatSaathi AI ensures horizontal scalability, zero-latency inferences, and robust cross-platform accessibility. 

## System Architecture

The architecture is divided into decoupled services communicating via RESTful JSON APIs, enabling independent scaling and maintenance. The entire infrastructure is optimized for serverless deployment on Vercel, utilizing optimized heuristics and cloud endpoints to bypass standard payload constraints.

```mermaid
graph TD
    Client[Client Browser / Mobile] --> |HTTPS| Frontend[Next.js Application Edge]
    
    sublayer1[Frontend Ecosystem]
    Frontend --> Auth[OAuth2 / JWT Authentication]
    Frontend --> Redux[Client State Management]
    Frontend --> Storage[Local Caching & IndexedDB]
    end

    Frontend --> |API Requests| API_Gateway[Vercel Serverless Gateway]
    
    API_Gateway --> Backend[FastAPI Python Backend]
    
    sublayer2[Backend Microservices]
    Backend --> CV_Engine[Computer Vision & Pathology Engine]
    Backend --> OCR_Engine[Prescription Tokenization Engine]
    Backend --> NLP_Engine[Symptom NLP Processing]
    Backend --> LLM_Assistant[Groq-Powered Clinical Assistant]
    end
    
    CV_Engine --> Models[(Clinical ML Models & CV Heuristics)]
    OCR_Engine --> CloudOCR[OCR.Space Cloud API]
    NLP_Engine --> DB[(Appwrite BAAS / MongoDB)]
    
    Backend --> External[External Pharmacy & Market Providers]
```

## Core Modules & Capabilities

### 1. Medical Imaging & Pathology Diagnostics
The imaging engine accepts multi-modal uploads (MRI, X-Ray, Dermatological Scans). 
- **Pathology Routing**: Automatically classifies the modality of the scan based on brightness, contrast, and structural centroid mapping.
- **Diagnostic Fallbacks**: Features a multi-tiered diagnostic cascade. It primarily utilizes custom ResNet/CNN architectures and elegantly falls back to a mathematical Centroid-Distance heuristic engine (extracting parameters such as edge density, standard deviation, and localized asymmetry) if deep learning modules are constrained by deployment environments.

### 2. Optical Prescription Parsing (OCR)
- **Tokenization Pipeline**: Hand-written clinical prescriptions are upscaled, subjected to adaptive binarization, and parsed via cloud-optimized optical character recognition.
- **Pharmaceutical Mapping**: Extracted linguistic tokens undergo rigorous NLP (Natural Language Processing) and fuzzy-matching against an extensive, locally cached proprietary database of thousands of international medications.
- **Automated Routing**: Recognized molecules are immediately mapped to the e-commerce pharmacy module for rapid deployment to the patient.

### 3. Clinical Symptom Analysis
- Utilizes statistical models trained on the largest public datasets of disease symptoms. Patients input localized physical ailments, and the engine correlates the combinatorial vectors to probabilistically determine the underlying disease.
- Includes personalized dietary recommendations, contraindications, and specialist routing.

### 4. Interactive Healthcare Assistant
- Powered by Groq's high-throughput Llama architecture, this module provides continuous conversational support. It retains session context, evaluates localized health trends, and offers real-time guidance on medication dosages, interactions, and general well-being.

### 5. Pharmaceutical E-Commerce Engine
- A fully functional, low-latency marketplace built directly into the patient portal. 
- Features real-time inventory synchronization via Appwrite, dynamic cart state management, and direct integration with the Prescription Parser for an automated "Scan-to-Cart" pipeline.

## Technical Stack

- **Frontend Interface**: Next.js 14, React, TypeScript, Modular CSS
- **Backend Infrastructure**: Python 3.10, FastAPI, Uvicorn, Vercel Serverless
- **Machine Learning & Data Processing**: Pandas, NumPy, Scikit-Learn, Pillow
- **Database & Authentication**: Appwrite (BaaS)
- **External Intelligence**: Groq API, Cloud OCR API

## Deployment Instructions

SehatSaathi AI has been meticulously restructured for a unified, serverless deployment on Vercel. The entire Python microservice ecosystem is dynamically compiled as serverless functions alongside the Next.js frontend edge network.

1. Install dependencies and link the project to Vercel:
   ```bash
   cd frontend
   npm install
   npm i -g vercel
   vercel link
   ```

2. Deploy the unified application (Frontend + Backend):
   ```bash
   vercel --prod
   ```

*(The `vercel.json` configuration automatically routes `/api` traffic to the underlying FastAPI runtime, requiring zero manual proxy configuration).*
