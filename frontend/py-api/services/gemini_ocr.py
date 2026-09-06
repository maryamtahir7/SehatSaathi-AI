import os
import base64
import requests


def gemini_extract_text(image_bytes: bytes) -> str:
    """Use Gemini Vision API to extract text from a prescription image."""
    api_key = os.getenv("GEMINI_API_KEY", "AIzaSyCP0pJHOZ80KgTXQBDwlhtYR-c1iWb2YyU")
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-1.5-flash:generateContent?key={api_key}"
    )

    b64_img = base64.b64encode(image_bytes).decode("utf-8")

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": (
                            "This is a medical prescription image. "
                            "Please extract ALL text from it exactly as written, "
                            "especially medicine names, dosages, and instructions. "
                            "Return only the extracted text."
                        )
                    },
                    {"inline_data": {"mime_type": "image/jpeg", "data": b64_img}},
                ]
            }
        ],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 2048},
    }

    try:
        response = requests.post(url, json=payload, timeout=25)
        if response.status_code == 200:
            data = response.json()
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "")
            return "ERROR: Gemini returned empty result."
        else:
            return f"ERROR: Gemini API status {response.status_code}: {response.text[:200]}"
    except Exception as e:
        return f"ERROR: Gemini OCR failed: {str(e)}"

