# core/models/stock.py
from __future__ import annotations
from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from typing import Optional

class StockRow(BaseModel):
    product_id: str
    name: Optional[str] = None
    current_stock: int
    min_required: int = 0
    lead_time_days: int = 0
    category: Optional[str] = None
    price: float = 0.0
    supplier: Optional[str] = None


class AnalyzedProduct(BaseModel):
    product_id: str
    name: str
    category: Optional[str]
    current_stock: int
    min_required: int
    lead_time_days: int
    price: float
    supplier: Optional[str]
    avg_daily_sales: float
    sales_trend: Literal["increasing","decreasing","stable"]
    traffic_level: Literal["high","medium","low"]
    estimated_days_left: Optional[float]
    is_critical: bool
    stock_value: float

class StockAnalysisResult(BaseModel):
    store_id: str
    analysis_date: str
    products: List[AnalyzedProduct]
    critical_products: List[AnalyzedProduct]
    total_value: float
    warnings: Optional[list] = None
    cached: Optional[bool] = None
