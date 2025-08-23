# core/repositories/memory.py
from __future__ import annotations
from dataclasses import dataclass
from datetime import date, datetime
from typing import List, Dict, Optional, Any
import json
import os

# ---- Sales (in-memory) ----

@dataclass
class _SalesRow:
    store_id: str
    date: str              # "YYYY-MM-DD"
    product_id: str
    product_name: Optional[str]
    quantity: int
    unit_price: float
    revenue: float
    category: Optional[str]
    discount: float = 0.0

class InMemorySalesRepository:
    """
    data/sales.json kabul eder. Esnek biçimler:
    1) { "rows": [ {...}, ... ] }
    2) { "products": [ { "records":[...] }, ... ] }
    3) [ {...}, {...} ]  (düz liste)
    Satırlar: store_id, date(YYYY-MM-DD), product_id, quantity, unit_price/revenue...
    """
    def __init__(self, path: str = "data/sales.json") -> None:
        self.path = path
        self._rows: List[_SalesRow] = []
        if os.path.exists(self.path):
            try:
                with open(self.path, "r", encoding="utf-8") as f:
                    raw = json.load(f)
                self._rows = self._normalize_sales(raw)
            except Exception:
                self._rows = []
        else:
            self._rows = []

    def _normalize_sales(self, raw: Any) -> List[_SalesRow]:
        out: List[_SalesRow] = []

        def add(d: Dict[str, Any]) -> None:
            # alan adları farklı gelebilir → normalize
            store_id = d.get("store_id") or d.get("storeId") or "UNKNOWN_STORE"
            date_str = d.get("date") or d.get("transactionDate")
            if not date_str:
                return
            # ISO ise YYYY-MM-DD'e indir
            try:
                if "T" in date_str:
                    date_str = datetime.fromisoformat(date_str.replace("Z","")).date().strftime("%Y-%m-%d")
                elif len(date_str) > 10:
                    date_str = date_str[:10]
            except Exception:
                pass

            pid = d.get("product_id") or d.get("productId") or "TOTAL"
            name = d.get("product_name") or d.get("productName")
            qty = int(d.get("quantity") or d.get("qty") or 0)
            price = float(d.get("unit_price") or d.get("unitPrice") or 0.0)
            rev = float(d.get("revenue") or (qty * price))
            cat = d.get("category")
            disc = float(d.get("discount") or 0.0)
            out.append(_SalesRow(
                store_id=store_id, date=date_str, product_id=pid,
                product_name=name, quantity=qty, unit_price=price,
                revenue=rev, category=cat, discount=disc
            ))

        # Biçim 1: dict/rows
        if isinstance(raw, dict) and isinstance(raw.get("rows"), list):
            for r in raw["rows"]:
                if isinstance(r, dict):
                    add(r)
            return out

        # Biçim 2: dict/products[{records:[]}]
        if isinstance(raw, dict) and isinstance(raw.get("products"), list):
            for p in raw["products"]:
                recs = p.get("records") or p.get("sales") or []
                for r in recs:
                    if isinstance(r, dict):
                        # product üstünden id/name aktar
                        r = {**r}
                        r.setdefault("product_id", p.get("product_id") or p.get("productId"))
                        r.setdefault("product_name", p.get("product_name") or p.get("productName"))
                        add(r)
            return out

        # Biçim 3: düz liste
        if isinstance(raw, list):
            for r in raw:
                if isinstance(r, dict):
                    add(r)
            return out

        return out

    async def get_sales_records(
        self,
        *,
        store_id: str,
        start_date: date,
        end_date: date,
        product_ids: Optional[List[str]] = None,
    ) -> List[Any]:
        sd = start_date.strftime("%Y-%m-%d")
        ed = end_date.strftime("%Y-%m-%d")

        rows = []
        for r in self._rows:
            if r.store_id != store_id:
                continue
            if r.date < sd or r.date > ed:
                continue
            if product_ids and r.product_id not in product_ids:
                continue
            rows.append(r)

        # SalesAgent dict bekliyor → model_dump taklidi
        class _Wrap:
            def __init__(self, d: Dict[str, Any]) -> None:
                self._d = d
            def model_dump(self) -> Dict[str, Any]:
                return self._d

        return [
            _Wrap({
                "store_id": r.store_id,
                "date": r.date,
                "product_id": r.product_id,
                "product_name": r.product_name,
                "quantity": r.quantity,
                "unit_price": r.unit_price,
                "revenue": r.revenue,
                "category": r.category,
                "discount": r.discount,
            })
            for r in rows
        ]


# ---- Stock (in-memory) ----

@dataclass
class _StockItem:
    product_id: str
    name: Optional[str]
    current_stock: int
    min_required: int
    price: float
    category: Optional[str] = None

class InMemoryStockRepository:
    """
    data/stock.json kabul eder. Esnek biçimler:
    1) { "items": [ {...}, ... ] }
    2) [ {...}, {...} ]
    Alanlar: product_id/productId, name/product_name, current_stock/quantity/onhand, min_required/minRequired, price
    """
    def __init__(self, path: str = "data/stock.json") -> None:
        self.path = path
        self._items: List[_StockItem] = []
        if os.path.exists(self.path):
            try:
                with open(self.path, "r", encoding="utf-8") as f:
                    raw = json.load(f)
                self._items = self._normalize_stock(raw)
            except Exception:
                self._items = []
        else:
            self._items = []

    def _normalize_stock(self, raw: Any) -> List[_StockItem]:
        out: List[_StockItem] = []

        def add(d: Dict[str, Any]) -> None:
            pid = d.get("product_id") or d.get("productId") or ""
            name = d.get("name") or d.get("product_name")
            onhand = int(d.get("current_stock") or d.get("quantity") or d.get("onhand") or 0)
            min_req = int(d.get("min_required") or d.get("minRequired") or 0)
            price = float(d.get("price") or 0.0)
            cat = d.get("category")
            if pid:
                out.append(_StockItem(
                    product_id=pid, name=name, current_stock=onhand,
                    min_required=min_req, price=price, category=cat
                ))

        if isinstance(raw, dict) and isinstance(raw.get("items"), list):
            for r in raw["items"]:
                if isinstance(r, dict):
                    add(r)
            return out

        if isinstance(raw, list):
            for r in raw:
                if isinstance(r, dict):
                    add(r)
            return out

        return out

    async def get_stock_snapshot(self, store_id: str) -> List[Any]:
        # Bu basit sürüm store_id filtrelemez; istersen JSON’a storeId koyup filtre ekleyebilirsin.
        # StockAgent attribute erişiyor → objeleri döndürelim (product_id, current_stock vs.)
        return self._items[:]
