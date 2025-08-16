# Dependency Injection Container
# Add your dependency injection setup here.
import os
from core.orchestrator import Orchestrator
from core.agents.sales_agent import SalesAgent
from core.agents.stock_agent import StockAgent
from core.agents.report_agent import ReportAgent
from core.repositories.memory import InMemorySalesRepository, InMemoryStockRepository
# from core.repositories.postgres import PostgresSalesRepository, PostgresStockRepository

USE_MEMORY = os.getenv("USE_MEMORY", "1") == "1"

_sales = _stock = _report = _orch = None

def get_agents():
    global _sales, _stock, _report, _orch
    if _sales:   # singleton
        return _sales, _stock, _report, _orch

    if USE_MEMORY:
        sales_repo = InMemorySalesRepository(os.getenv("SALES_JSON_PATH", "data/sales.json"))
        stock_repo = InMemoryStockRepository(os.getenv("STOCK_JSON_PATH", "data/stock.json"))
    else:
        sales_repo = ...  # PostgresSalesRepository(...)
        stock_repo = ...  # PostgresStockRepository(...)

    # LLM opsiyonel: yoksa ReportAgent yine HTML fallback ile çalışır
    llm = None

    _sales  = SalesAgent(sales_repo=sales_repo, gemini_api_key=os.getenv("GOOGLE_API_KEY"))
    _stock  = StockAgent(sales_agent=_sales, stock_repo=stock_repo)
    _report = ReportAgent()
    _orch   = Orchestrator()

    return _sales, _stock, _report, _orch
