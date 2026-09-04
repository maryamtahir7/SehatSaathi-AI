from pydantic import BaseModel
from typing import List

class SymptomRequest(BaseModel):
    symptoms: List[str]
    age: int = 25
    gender: str = "Unspecified"

class PredictionResponse(BaseModel):
    disease: str
    description: str

class RecommendationResponse(BaseModel):
    disease: str
    description: str
    rationale: str = ""
    precautions: List[str] = []
    medicines: List[dict]
    lab_tests: List[str]
    diet_plan: List[str]
    workout_plan: List[str] = []

class MedicineDetail(BaseModel):
    name: str
    generic: str = ""
    strength: str = ""
    manufacturer: str = ""
    price: float = 0.0

class OCRResponse(BaseModel):
    extracted_text: str
    medicines_identified: List[MedicineDetail]


class TopPrediction(BaseModel):
    label: str
    confidence: float


class ImageAnalysisResponse(BaseModel):
    modality: str
    model_used: str
    predicted_condition: str
    top_predictions: List[TopPrediction]
    finding: str
    confidence: float
    abnormality_score: float
    extracted_features: List[float]
    confidence_band: str
    accuracy_target_met: bool
    quality_score: float
    detail_summary: str
    recommendations: List[str]
    full_clinical_report: dict = None
    clinical_disclaimer: str
