# core/repositories/adapters.py
from __future__ import annotations
from typing import List, Optional
from datetime import date, datetime
from core.repositories.base import SalesRepository, StockRepository, LegacySalesRepository, LegacyStockRepository
from core.models.sales import SalesRecord
from core.models.stock import StockRow

class SalesRepoAdapter(SalesRepository):
    def __init__(self, legacy: LegacySalesRepository):
        self.legacy = legacy
    async def get_sales_records(self, store_id: str, start_date: date, end_date: date, product_ids: Optional[list[str]] = None) -> List[SalesRecord]:
        orders = self.legacy.list_orders(store_id)
        products = {p.productId: p for p in self.legacy.list_products(store_id)}
        out = []
        for o in orders:
            d = datetime.strptime(o.date, "%Y-%m-%d").date()
            if not (start_date <= d <= end_date):
                continue
            if product_ids and o.productId not in product_ids:
                continue
            p = products.get(o.productId)
            out.append(SalesRecord(
                store_id=store_id, date=d, product_id=o.productId,
                product_name=(p.name if p else None),
                quantity=o.qty, unit_price=o.unitPrice,
                revenue=o.qty * o.unitPrice,
                category=(p.category if p else None),
                discount=0.0,
            ))
        return out

class StockRepoAdapter(StockRepository):
    def __init__(self, legacy: LegacyStockRepository):
        self.legacy = legacy
    async def get_stock_snapshot(self, store_id: str) -> List[StockRow]:
        rows = self.legacy.list_stock(store_id)
        return [StockRow(
            product_id=r["productId"], name=r["name"], current_stock=int(r["onHand"]),
            min_required=int(r.get("minRequired", 0)), lead_time_days=int(r.get("leadTimeDays", 0)),
            category=r.get("category"), price=float(r.get("price", 0.0)), supplier=r.get("supplier")
        ) for r in rows]
