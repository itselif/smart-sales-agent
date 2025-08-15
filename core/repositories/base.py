from __future__ import annotations
from typing import Protocol, List, Optional, TYPE_CHECKING
from datetime import date

if TYPE_CHECKING:
    # Sadece type-check zamanı import (çalışma anında import olmaz)
    from core.models.sales import SalesRecord
    from core.models.stock import StockRow


# === Yeni (domain) arayüzler - async ===

class SalesRepository(Protocol):
    async def get_sales_records(
        self,
        store_id: str,
        start_date: date,
        end_date: date,
        product_ids: Optional[List[str]] = None,
    ) -> List["SalesRecord"]: ...

class StockRepository(Protocol):
    async def get_stock_snapshot(self, store_id: str) -> List["StockRow"]: ...


# === Eski (DTO) arayüzler - legacy, geçici olarak koru ===
class LegacySalesRepository(Protocol):
    def list_orders(self, store_id: str) -> list: ...
    def list_products(self, store_id: str) -> list: ...

class LegacyStockRepository(Protocol):
    def list_stock(self, store_id: str) -> list: ...
