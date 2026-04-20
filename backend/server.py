from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI, APIRouter
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="api")
# ---------- Models ----------

class CustomerCreate(BaseModel):
    full_name: str
    mobile: str
    address: str = ""

class OrderCreate(BaseModel):
    customer_name: str
    mobile: str
    address: str = ""
    booking_date: str
    prescription: Optional[dict] = None
    frame_price: float
    lens_name: str
    lens_price: float
    total_amount: float
    paid_amount: float = 0
    remaining_amount: float = 0
    payment_status: str = "pending"
    payments: List[dict] = []

class PaymentUpdate(BaseModel):
    amount: float
    method: str = "upi"

# ---------- Lens Data ----------

LENSES = [
    {
        "id": "blue-cut",
        "name": "Blue Cut Lens",
        "description": "Blocks harmful blue light from digital screens, providing enhanced visual comfort during prolonged device use.",
        "pros": ["Reduces eye strain", "Better sleep quality", "UV protection"],
        "cons": ["Slight yellow tint", "Higher cost than regular"],
        "price": 800,
        "image": "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400"
    },
    {
        "id": "anti-glare",
        "name": "Anti-Glare Lens",
        "description": "Minimizes reflections for crystal clear vision, perfect for driving and outdoor activities.",
        "pros": ["Reduced glare", "Better aesthetics", "Easier cleaning"],
        "cons": ["Scratches more visible", "Needs careful cleaning"],
        "price": 600,
        "image": "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=400"
    },
    {
        "id": "photochromic",
        "name": "Photochromic Lens",
        "description": "Automatically adapts to changing light conditions, transitioning from clear indoors to dark outdoors.",
        "pros": ["Indoor/outdoor versatility", "UV protection", "Convenience"],
        "cons": ["Slower transition in cold", "Doesn't darken in cars"],
        "price": 1500,
        "image": "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400"
    },
    {
        "id": "progressive",
        "name": "Progressive Lens",
        "description": "Seamless transition between near, intermediate, and far vision zones without visible lines.",
        "pros": ["No visible line", "All distances covered", "Modern look"],
        "cons": ["Adaptation period", "Peripheral distortion"],
        "price": 2500,
        "image": "https://images.unsplash.com/photo-1577803645773-f96470509666?w=400"
    }
]

# ---------- Routes ----------

@api_router.get("")
async def root():
    return {"message": "Lensshine API"}

@api_router.get("lenses")
async def get_lenses():
    return LENSES

@api_router.post("customers")
async def create_customer(data: CustomerCreate):
    existing = await db.customers.find_one({"mobile": data.mobile}, {"_id": 0})
    if existing:
        return existing
    doc = {
        "id": str(uuid.uuid4()),
        "full_name": data.full_name,
        "mobile": data.mobile,
        "address": data.address,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.customers.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.get("customers/search")
async def search_customers(mobile: str = Query(...)):
    customers = await db.customers.find(
        {"mobile": {"$regex": mobile}}, {"_id": 0}
    ).to_list(20)
    return customers

@api_router.post("orders")
async def create_order(data: OrderCreate):
    order_id = str(uuid.uuid4())
    doc = {
        "id": order_id,
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(doc)
    existing_cust = await db.customers.find_one({"mobile": data.mobile})
    if not existing_cust:
        cust_doc = {
            "id": str(uuid.uuid4()),
            "full_name": data.customer_name,
            "mobile": data.mobile,
            "address": data.address,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.customers.insert_one(cust_doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.get("orders")
async def get_orders(
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
):
    query = {}
    if status and status != "all":
        query["payment_status"] = status
    if date_from:
        query.setdefault("booking_date", {})["$gte"] = date_from
    if date_to:
        query.setdefault("booking_date", {})["$lte"] = date_to
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders

@api_router.get("orders/{order_id}")
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.patch("orders/{order_id}/payment")
async def update_payment(order_id: str, data: PaymentUpdate):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    new_paid = order["paid_amount"] + data.amount
    new_remaining = order["total_amount"] - new_paid
    status = "paid" if new_remaining <= 0 else "partial"
    payment_entry = {
        "amount": data.amount,
        "method": data.method,
        "date": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.update_one(
        {"id": order_id},
        {
            "$set": {
                "paid_amount": new_paid,
                "remaining_amount": max(0, new_remaining),
                "payment_status": status
            },
            "$push": {"payments": payment_entry}
        }
    )
    updated = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return updated

@api_router.post("orders/{order_id}/send-email")
async def send_invoice_email(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {
        "success": True,
        "message": f"Invoice email sent for order #{order_id[:8]} (simulated)"
    }

@api_router.get("dashboard/stats")
async def get_dashboard_stats(period: Optional[str] = "all"):
    query = {}
    if period == "today":
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        query["booking_date"] = today
    elif period == "month":
        month_prefix = datetime.now(timezone.utc).strftime("%Y-%m")
        query["booking_date"] = {"$regex": f"^{month_prefix}"}

    total_orders = await db.orders.count_documents(query)

    earnings_pipeline = [
        {"$match": query},
        {"$group": {
            "_id": None,
            "total_earned": {"$sum": "$paid_amount"},
            "total_billed": {"$sum": "$total_amount"}
        }}
    ]
    earnings_result = await db.orders.aggregate(earnings_pipeline).to_list(1)
    total_earned = earnings_result[0]["total_earned"] if earnings_result else 0
    total_billed = earnings_result[0]["total_billed"] if earnings_result else 0

    pending_pipeline = [
        {"$match": {**query, "payment_status": {"$in": ["pending", "partial"]}}},
        {"$group": {
            "_id": None,
            "pending_amount": {"$sum": "$remaining_amount"},
            "pending_count": {"$sum": 1}
        }}
    ]
    pending_result = await db.orders.aggregate(pending_pipeline).to_list(1)
    pending_amount = pending_result[0]["pending_amount"] if pending_result else 0
    pending_count = pending_result[0]["pending_count"] if pending_result else 0

    monthly_pipeline = [
        {"$group": {
            "_id": {"$substr": ["$booking_date", 0, 7]},
            "earnings": {"$sum": "$paid_amount"},
            "orders": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}},
        {"$limit": 12}
    ]
    monthly_data = await db.orders.aggregate(monthly_pipeline).to_list(12)

    return {
        "total_orders": total_orders,
        "total_earned": total_earned,
        "total_billed": total_billed,
        "pending_amount": pending_amount,
        "pending_count": pending_count,
        "monthly_data": [
            {"month": m["_id"], "earnings": m["earnings"], "orders": m["orders"]}
            for m in monthly_data
        ]
    }

@api_router.get("customers/{mobile}/orders")
async def get_customer_orders(mobile: str):
    orders = await db.orders.find(
        {"mobile": mobile}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    customer = await db.customers.find_one({"mobile": mobile}, {"_id": 0})
    return {"customer": customer, "orders": orders}

# ---------- App Setup ----------

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

