# core/repositories/base.py
from __future__ import annotations
from typing import Protocol, List
from core.models.schemas import Order, Product

class SalesRepository(Protocol):
    def list_orders(self, store_id: str) -> List[Order]: ...
    def list_products(self, store_id: str) -> List[Product]: ...

class StockRepository(Protocol):
    def list_stock(self, store_id: str) -> List[dict]: ...

