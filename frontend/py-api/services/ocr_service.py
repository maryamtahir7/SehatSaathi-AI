# Reload Trigger: Pytesseract Installed
import io
import re
import os
import ast
import csv

from services.ml_service import medications_data

medicine_catalog = []
_unique_meds = set()

# 1. Load Kaggle Subset from ml_service
if medications_data:
    for row in medications_data:
        try:
            _meds_list = ast.literal_eval(row.get('Medication', ''))
            for _m in _meds_list:
                _unique_meds.add(str(_m).strip())
        except Exception:
            pass

# 2. Load Extended Proprietary Catalogs
from pathlib import Path

try:
    base_dir = Path(__file__).resolve().parents[1]
    
    # Dataset 1: Large generic medicine database
    med_db_path = base_dir / "data" / "medicine_dataset.csv"
    if med_db_path.exists():
        with open(med_db_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                med_name = row.get('Name')
                if med_name and len(med_name) > 2:
                    _unique_meds.add(med_name.strip())
                
    # Dataset 2: 11k+ specific commercial medicines
    details_db_path = base_dir / "data" / "Medicine_Details.csv"
    if details_db_path.exists():
        with open(details_db_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                med_name = row.get('Medicine Name')
                if med_name and len(med_name) > 2:
                    # Some medicines have long scientific names; we only take the primary brand name before space or parenthesis
                    primary_name = med_name.split()[0].split('(')[0]
                    if len(primary_name) > 2:
                        _unique_meds.add(primary_name.strip())
except Exception as e:
    print(f"OCR: Could not load extended medicine DBs: {e}")

medicine_catalog = [{'name': m} for m in _unique_meds if len(m) > 2]

try:
    from PIL import Image, ImageEnhance, ImageFilter
    PIL_READY = True
except Exception:
    Image = None
    ImageEnhance = None
    ImageFilter = None
    PIL_READY = False

# --- OFFLINE OCR ENGINE CONFIGURATION ---
TESSERACT_READY = False

# Deep Search for Tesseract on Windows
tesseract_paths = [
    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
    r'C:\Users\\' + os.getenv('USERNAME', 'HP') + r'\AppData\Local\Tesseract-OCR\tesseract.exe',
    r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
    r'C:\Tesseract-OCR\tesseract.exe'
]

try:
    import pytesseract
    # Try default PATH first
    try:
        pytesseract.get_tesseract_version()
        TESSERACT_READY = True
        print("OCR: Tesseract found in system PATH")
    except Exception:
        # Search common install directories
        found = False
        for path in tesseract_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                try:
                    pytesseract.get_tesseract_version()
                    TESSERACT_READY = True
                    found = True
                    print(f"OCR: Tesseract found at manual path: {path}")
                    break
                except Exception as e:
                    print(f"OCR: Tesseract found at {path} but version check failed: {e}")
        if not found:
            print("OCR: Tesseract NOT found in common locations or system PATH")
except Exception as e:
    print(f"OCR: Pytesseract module error: {e}")
    pass

# --- NLP ENGINE CONFIGURATION ---
SPACY_READY = False
nlp = None

try:
    import spacy  # type: ignore
    try:
        nlp = spacy.load("en_core_web_sm")
        SPACY_READY = True
    except Exception:
        # Fallback: try to download the model
        try:
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"], check=True, capture_output=True)
            nlp = spacy.load("en_core_web_sm")
            SPACY_READY = True
        except Exception:
            SPACY_READY = False
except Exception:
    SPACY_READY = False

def extract_text_from_image(image_bytes: bytes) -> str:
    """Offline OCR extraction using local Tesseract engine."""
    if not TESSERACT_READY or not PIL_READY:
        return "ERROR: Local OCR engine (Tesseract) is not installed or configured. Cloud OCR has been disabled for privacy."
    
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        # Enhance image for better OCR
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.5)
        image = image.filter(ImageFilter.SHARPEN)
        
        text = pytesseract.image_to_string(image)
        if not text.strip():
            return "ERROR: No text identified. The image might be blurry or empty."
        return text.strip()
    except Exception as e:
        return f"ERROR: OCR Engine Failure - {str(e)}"

def identify_medicines(text: str) -> list[dict]:
    """Enhanced medicine identification using NLP + fuzzy matching."""
    import difflib
    if not text or text.startswith("ERROR:"): return []
    
    identified_map = {}
    if not medicine_catalog: return []

    # Pre-clean
    clean_text = re.sub(r'[^a-zA-Z0-9]', ' ', text).lower()
    
    def add_match(match_name):
        for med in medicine_catalog:
            if med['name'].lower() == match_name.lower():
                identified_map[med['name']] = med
                return True
        return False

    # Method 1: spaCy NLP for entity extraction
    if SPACY_READY and nlp:
        try:
            doc = nlp(text)
            # Extract noun phrases and named entities that might be medicines
            for chunk in doc.noun_chunks:
                chunk_text = chunk.text.lower().strip()
                if len(chunk_text) > 3:
                    add_match(chunk_text)
            # Also check individual tokens
            for token in doc:
                if not token.is_stop and not token.is_punct and len(token.text) > 3:
                    add_match(token.text.lower())
        except Exception:
            pass  # Fall back to regex methods

    # Method 2: Direct substring matching using Word Boundaries
    for med in medicine_catalog:
        name = med['name'].lower()
        if len(name) > 3:
            # Only match the exact word
            pattern = r'\b' + re.escape(name) + r'\b'
            if re.search(pattern, clean_text):
                add_match(name)

    # Method 3: Dynamic Fuzzy matching for OCR spelling errors on handwriting
    # Ignore common prescription/medical terms that trigger false positives
    ignore_words = {"tablet", "tab", "capsule", "cap", "syrup", "syr", "injection", "inj", "ointment", "cream", 
                    "mg", "ml", "dr", "doctor", "name", "age", "sex", "gender", "date", "time", "morning", 
                    "evening", "night", "daily", "once", "twice", "thrice", "days", "months", "years", "patient", 
                    "signature", "clinic", "hospital", "prescription", "dose", "dosage", "take", "after", "before", "meal",
                    "pain", "fever", "cough", "cold", "body", "headache", "blood", "sugar", "pressure"}
    
    # Process tokens 4 characters or longer
    tokens = [t for t in clean_text.split() if len(t) > 3 and t not in ignore_words]
    
    # Pre-build a searchable vocabulary from the catalog to allow multi-word hits
    db_words = []
    for m in medicine_catalog:
        for word in m['name'].lower().split():
            if len(word) > 3 and word not in ignore_words:
                db_words.append((word, m['name']))
                
    dict_choices = [c[0] for c in db_words]

    for token in tokens:
        # DYNAMIC CUTOFF: Long medicine names are statistically unique, so we can allow more OCR typos (e.g. 65% match).
        # Short names require near-perfect OCR accuracy (e.g. 85% match) to avoid false-positives with English words.
        token_len = len(token)
        if token_len <= 5:
            dynamic_cutoff = 0.85
        elif token_len <= 7:
            dynamic_cutoff = 0.75
        else:
            dynamic_cutoff = 0.65
            
        matches = difflib.get_close_matches(token, dict_choices, n=1, cutoff=dynamic_cutoff)
        if matches:
            matched_string = matches[0]
            # Safety Check: Prevent matching totally different length words
            if abs(len(token) - len(matched_string)) <= 2:
                original_medicine_name = next(c[1] for c in db_words if c[0] == matched_string)
                add_match(original_medicine_name)
            
    return list(identified_map.values())

def get_ocr_status() -> dict:
    """Return status of OCR and NLP engines."""
    return {
        "pillow": PIL_READY,
        "tesseract": TESSERACT_READY,
        "spacy_nlp": SPACY_READY,
        "medicine_catalog_size": len(medicine_catalog) if medicine_catalog else 0,
        "engines_available": {
            "ocr": TESSERACT_READY and PIL_READY,
            "nlp": SPACY_READY,
            "full_pipeline": TESSERACT_READY and PIL_READY and SPACY_READY
        }
    }
