# api/main.py
from __future__ import annotations
from fastapi import FastAPI, Depends, Query
from api.plugin_loader import mount_service_routers

# ---- isteğe bağlı: basit auth/tenant guard stub'ları (sonra gerçeklerini koyarsın) ----
async def auth_required():
    return True

async def tenant_guard():
    return True

app = FastAPI(title="StorePilot API")

# ---- çekirdek: modules/* içindeki APIRouter'ları otomatik mount et ----
mounted = mount_service_routers(
    app,
    base_dir="modules",    # Mindbricks klasörlerini buraya koymuştun
    url_prefix="/ms",      # hepsi /ms/<servis> altında açılır
    dependencies=[Depends(auth_required), Depends(tenant_guard)],
)

# ---- minimum: orchestrator endpoint (hemen test edebil) ----
from core.orchestrator import Orchestrator
orch = Orchestrator()

@app.get("/orchestrate")
async def orchestrate(q: str = Query(...), store_id: str = Query(...), req: str | None = None):
    return await orch.run(q, store_id, req)

# İstersen hızlıca şu ikisini de ekleyebilirsin:
from core.agents.sales_agent import SalesAgent
from core.agents.stock_agent import StockAgent
from core.agents.report_agent import ReportAgent
from core.repositories.memory import InMemorySalesRepository, InMemoryStockRepository

sales = SalesAgent(sales_repo=InMemorySalesRepository())
stock = StockAgent(sales_agent=sales, stock_repo=InMemoryStockRepository())
report = ReportAgent()

@app.get("/sales/analyze")
async def sales_analyze(store_id: str = Query(...)):
    return await sales.analyze_sales(store_id=store_id)

@app.get("/stock/analysis")
async def stock_analysis(store_id: str = Query(...)):
    return await stock.analyze_stock(store_id=store_id)

@app.get("/report/build")
async def report_build(store_id: str = Query(...), request: str = "standart rapor"):
    s, st = await sales.analyze_sales(store_id), await stock.analyze_stock(store_id)
    return await report.build_report(store_id=store_id, user_request=request, sales=s, stock=st, prefer_pdf=True)

@app.get("/healthz")
async def healthz():
    return {"ok": True, "mounted": mounted}
