import os
import base64
import requests

def get_mime_type(image_bytes: bytes) -> str:
    if image_bytes.startswith(b'\x89PNG\r\n\x1a\n'):
        return 'image/png'
    elif image_bytes.startswith(b'\xff\xd8'):
        return 'image/jpeg'
    elif image_bytes.startswith(b'GIF87a') or image_bytes.startswith(b'GIF89a'):
        return 'image/gif'
    elif image_bytes.startswith(b'RIFF') and image_bytes[8:12] == b'WEBP':
        return 'image/webp'
    return 'image/jpeg' # fallback

def gemini_extract_text(image_bytes: bytes) -> str:
    """Use Gemini Vision API to extract text from a prescription image."""
    api_key = os.getenv("GEMINI_API_KEY", "AIzaSyCP0pJHOZ80KgTXQBDwlhtYR-c1iWb2YyU")
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-flash-latest:generateContent?key={api_key}"
    )

    b64_img = base64.b64encode(image_bytes).decode("utf-8")
    mime_type = get_mime_type(image_bytes)

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
                    {"inline_data": {"mime_type": mime_type, "data": b64_img}},
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
