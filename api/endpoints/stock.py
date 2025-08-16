from fastapi import APIRouter, Query
from api.dependencies import get_agents
router = APIRouter()

@router.get("/analysis")
async def analysis(store_id: str = Query(...)):
    _, stock, _, _ = get_agents()
    return await stock.analyze_stock(store_id)
