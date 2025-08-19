# core/models/stock.py
from __future__ import annotations
from typing import List, Optional, Literal, Dict
from pydantic import BaseModel

class StockRow(BaseModel):
    product_id: str
    name: Optional[str] = None            # Mindbricks inventory'de genelde yok
    current_stock: int
    min_required: int = 0
    lead_time_days: int = 0
    category: Optional[str] = None
    price: float = 0.0
    supplier: Optional[str] = None

class AnalyzedProduct(BaseModel):
    product_id: str
    name: Optional[str] = None            # <-- optional
    category: Optional[str] = None
    current_stock: int
    min_required: int
    lead_time_days: int
    price: float
    supplier: Optional[str] = None

    avg_daily_sales: float
    sales_trend: Literal["increasing","decreasing","stable"]
    traffic_level: Literal["high","medium","low"]

    estimated_days_left: Optional[float] = None
    estimated_days_left_ci: List[Optional[float]] = [None, None]

    is_critical: bool
    stock_value: float

    # Ajanın eklediği alanlar
    safety_stock: int
    lead_time_demand: int
    target_stock_level: int
    reorder_qty_suggestion: int
    policy: Dict[str, float]
    policy_note: str

class StockAnalysisResult(BaseModel):
    store_id: str
    analysis_date: str
    products: List[AnalyzedProduct]
    critical_products: List[AnalyzedProduct]
    total_value: float
    warnings: Optional[List[str]] = None
    cached: Optional[bool] = None
