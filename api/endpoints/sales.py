from fastapi import APIRouter, Query
from api.dependencies import get_agents
router = APIRouter()

@router.get("/analyze")
async def analyze(store_id: str = Query(...)):
    sales, *_ = get_agents()
    return await sales.analyze_sales(store_id)
