from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from services.ml_service import get_medicine_details
import uuid
import datetime

router = APIRouter(tags=["Pharmacy Store"])


@router.get("/medicines/all")
def get_all_medicines(limit: int = 40):
    try:
        from services.ml_service import MED_DB_PATH
        import csv
        import random
        results = []
        if os.path.exists(MED_DB_PATH):
            with open(MED_DB_PATH, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                rows = list(reader)
                random.seed(42)  # for consistency
                random.shuffle(rows)
                for row in rows[:limit]:
                    price = 0.0
                    if 'price' in row and row['price']:
                        try:
                            price = float(row['price'])
                        except:
                            price = float(random.randint(2, 20) * 100)
                    else:
                        price = float(random.randint(2, 20) * 100)
                        
                    results.append({
                        "id": str(random.randint(1000, 9999)),
                        "name": str(row.get('Medicine Name', 'Medicine')),
                        "brand": str(row.get('Manufacturer', 'Verified Pharma')),
                        "generic": str(row.get('Composition', '')),
                        "price": price,
                        "category": "Prescription" if "tablet" in str(row.get('Medicine Name', '')).lower() else "Vitamins",
                        "emoji": "💊",
                        "rating": round(random.uniform(4.0, 5.0), 1),
                        "tag": "Bestseller" if random.random() > 0.8 else None
                    })
        return results
    except Exception as e:
        return []

@router.get("/medicines/search")
def search_medicine(q: str = Query(..., description="Medicine name to search for")):
    details = get_medicine_details(q)
    if not details:
        return {
            "name": q.capitalize(),
            "generic": "Consult pharmacist for composition",
            "strength": "Standard",
            "manufacturer": "Verified Pharmaceutical",
            "price": 450.0,
            "unit": "Pack",
            "found": False
        }
    details["found"] = True
    return details


class CheckoutRequest(BaseModel):
    items: list[dict]
    total: float
    payment_method: str = "COD"


@router.post("/checkout")
def checkout_cart(request: CheckoutRequest):
    if not request.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    if request.total <= 0:
        raise HTTPException(status_code=400, detail="Invalid order total")

    order_id = f"SS-{datetime.datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

    return {
        "status": "success",
        "order_id": order_id,
        "message": "Order placed successfully via Cash on Delivery.",
        "payment_method": "Cash on Delivery",
        "estimated_delivery": "2-3 business days",
        "items_count": len(request.items),
        "total": request.total,
        "note": "Our team will contact you to confirm your order."
    }
