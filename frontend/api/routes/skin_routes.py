from fastapi import APIRouter, UploadFile, File, HTTPException
from services.skin_service import analyze_skin_image, get_skin_analysis_status

router = APIRouter(tags=["Skin Analysis"])


@router.get("/api/medical/skin/status")
def skin_status():
    return get_skin_analysis_status()


@router.post("/api/medical/skin/analyze")
async def analyze_skin(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (jpg, png, etc.)")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    result = analyze_skin_image(contents)

    if "error" in result:
        status_code = 503 if result.get("status") == "model_error" else 422
        raise HTTPException(status_code=status_code, detail=result["error"])

    return result
