from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import OCRResponse
from services.ocr_service import extract_text_from_image, identify_medicines

router = APIRouter(tags=["Prescription Scanner (OCR)"])

@router.post("/scan-prescription", response_model=OCRResponse)
async def scan_prescription(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    contents = await file.read()
    extracted_text = extract_text_from_image(contents)
    
    if extracted_text.startswith("ERROR:"):
        return {"extracted_text": extracted_text, "medicines_identified": []}
        
    medicines = identify_medicines(extracted_text)
    
    return {
        "extracted_text": extracted_text,
        "medicines_identified": medicines
    }
