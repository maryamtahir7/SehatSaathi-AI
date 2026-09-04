import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env.local'))

# Import Modular Routes
from routes import disease_routes
from routes import image_routes
from routes import ocr_routes
from routes import shop_routes
from routes import chat_routes
from routes import skin_routes
from services.ocr_service import get_ocr_status
from services.image_service import get_image_ai_status
from services.skin_service import get_skin_analysis_status

app = FastAPI(
    title="SehatSaathi AI — Backend API",
    description="Intelligent healthcare platform: Medical imaging AI, symptom diagnosis, prescription OCR, AI assistant, and pharmacy services.",
    version="2.0.0"
)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production via env
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["System"])
def read_root():
    return {
        "name": "SehatSaathi AI",
        "version": "2.0.0",
        "status": "operational",
        "message": "Intelligent healthcare platform — AI diagnostics, imaging, pharmacy & more.",
        "endpoints": {
            "ai_assistant": "/api/assistant/chat",
            "skin_analysis": "/api/medical/skin/analyze",
            "image_analysis": "/analyze-medical-image",
            "disease_prediction": "/predict-disease",
            "prescription_ocr": "/scan-prescription",
            "medicine_search": "/medicines/search",
            "health_check": "/health/dependencies"
        }
    }


@app.get("/health/dependencies", tags=["System"])
def health_dependencies():
    """Comprehensive health check — all AI/ML dependency statuses."""
    groq_key = os.getenv("GROQ_API_KEY", "")
    return {
        "ocr": get_ocr_status(),
        "image_ai": get_image_ai_status(),
        "skin_ai": get_skin_analysis_status(),
        "ai_assistant": {
            "groq_configured": bool(groq_key),
            "model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        }
    }


# Register all routers
app.include_router(disease_routes.router)
app.include_router(image_routes.router)
app.include_router(ocr_routes.router)
app.include_router(shop_routes.router)
app.include_router(chat_routes.router)
app.include_router(skin_routes.router)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
