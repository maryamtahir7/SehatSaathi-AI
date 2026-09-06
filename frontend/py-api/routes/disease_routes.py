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
    
    # Get full recommendations (precautions, meds, diet, workout)
    recs = get_recommendations(disease) or {}
    
    # Map medications: recs['medicines'] is list of dicts with 'name' etc
    raw_meds = recs.get("medicines", [])
    medications = []
    for m in raw_meds[:5]:
        if isinstance(m, dict):
            medications.append({"name": m.get("name", ""), "price": m.get("price", 0)})
        elif isinstance(m, str):
            medications.append({"name": m, "price": 0})
    
    return {
        "disease": disease,
        "description": recs.get("description", ""),
        "precautions": recs.get("precautions", [])[:4],
        "medications": medications,
        "diets": recs.get("diet_plan", [])[:5],
        "workout": recs.get("workout_plan", [])[:3],
        "confidence": 0.90,
    }

@router.get("/recommendations/{disease}", response_model=RecommendationResponse)
def recommendations(disease: str, age: int = Query(None), gender: str = Query(None)):
    recs = get_recommendations(disease, age, gender)
    if not recs:
        raise HTTPException(status_code=404, detail="Recommendations not found for this disease")
    return recs
