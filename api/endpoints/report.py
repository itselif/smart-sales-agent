from fastapi import APIRouter, Query
from api.dependencies import get_agents
router = APIRouter()

@router.get("/build")
async def build(store_id: str = Query(...), request: str = "standart rapor"):
    sales, stock, report, _ = get_agents()
    s, st = await sales.analyze_sales(store_id), await stock.analyze_stock(store_id)
    return await report.build_report(store_id, request, s, st, prefer_pdf=True)
