# core/models/sales.py
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class SalesRecord(BaseModel):
    store_id: str
    date: str            # "YYYY-MM-DD"
    product_id: str
    product_name: Optional[str] = None
    quantity: int
    unit_price: float
    revenue: float
    category: Optional[str] = None
    discount: float = 0.0

class ProductAnalysis(BaseModel):
    product_id: str
    product_name: Optional[str] = None
    category: Optional[str] = None
    total_sold: int
    total_revenue: float
    avg_daily_sales: float
    sales_consistency: float
    weekly_trend: float
    sales_forecast: Dict              # {"next_7days": int, "confidence": float, "interval": [low,high], ...}
    seasonal_impact: Dict             # {"quarter": "Qx", ...}
    ai_product_insights: Optional[str] = None

class SalesAnalysisResult(BaseModel):
    status: str
    store_id: str
    analysis_period: int
    products: List[ProductAnalysis] = Field(default_factory=list)
    trend_analysis: Dict             # {"weekly_pattern": {...}, "category_trends": {...}, ...}
    ai_insights: Optional[str] = None
    total_revenue: float = 0.0       # Toplam ciro
    total_sales: int = 0             # Toplam satış adedi
