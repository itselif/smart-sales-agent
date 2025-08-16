from fastapi import APIRouter, Query
from core.orchestrator import Orchestrator

router = APIRouter()
orch = Orchestrator()

@router.get("")
async def orchestrate(q: str = Query(...), store_id: str = Query(...), req: str | None = None):
    return await orch.run(q, store_id, req)
