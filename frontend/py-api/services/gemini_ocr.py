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
    """Use Groq Vision API to extract text from a prescription image (Function kept same name for compatibility)."""
    api_key = os.getenv("GROQ_API_KEY", "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")
    url = "https://api.groq.com/openai/v1/chat/completions"

    b64_img = base64.b64encode(image_bytes).decode("utf-8")
    mime_type = get_mime_type(image_bytes)

    payload = {
        "model": "llama-3.2-90b-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "This is a medical prescription image. Please extract ALL text from it exactly as written, especially medicine names, dosages, and instructions. Return only the extracted text. Do not add any conversational text."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{b64_img}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 1500,
        "temperature": 0.1
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=25)
        if response.status_code == 200:
            data = response.json()
            return data["choices"][0]["message"]["content"]
        else:
            return f"ERROR: Groq API status {response.status_code}: {response.text[:200]}"
    except Exception as e:
        return f"ERROR: Groq OCR failed: {str(e)}"
