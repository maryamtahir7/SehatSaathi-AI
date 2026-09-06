import os
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env.local'))

router = APIRouter(tags=["AI Assistant"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
_GROQ_MODEL = os.getenv("GROQ_MODEL", "")

def get_active_groq_model():
    global _GROQ_MODEL
    if _GROQ_MODEL:
        return _GROQ_MODEL
        
    if not GROQ_API_KEY:
        return "llama-3.3-70b-versatile"
        
    try:
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}
        response = requests.get("https://api.groq.com/openai/v1/models", headers=headers, timeout=5)
        if response.status_code == 200:
            models = response.json().get("data", [])
            # Prioritize standard models over preview/deprecated ones
            preferred = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]
            available_ids = [m["id"] for m in models]
            
            for p in preferred:
                if p in available_ids:
                    _GROQ_MODEL = p
                    return p
            
            # If no preferred model is found, just use the first available one
            if available_ids:
                _GROQ_MODEL = available_ids[0]
                return _GROQ_MODEL
    except Exception as e:
        print(f"Error fetching Groq models: {e}")
        
    # Fallback default
    _GROQ_MODEL = "llama-3.3-70b-versatile"
    return _GROQ_MODEL

SYSTEM_PROMPT_EN = """You are SehatSaathi AI, an intelligent healthcare assistant developed to support patients and caregivers in Pakistan and South Asia.

Your role:
- Answer health and medical questions clearly, accurately, and compassionately
- Explain symptoms, conditions, medications, and general wellness topics
- Suggest when to seek professional medical help
- Provide information about nutrition, exercise, and preventive care

Critical rules:
- NEVER prescribe medication or specific dosages
- NEVER make a definitive diagnosis
- ALWAYS recommend consulting a qualified doctor for serious symptoms
- NEVER fabricate medical facts or statistics
- If asked about emergencies, urge the user to call emergency services immediately
- Be warm, empathetic, and culturally sensitive to South Asian context

Always end serious health advice with: "Please consult a qualified healthcare professional for an accurate diagnosis and treatment plan."
"""

SYSTEM_PROMPT_UR = """آپ سیہت ساتھی اے آئی ہیں، پاکستان اور جنوبی ایشیا کے مریضوں اور دیکھ بھال کرنے والوں کی مدد کے لیے تیار کردہ ذہین صحت کا معاون۔

آپ کا کردار:
- صحت اور طبی سوالات کے واضح، درست اور ہمدردانہ جوابات دیں
- علامات، بیماریوں، ادویات اور صحت کے موضوعات کی وضاحت کریں
- بتائیں کہ کب پیشہ ور طبی مدد لینی چاہیے
- غذائیت، ورزش اور احتیاطی نگہداشت کے بارے میں معلومات دیں

اہم اصول:
- کبھی بھی دوا یا خوراک تجویز نہ کریں
- کبھی بھی حتمی تشخیص نہ کریں
- سنگین علامات کے لیے ہمیشہ ڈاکٹر سے ملنے کا مشورہ دیں
- طبی حقائق یا اعداد و شمار نہ گھڑیں
- ہنگامی صورتحال میں فوری طبی مدد کا مشورہ دیں

ہمیشہ اردو میں جواب دیں۔
"""


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    language: str = "en"  # "en" or "ur"
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    response: str
    model: str
    language: str
    products: Optional[List[dict]] = []


@router.post("/api/assistant/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI Assistant not configured. Please set GROQ_API_KEY in environment."
        )

    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)

        system_prompt = SYSTEM_PROMPT_UR if request.language == "ur" else SYSTEM_PROMPT_EN

        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history (last 10 turns max)
        if request.history:
            for msg in request.history[-10:]:
                messages.append({"role": msg.role, "content": msg.content})

        # Add current user message
        messages.append({"role": "user", "content": request.message})

        active_model = get_active_groq_model()
        response = client.chat.completions.create(
            model=active_model,
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
        )

        reply = response.choices[0].message.content

        # --- Medicine Product Lookup ---
        # Check if the user asked about a medicine; if so, return matching products
        products = []
        try:
            import csv, re, os as _os
            base = _os.path.join(_os.path.dirname(__file__), '..', 'data', 'Medicine_Details.csv')
            if _os.path.exists(base):
                # Extract potential medicine words (capitalized or known med pattern)
                words = re.findall(r'\b[A-Z][a-z]{2,}\b|\b[a-z]{4,}\b', request.message)
                query_lower = request.message.lower()
                matches = []
                with open(base, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        name = row.get('Medicine Name', '')
                        if not name:
                            continue
                        name_lower = name.lower()
                        if any(w.lower() in name_lower or name_lower.startswith(w.lower()) for w in words if len(w) > 3):
                            matches.append(row)
                        if len(matches) >= 3:
                            break

                for m in matches[:3]:
                    try:
                        price_str = str(m.get('Price', '100')).replace('Rs', '').replace(',', '').strip()
                        price = float(price_str) if price_str else 100.0
                    except Exception:
                        price = 100.0
                    products.append({
                        'id': m.get('Medicine Name', '').replace(' ', '_').lower(),
                        'name': m.get('Medicine Name', ''),
                        'price': price,
                        'image_url': m.get('Image URL', '') or None,
                    })
        except Exception as pe:
            print(f"[Chat] Product lookup error: {pe}")

        return {
            "response": reply,
            "model": active_model,
            "language": request.language,
            "products": products,
        }

    except Exception as e:
        error_msg = str(e)
        if "api_key" in error_msg.lower() or "authentication" in error_msg.lower():
            raise HTTPException(status_code=401, detail="Invalid GROQ_API_KEY.")
        if "model" in error_msg.lower():
            raise HTTPException(status_code=400, detail=f"Model error: {error_msg}")
        raise HTTPException(status_code=500, detail=f"AI Assistant error: {error_msg}")
