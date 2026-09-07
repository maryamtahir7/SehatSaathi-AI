# 🏆 SehatSaathi AI — Hackathon Presentation Guide
## Complete Slide-by-Slide PPT Blueprint

> **How to use this guide:** Create slides in Google Slides, Canva, or PowerPoint using this blueprint. Use a dark navy theme (`#0a1628`) with teal accents (`#0d9488`). The diagram images generated are ready to paste directly into your slides.

---

## DESIGN SYSTEM

- **Background:** `#0a1628` (Dark Navy)
- **Primary Text:** `#FFFFFF`
- **Accent Color:** `#0d9488` (Teal)
- **Secondary Accent:** `#10b981` (Green)
- **Warning/Problem:** `#ef4444` (Red)
- **Font Title:** Poppins Bold / Inter Bold
- **Font Body:** Inter Regular / DM Sans
- **Slide Size:** 16:9 Widescreen

---

## SLIDE 1 — COVER SLIDE

**Layout:** Full-bleed centered

### Content:
```
[Top center: Glowing medical cross icon]

SehatSaathi AI
Your Personal AI Healthcare Companion

Empowering Pakistan with Intelligent, Accessible Healthcare

[5 feature icons row: Brain | Stethoscope | Pill | Chat | Hospital]

🏆 Hackathon 2026  |  Team: [Your Name]  |  GitHub: maryamtahir7/SehatSaathi-AI
```

**Speaker Notes:**
> "Good [morning/afternoon], judges and fellow participants. I'm [Your Name], and today I'm presenting SehatSaathi AI — which in Urdu means your Health Companion. SehatSaathi is a full-stack, AI-powered healthcare platform that I've built to tackle one of Pakistan's most critical problems: the lack of accessible, affordable, and intelligent medical care for the majority of our population."

---

## SLIDE 2 — THE PROBLEM

**Layout:** Split with icons on left, text on right

### Content:
```
THE PROBLEM — Pakistan's Healthcare Crisis

⚠️  73% of rural Pakistan has NO access to specialists
⚠️  3-7 day average wait for diagnostic appointments
⚠️  Language barrier — 75% speak Urdu, not English
⚠️  Rs. 2,000-10,000 per specialist visit (unaffordable)
⚠️  Handwritten prescriptions → medication errors

"230 MILLION people deserve better healthcare"
```

**Speaker Notes:**
> "Pakistan is facing a severe healthcare crisis. With a doctor-to-patient ratio of 1:1,085 — nearly double the WHO danger threshold — and with 73% of rural citizens having no specialist access, people are suffering from preventable and treatable conditions simply because the system can't serve them. Add to this the language barrier — most medical resources are in English, while the majority of our population speaks Urdu — and we have a recipe for healthcare exclusion. This is what SehatSaathi AI is designed to solve."

---

## SLIDE 3 — OUR SOLUTION

**Layout:** 6 feature cards in a 3x2 grid

### Content:
```
SEHATSAATHI AI — 8 Integrated Healthcare Modules

🔬 AI Diagnostics        🩺 Symptom Checker
   MRI + X-Ray + Skin       132 symptoms, 41 diseases

🤖 AI Chat (Urdu/EN)    📜 Prescription OCR
   Groq LLaMA 3.3-70b      Offline Tesseract.js

💊 Pharmacy Store        🏥 Hospital Locator
   15,000+ medicines        OpenStreetMap

🥗 Diet Planner          📊 Admin Dashboard
   Disease-specific         Full analytics

"One platform. Every healthcare need."
```

**Speaker Notes:**
> "SehatSaathi AI is not just a single feature app. It's a complete healthcare ecosystem with 8 deeply integrated modules. From uploading an MRI scan and getting a clinical report in seconds, to chatting with an AI doctor in Urdu, to scanning a handwritten prescription with your phone camera and instantly ordering the medicines with cash on delivery — it covers the entire patient journey."

---

## SLIDE 4 — SYSTEM ARCHITECTURE

**Layout:** Full-width diagram image

### Content:
```
[INSERT: system_architecture diagram image]

Three-tier architecture:
CLIENT → FastAPI Backend → External Services

• React 19 + TanStack Start (SSR on Vercel)
• FastAPI Python with 6 specialized route modules
• ONNX ML models + Groq API + Appwrite Cloud
```

**Speaker Notes:**
> "Here's the system architecture. The frontend is a React 19 application with TanStack Start for server-side rendering, deployed on Vercel. It communicates with a FastAPI Python backend that hosts all the AI inference services. The backend integrates with three external services: Groq for the AI chat, Appwrite for authentication and the database, and our locally hosted ONNX models for the medical image analysis. One key architectural decision was using ONNX models instead of raw TensorFlow or PyTorch — this let us stay under Vercel's 250MB serverless bundle limit while still running genuine deep learning inference."

---

## SLIDE 5 — ML PIPELINE DEEP DIVE

**Layout:** Full-width diagram

### Content:
```
[INSERT: ml_pipeline_diagram image]

Brain MRI: 168×168×1 → braintumor.onnx → Glioma/Meningioma/Pituitary/Clear
Chest X-Ray: 224×224×3 → lung.onnx → Pneumonia / Healthy
Fallback: PIL Features → Centroid ML (JSON) → Classification

Training Accuracy:
• Brain Tumor CNN: ~99% (Jupyter notebook included)
• SVC Symptom Classifier: ~94%
```

**Speaker Notes:**
> "The medical image analysis pipeline is the technical crown jewel of this project. I trained CNNs on Kaggle's medical imaging datasets — achieving 99% accuracy on brain tumor classification. These models were then converted to ONNX format for efficient serverless deployment. The system auto-detects whether an uploaded image is an MRI or X-Ray by analyzing the mean pixel intensity. MRI scans tend to be darker, while X-rays are brighter. I also built a pure-JSON centroid ML fallback model that can classify images even without ONNX — using just pixel statistics, edge density, and asymmetry calculations — ensuring the system degrades gracefully."

---

## SLIDE 6 — USER FLOW

**Layout:** Horizontal flow diagram

### Content:
```
[INSERT: user_flow_diagram image]

STEP 1: Land → Sign Up (Appwrite Auth)
STEP 2: Upload scan OR Select symptoms OR Chat with AI
STEP 3: Get AI analysis / diagnosis in < 5 seconds
STEP 4: View medicines, diet, precautions
STEP 5: Add to cart → Checkout → COD delivery

"From symptom to medicine at your doorstep — one seamless journey"
```

**Speaker Notes:**
> "The user journey is designed to be frictionless. A patient lands on the app, can optionally sign up with Appwrite authentication, and then chooses their path: upload a medical scan, describe symptoms, chat with the AI, or scan their prescription. Within seconds they have a full clinical recommendation. The medicines suggested are directly linkable to the pharmacy where they can order with cash on delivery. This end-to-end integration is what makes SehatSaathi truly unique."

---

## SLIDE 7 — AI CHAT IN URDU

**Layout:** Phone mockup showing chat interface

### Content:
```
AI CHAT ASSISTANT — Bilingual Medical Support

English Mode:
User: "I have been having chest pain for 2 days"
SehatBot: "Chest pain lasting more than a few minutes
          can indicate several conditions including
          cardiac issues. Please seek emergency care
          if the pain is severe or spreading to the arm..."

اردو موڈ:
"آپ کا سینے میں درد سنجیدہ ہو سکتا ہے۔
 فوری طور پر ڈاکٹر سے ملیں۔"

Powered by: Groq LLaMA 3.3-70b (500+ tokens/sec)
```

**Speaker Notes:**
> "The AI chat assistant is powered by Groq's LLaMA 3.3-70b model — the fastest large language model inference available today. The system has carefully crafted system prompts that enforce medical safety: the AI will never prescribe medication, never make a definitive diagnosis, and always recommends seeing a real doctor for serious symptoms. What's unique is the full Urdu support — the user can switch languages mid-conversation, and the AI responds naturally in Urdu, which is crucial for the majority of our target population."

---

## SLIDE 8 — PRESCRIPTION OCR

**Layout:** Before/After split — prescription photo → extracted medicine table

### Content:
```
PRESCRIPTION OCR — From Photo to Order in Seconds

INPUT: Photo of handwritten prescription

PROCESSING: Tesseract.js WASM (100% offline, client-side)
            → Heuristic medicine pattern matching
            → Tab / Cap / Syp / Inj detection

OUTPUT: Structured medicine table
┌─────────────────┬─────────┬──────────┐
│ Medicine Name   │ Type    │ Action   │
├─────────────────┼─────────┼──────────┤
│ Amoxicillin 500 │ Capsule │ + Cart   │
│ Paracetamol 500 │ Tablet  │ + Cart   │
└─────────────────┴─────────┴──────────┘

"Add All to Cart" → Checkout → Delivered
```

**Speaker Notes:**
> "The prescription scanner is one of my favorite features because it solves a very real problem: handwritten doctor prescriptions are notoriously hard to read. Using Tesseract.js — a WebAssembly port of Google's OCR engine — the scanning happens 100% in the user's browser with no data sent to a server. This means it works offline and is completely private. If the local OCR fails on a very complex image, it automatically falls back to the OCR.space cloud API. The heuristic parser then identifies medicine-like lines and presents them in a clean, orderable table."

---

## SLIDE 9 — TECHNOLOGY STACK

**Layout:** 3-column grid of tech cards

### Content:
```
[INSERT: tech_stack_slide image]

FRONTEND              BACKEND & AI              INFRASTRUCTURE
React 19              FastAPI Python            Vercel (Edge)
TanStack Router       ONNX Runtime              Appwrite Cloud
TanStack Start        Groq LLaMA 3.3-70b        Node.js 24 (Nitro)
Framer Motion         Tesseract.js              Cloudflare DNS
Tailwind CSS          Pillow / PIL              GitHub CI/CD
Shadcn/UI             NumPy                     Docker
TypeScript            Custom ONNX Models        OpenStreetMap
Vite 8                scikit-learn (training)   Recharts
```

**Speaker Notes:**
> "The tech stack was carefully chosen for performance, cost, and scalability. On the frontend, React 19 with TanStack Start gives us server-side rendering for SEO and fast initial load. On the backend, FastAPI is blazing fast with async support. The ONNX Runtime allows us to run our trained neural networks in production without needing heavy frameworks like TensorFlow. Appwrite replaces Firebase as our backend service — it's open-source and can be self-hosted, avoiding vendor lock-in. The entire platform is deployed on Vercel's edge network for global low-latency."

---

## SLIDE 10 — LIVE DEMO SLIDE

**Layout:** Full screenshot of running app OR QR code

### Content:
```
LIVE DEMO

🌐 https://sehat-saathi-ai.vercel.app

[QR Code to live site]

Demo Flow:
1. Open /diagnostics → Upload sample MRI
2. Open /symptoms → Select fever, headache, nausea
3. Open /chat → Ask in Urdu
4. Open /prescription → Upload sample prescription

GitHub: github.com/maryamtahir7/SehatSaathi-AI
```

**Speaker Notes:**
> "Let me show you a live demo. [Navigate to diagnostics, upload a brain MRI sample] — you can see the system auto-detects this as an MRI scan. Within about 2 seconds, we get the clinical report back: it's detected a Glioma tumor with 92% confidence, along with an abnormality score, recommended medicines, diet plan, and precautions. [Switch to symptoms] — let me select fever, headache, and nausea — and we predict Typhoid with full recommendations. [Switch to chat] — let me ask a question in Urdu — watch how it responds naturally..."

---

## SLIDE 11 — IMPACT & METRICS

**Layout:** 4 large metric boxes

### Content:
```
IMPACT METRICS

┌─────────────────┐  ┌─────────────────┐
│   ~99%          │  │   132           │
│  Brain Tumor    │  │   Symptoms      │
│  Model Accuracy │  │   Supported     │
└─────────────────┘  └─────────────────┘
┌─────────────────┐  ┌─────────────────┐
│   15,000+       │  │   < 5 seconds   │
│   Medicines     │  │   Diagnosis     │
│   in Pharmacy   │  │   Time          │
└─────────────────┘  └─────────────────┘

Target Users: 230M+ Pakistanis
Languages: English + Urdu (RTL)
Deployment: Vercel Global CDN
Cost to User: FREE
```

**Speaker Notes:**
> "The numbers speak for themselves. Our brain tumor classifier achieves approximately 99% accuracy on the test set. The symptom checker covers 132 distinct symptoms mapping to 41 diseases. The pharmacy database contains over 15,000 real medicines. And all of this delivers results in under 5 seconds. Most importantly — it's completely free for the end user. This is how we democratize healthcare access."

---

## SLIDE 12 — CONCLUSION & FUTURE ROADMAP

**Layout:** Timeline on right, call-to-action on left

### Content:
```
WHAT WE'VE BUILT          WHAT'S NEXT

✅ 8 AI Healthcare Modules    v1.1 → Voice input (Web Speech API)
✅ 4 ONNX ML Models           v1.1 → WhatsApp Bot for rural users
✅ Bilingual EN/UR Support    v1.2 → Telemedicine video calls
✅ 15,000+ Medicine DB        v1.2 → Retinal/Blood scan analysis
✅ Live on Vercel             v2.0 → React Native mobile app
✅ Full E-Commerce Cart       v2.0 → Wearables integration
✅ Appwrite Auth              v2.0 → Govt. hospital API (DHQ PK)

"SehatSaathi AI — Making healthcare intelligent,
 accessible, and human for every Pakistani."

🌐 sehat-saathi-ai.vercel.app
📱 github.com/maryamtahir7/SehatSaathi-AI
```

**Speaker Notes:**
> "In conclusion, SehatSaathi AI represents a meaningful step forward in making healthcare genuinely accessible to all Pakistanis. We've built a complete, production-deployed platform with 8 AI healthcare modules, four trained ONNX models, full bilingual support, and a 15,000-medicine pharmacy — all free to use. The roadmap is ambitious: WhatsApp bot integration to reach rural users who may not have smartphones, telemedicine video calls, retinal scan analysis, and eventually a React Native mobile app with wearable device integration. Thank you — I'm happy to take any questions."

---

## JUDGE Q&A PREP

**Q: How accurate are your AI models?**
> "The brain tumor CNN achieves ~99% accuracy trained on the Kaggle dataset. The SVC symptom classifier achieves ~94%. I've included the full Jupyter training notebooks in the repository for full transparency."

**Q: What about medical liability?**
> "Every AI output includes mandatory clinical disclaimers. The chat AI is explicitly instructed to never prescribe medication or make definitive diagnoses. SehatSaathi is a decision-support tool, not a replacement for doctors — it helps patients understand their situation and get to the right specialist faster."

**Q: How does it run within Vercel's limits?**
> "By converting TensorFlow/PyTorch models to ONNX format, I reduced model sizes by 10-50x. The largest models are ~15MB each. I also use PIL instead of OpenCV for preprocessing, and CSV files instead of pandas — saving another 40MB. The total bundle stays well under Vercel's 250MB serverless limit."

**Q: Why Groq instead of OpenAI?**
> "Groq's LPU hardware achieves ~500 tokens per second inference — roughly 10x faster than OpenAI API. For a chat experience, speed is critical for user experience. Groq also has a generous free tier, making it ideal for a hackathon project that needs to scale."

**Q: Is this actually deployed?**
> "Yes — live at sehat-saathi-ai.vercel.app, deployed on Vercel with real ONNX models, real Appwrite auth, and real medicine data. Every feature you've seen in the slides works in production right now."

---

## SLIDE CREATION CHECKLIST

- [ ] Slide 1: Cover — paste `ppt_cover_slide` image
- [ ] Slide 2: Problem — paste `problem_solution_slide` (left half)
- [ ] Slide 3: Solution — paste `problem_solution_slide` (right half) or create feature grid
- [ ] Slide 4: Architecture — paste `system_architecture` image
- [ ] Slide 5: ML Pipeline — paste `ml_pipeline_diagram` image
- [ ] Slide 6: User Flow — paste `user_flow_diagram` image
- [ ] Slide 7: AI Chat — screenshot from live app
- [ ] Slide 8: OCR — screenshot from live app
- [ ] Slide 9: Tech Stack — paste `tech_stack_slide` image
- [ ] Slide 10: Live Demo — QR code + URL
- [ ] Slide 11: Impact Metrics — create metric cards
- [ ] Slide 12: Roadmap — timeline visual

## ALL DIAGRAM IMAGES (ready to use):

Located in: `C:\Users\HP\.gemini\antigravity-ide\brain\fc19194d-b52a-480e-a6cc-3c5819c8d537\`

1. `ppt_cover_slide_*.jpg` — Cover slide
2. `problem_solution_slide_*.jpg` — Problem vs Solution
3. `system_architecture_*.jpg` — Full system architecture
4. `ml_pipeline_diagram_*.jpg` — ML inference pipeline
5. `user_flow_diagram_*.jpg` — User journey flow
6. `tech_stack_slide_*.jpg` — Technology stack

---

*SehatSaathi AI — Hackathon 2026 Presentation*
