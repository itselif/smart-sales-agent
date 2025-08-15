# core/models/schemas.py
from __future__ import annotations
from pydantic import BaseModel
from typing import List, Optional, Dict

class Order(BaseModel):
    date: str
    productId: str
    qty: int
    unitPrice: float

class Product(BaseModel):
    productId: str
    name: str
    category: Optional[str] = None

class SalesSummary(BaseModel):
    storeId: str
    period: Dict[str, Optional[str]]
    totalRevenue: float
    totalUnits: int
    topSellers: List[Dict]
    lowSellers: List[Dict]
    trendByDay: List[Dict]

class StockForecast(BaseModel):
    productId: str
    onHand: int
    avgDailySales: float
    estimatedDaysToZero: Optional[float]

class StockSummary(BaseModel):
    storeId: str
    snapshots: List[StockForecast]

class ReportSpec(BaseModel):
    storeId: str
    includeSales: bool
    includeStock: bool
    format: str = "pdf"
    sales: Optional[SalesSummary] = None
    stock: Optional[StockSummary] = None
