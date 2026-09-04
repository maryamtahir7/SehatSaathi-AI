from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from models.schemas import ImageAnalysisResponse
from services.image_service import analyze_medical_image

router = APIRouter(tags=["Medical Image Analysis (MRI & X-Ray)"])

@router.post("/analyze-medical-image", response_model=ImageAnalysisResponse)
async def analyze_image(
    modality: str = Form("xray"),
    file: UploadFile = File(...),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    result = analyze_medical_image(contents, modality=modality)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
        
    return result
