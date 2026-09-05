from fastapi import APIRouter, HTTPException, Query
from models.schemas import SymptomRequest, PredictionResponse, RecommendationResponse
from services.ml_service import predict_disease, get_recommendations, get_all_symptoms

router = APIRouter(tags=["Disease Prediction & Medicine"])

@router.get("/symptoms")
def get_symptoms_list():
    symptoms = get_all_symptoms()
    return {"symptoms": symptoms}

@router.post("/predict-disease", response_model=PredictionResponse)
def predict(request: SymptomRequest):
    if not request.symptoms:
        raise HTTPException(status_code=400, detail="No symptoms provided")
    
    disease = predict_disease(request.symptoms)
    if isinstance(disease, str) and disease.startswith("Model not"):
        raise HTTPException(status_code=500, detail="Model initialization error")
        
    # Get short description
    recs = get_recommendations(disease)
    desc = recs['description'] if recs else "No description available."
    
    return {"disease": disease, "description": desc}

@router.get("/recommendations/{disease}", response_model=RecommendationResponse)
def recommendations(disease: str, age: int = Query(None), gender: str = Query(None)):
    recs = get_recommendations(disease, age, gender)
    if not recs:
        raise HTTPException(status_code=404, detail="Recommendations not found for this disease")
    return recs
