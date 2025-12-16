from fastapi import APIRouter
from pydantic import BaseModel
from config.settings import get_llm

router = APIRouter(prefix="/ai", tags=["AI"])


class AIRequest(BaseModel):
    message: str
    context: str | None = None


@router.post("/query")
def query_ai(request: AIRequest):
    from agents.orchestrator import Orchestrator

    llm = get_llm()
    orchestrator = Orchestrator(llm)

    result = orchestrator.route(
        user_input=request.message,
        context=request.context
    )

    return {
        "result": result
    }
