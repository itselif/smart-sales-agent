from fastapi import APIRouter
from pydantic import BaseModel
from config.settings import get_llm, database
from typing import List, Optional
import traceback

router = APIRouter(prefix="/ai", tags=["AI"])

class AIRequest(BaseModel):
    message: str
    context: str | None = None

@router.post("/query")
async def query_ai(request: AIRequest):
    try:
        from agents.orchestrator import Orchestrator

        llm = get_llm()
        orchestrator = Orchestrator(llm)

        # route() metodunun async olup olmadığını kontrol et
        try:
            # Önce async olarak çağırmayı dene
            if hasattr(orchestrator.route, '__call__'):
                import inspect
                if inspect.iscoroutinefunction(orchestrator.route):
                    # Async ise await ile çağır
                    result = await orchestrator.route(
                        user_input=request.message,
                        context=request.context
                    )
                else:
                    # Sync ise direkt çağır
                    result = orchestrator.route(
                        user_input=request.message,
                        context=request.context
                    )
            else:
                result = orchestrator.route(
                    user_input=request.message,
                    context=request.context
                )
                
        except TypeError as e:
            # Eğer await hatası alırsak, sync olarak dene
            print(f"Await error, trying sync: {e}")
            result = orchestrator.route(
                user_input=request.message,
                context=request.context
            )

        return result
        
    except Exception as e:
        error_msg = f"Error in query_ai: {str(e)}"
        print(error_msg)
        traceback.print_exc()
        
        return {
            "agent": "error",
            "response": f"An error occurred while processing your request: {str(e)}",
            "error": str(e),
            "publicUrl": None,
            "downloadUrl": None,
            "meta": {
                "planner": "error_handler",
                "summarizer": "error_handler",
                "cached": False
            }
        }

inventory_router = APIRouter(tags=["Inventory"])

class ProductResponse(BaseModel):
    id: str
    product_id: str
    name: str
    price: Optional[float] = None
    store_id: str
    current_stock: Optional[float] = 0.0
    avg_daily_sales: Optional[float] = 0.0
    safety_stock: Optional[float] = 0.0
    lead_time_days: Optional[int] = 0
    estimated_days_left: Optional[float] = None
    sales_trend: Optional[str] = "stable"
    reorder_qty_suggestion: Optional[int] = 0
    is_critical: bool = False

class StockResponse(BaseModel):
    store_id: str
    products: List[ProductResponse]
    summary: Optional[dict] = None

@inventory_router.get("/inventory/stock", response_model=StockResponse)
async def get_stock(store_id: str):
    try:
        query = "SELECT * FROM products WHERE store_id = :store_id"
        rows = await database.fetch_all(query=query, values={"store_id": store_id})
        products = []
        
        for row in rows:
            product = dict(row)
            
            # Temel alanları ayarla
            current_stock = product.get("current_stock") or 0.0
            avg_daily_sales = product.get("avg_daily_sales") or 0.0
            safety_stock = product.get("safety_stock") or 0.0
            lead_time_days = product.get("lead_time_days") or 0
            
            # Hesaplanmış alanlar (basit versiyon)
            estimated_days_left = None
            if avg_daily_sales > 0:
                estimated_days_left = round(current_stock / avg_daily_sales, 1)
            
            sales_trend = "stable"
            if estimated_days_left is not None:
                if estimated_days_left <= 7:
                    sales_trend = "decreasing"
                elif estimated_days_left >= 30:
                    sales_trend = "increasing"
            
            reorder_qty_suggestion = max(0, int(safety_stock + avg_daily_sales * lead_time_days - current_stock))
            is_critical = estimated_days_left is not None and estimated_days_left <= 7
            
            product_data = {
                "id": str(product.get("id") or product.get("product_id") or ""),
                "product_id": str(product.get("product_id") or product.get("id") or ""),
                "name": str(product.get("name") or ""),
                "price": product.get("price"),
                "store_id": str(product.get("store_id") or store_id),
                "current_stock": float(current_stock),
                "avg_daily_sales": float(avg_daily_sales),
                "safety_stock": float(safety_stock),
                "lead_time_days": int(lead_time_days),
                "estimated_days_left": estimated_days_left,
                "sales_trend": sales_trend,
                "reorder_qty_suggestion": int(reorder_qty_suggestion),
                "is_critical": bool(is_critical)
            }
            
            # None değerleri temizle
            product_data = {k: v for k, v in product_data.items() if v is not None}
            products.append(product_data)
        
        # Summary hesapla
        if products:
            total_products = len(products)
            critical_count = sum(1 for p in products if p.get("is_critical"))
            low_stock_count = sum(1 for p in products if p.get("estimated_days_left") and p.get("estimated_days_left") <= 30)
            
            summary = {
                "total_products": total_products,
                "critical_count": critical_count,
                "low_stock_count": low_stock_count
            }
        else:
            summary = None
        
        return {
            "store_id": store_id,
            "products": products,
            "summary": summary
        }
        
    except Exception as e:
        print(f"Error in get_stock: {e}")
        traceback.print_exc()
        return {
            "store_id": store_id,
            "products": [],
            "summary": None
        }

@inventory_router.get("/inventory/items", response_model=StockResponse)
async def get_inventory_items(store_id: str):
    try:
        query = "SELECT * FROM products WHERE store_id = :store_id"
        rows = await database.fetch_all(query=query, values={"store_id": store_id})
        products = []
        
        for row in rows:
            product = dict(row)
            current_stock = product.get("current_stock") or 0
            avg_daily_sales = product.get("avg_daily_sales") or 0
            safety_stock = product.get("safety_stock") or 0
            lead_time_days = product.get("lead_time_days") or 0

            # Days Left
            estimated_days_left = None
            if avg_daily_sales > 0:
                estimated_days_left = round(current_stock / avg_daily_sales, 1)

            # Trend
            sales_trend = "stable"
            if estimated_days_left is not None:
                if estimated_days_left <= 7:
                    sales_trend = "decreasing"
                elif estimated_days_left >= 30:
                    sales_trend = "increasing"

            # Reorder Qty
            reorder_qty_suggestion = max(0, int(safety_stock + avg_daily_sales * lead_time_days - current_stock))

            # Critical stock kontrolü
            is_critical = estimated_days_left is not None and estimated_days_left <= 7

            # Product dict'i
            product_data = {
                "id": str(product.get("id") or product.get("product_id") or ""),
                "product_id": str(product.get("product_id") or product.get("id") or ""),
                "name": str(product.get("name") or ""),
                "price": product.get("price"),
                "store_id": str(product.get("store_id") or store_id),
                "current_stock": float(current_stock),
                "avg_daily_sales": float(avg_daily_sales),
                "safety_stock": float(safety_stock),
                "lead_time_days": int(lead_time_days),
                "estimated_days_left": estimated_days_left,
                "sales_trend": sales_trend,
                "reorder_qty_suggestion": int(reorder_qty_suggestion),
                "is_critical": bool(is_critical)
            }
            
            # None değerleri temizle
            product_data = {k: v for k, v in product_data.items() if v is not None}
            products.append(product_data)

        # Summary hesapla
        total_products = len(products)
        critical_count = sum(1 for p in products if p.get("is_critical"))
        low_stock_count = sum(1 for p in products if p.get("estimated_days_left") and p.get("estimated_days_left") <= 30)
        
        summary = {
            "total_products": total_products,
            "critical_count": critical_count,
            "low_stock_count": low_stock_count
        }

        return {
            "store_id": store_id,
            "products": products,
            "summary": summary
        }
        
    except Exception as e:
        print(f"Error in get_inventory_items: {e}")
        traceback.print_exc()
        return {
            "store_id": store_id,
            "products": [],
            "summary": None
        }

class StoreResponse(BaseModel):
    id: str
    name: str
    location: Optional[str] = None

@inventory_router.get("/stores", response_model=List[StoreResponse])
async def get_stores():
    try:
        query = "SELECT * FROM stores"
        rows = await database.fetch_all(query=query)
        result = []
        
        for row in rows:
            store = dict(row)
            store_data = {
                "id": str(store.get("id") or ""),
                "name": str(store.get("name") or ""),
                "location": store.get("location")
            }
            result.append(store_data)
            
        print(f"get_stores: Found {len(result)} stores")
        return result
        
    except Exception as e:
        print(f"get_stores error: {e}")
        traceback.print_exc()
        return []