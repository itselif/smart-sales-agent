# core/repositories/memory.py
from __future__ import annotations
from typing import List, Optional
import json, os
from datetime import datetime, date

from core.repositories.base import SalesRepository, StockRepository
from core.models.sales import SalesRecord
from core.models.stock import StockRow

DATA_DIR = os.getenv("DATA_DIR", ".")

def _parse_date(s: str) -> date:
    # orders.json içindeki "date": "YYYY-MM-DD" ise:
    return datetime.strptime(s, "%Y-%m-%d").date()

class InMemorySalesRepository(SalesRepository):
    """
    sales.json beklenen örnek format:
    {
      "storeId": "ISTANBUL_AVM",
      "orders": [{ "date":"2025-08-01","productId":"P100","qty":2,"unitPrice":199.9 }, ...],
      "products": [{ "productId":"P100","name":"...", "category":"..." }, ...]
    }
    """
    def __init__(self, path: Optional[str] = None):
        self.path = path or f"{DATA_DIR}/sales.json"
        with open(self.path, "r", encoding="utf-8") as f:
            self._data = json.load(f)
        # Hızlı erişim için ürün lookup
        self._pmap = {p["productId"]: p for p in self._data.get("products", [])}

    async def get_sales_records(
        self,
        store_id: str,
        start_date: date,
        end_date: date,
        product_ids: Optional[list[str]] = None,
    ) -> List[SalesRecord]:
        assert self._data["storeId"] == store_id
        out: List[SalesRecord] = []
        for o in self._data.get("orders", []):
            d = _parse_date(o["date"])
            if not (start_date <= d <= end_date):
                continue
            if product_ids and o["productId"] not in product_ids:
                continue
            p = self._pmap.get(o["productId"], {})
            out.append(SalesRecord(
                store_id=store_id,
                date=d,
                product_id=o["productId"],
                product_name=p.get("name"),
                quantity=int(o["qty"]),
                unit_price=float(o["unitPrice"]),
                revenue=float(o["qty"]) * float(o["unitPrice"]),
                category=p.get("category"),
                discount=0.0,  # dosyada yoksa 0 kabul
            ))
        return out

class InMemoryStockRepository(StockRepository):
    """
    stock.json beklenen örnek format:
    {
      "storeId":"ISTANBUL_AVM",
      "stocks":[
        {"productId":"P100","name":"Kulaklık","onHand":8,"minRequired":5,
         "leadTimeDays":3,"category":"electronics","price":599.99,"supplier":"TechCorp"},
         ...
      ]
    }
    """
    def __init__(self, path: Optional[str] = None):
        self.path = path or f"{DATA_DIR}/stock.json"
        with open(self.path, "r", encoding="utf-8") as f:
            self._data = json.load(f)

    async def get_stock_snapshot(self, store_id: str) -> List[StockRow]:
        assert self._data["storeId"] == store_id
        out: List[StockRow] = []
        for s in self._data.get("stocks", []):
            out.append(StockRow(
                product_id=s["productId"],
                name=s["name"],
                current_stock=int(s["onHand"]),
                min_required=int(s.get("minRequired", 0)),
                lead_time_days=int(s.get("leadTimeDays", 0)),
                category=s.get("category"),
                price=float(s.get("price", 0.0)),
                supplier=s.get("supplier"),
            ))
        return out
