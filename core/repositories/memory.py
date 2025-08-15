# core/repositories/memory.py
from __future__ import annotations
from typing import List
import json, os
from core.models.schemas import Order, Product
from core.repositories.base import SalesRepository, StockRepository

DATA_DIR = os.getenv("DATA_DIR", ".")

class InMemorySalesRepository(SalesRepository):
    def __init__(self, path: str = None):
        self.path = path or f"{DATA_DIR}/sales.json"
        with open(self.path, "r", encoding="utf-8") as f:
            self._data = json.load(f)

    def list_orders(self, store_id: str) -> List[Order]:
        assert self._data["storeId"] == store_id
        return [Order(**o) for o in self._data["orders"]]

    def list_products(self, store_id: str) -> List[Product]:
        assert self._data["storeId"] == store_id
        return [Product(**p) for p in self._data["products"]]

class InMemoryStockRepository(StockRepository):
    def __init__(self, path: str = None):
        self.path = path or f"{DATA_DIR}/stock.json"
        with open(self.path, "r", encoding="utf-8") as f:
            self._data = json.load(f)

    def list_stock(self, store_id: str) -> List[dict]:
        assert self._data["storeId"] == store_id
        return list(self._data["stocks"])
