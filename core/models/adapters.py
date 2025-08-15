from __future__ import annotations
from typing import Dict, List
from core.models.sales import ProductAnalysis, SalesAnalysisResult
from core.models.stock import AnalyzedProduct, StockAnalysisResult
from core.models.schemas import SalesSummary, StockSummary, StockForecast

# DOMAIN -> DTO (frontend için)
def sales_domain_to_dto(res: dict) -> SalesSummary:
    # res: SalesAnalysisResult.model_dump()
    products = res.get("products", [])
    top = sorted(products, key=lambda p: p.get("total_revenue", 0.0), reverse=True)
    return SalesSummary(
        storeId=res["store_id"],
        period={"from": None, "to": None},  # istersen gerçek tarihleri ekle
        totalRevenue=round(sum(p.get("total_revenue", 0) for p in products), 2),
        totalUnits=int(sum(p.get("total_sold", 0) for p in products)),
        topSellers=[{
            "productId": p["product_id"],
            "name": p.get("product_name"),
            "units": int(p.get("total_sold", 0)),
            "revenue": round(p.get("total_revenue", 0.0), 2),
        } for p in top[:5]],
        lowSellers=[{
            "productId": p["product_id"],
            "name": p.get("product_name"),
            "units": int(p.get("total_sold", 0)),
            "revenue": round(p.get("total_revenue", 0.0), 2),
        } for p in top[-5:]],
        trendByDay=[],  # istersen satış ajanından üret
    )

def stock_domain_to_dto(res: dict) -> StockSummary:
    prods = res.get("products", [])
    return StockSummary(
        storeId=res["store_id"],
        snapshots=[
            StockForecast(
                productId=p["product_id"],
                onHand=int(p.get("current_stock", 0)),
                avgDailySales=float(p.get("avg_daily_sales", 0.0) or 0.0),
                estimatedDaysToZero=p.get("estimated_days_left"),
            ) for p in prods
        ],
    )

# DTO -> DOMAIN (gerekirse dış kaynaktan DTO gelirse)
# İhtiyaç oldukça eklenir.
