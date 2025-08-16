# api/main.py
from __future__ import annotations
import os
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

from core.agents.sales_agent import SalesAgent
from core.agents.stock_agent import StockAgent

load_dotenv()

sales = SalesAgent()
stock = StockAgent(sales_agent=sales, stock_repo=None)

# --- ReportAgent'i storage/reports altına yazdır ---
REPORT_DIR = os.path.join(os.path.dirname(__file__), "..", "storage", "reports")
REPORT_DIR = os.path.abspath(REPORT_DIR)
os.makedirs(REPORT_DIR, exist_ok=True)

ENABLE_REPORT = True
try:
    from core.agents.report_agent import ReportAgent
    report = ReportAgent(output_dir=REPORT_DIR)   # DİKKAT: output_dir veriyoruz
except Exception as e:
    print("ReportAgent devre dışı:", e)
    ENABLE_REPORT = False
    report = None

app = FastAPI(title="StorePilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"]
)

# --- Statik serve: http://localhost:8000/reports/<dosya> ---
app.mount("/reports", StaticFiles(directory=REPORT_DIR), name="reports")

@app.get("/healthz")
async def healthz():
    return {"ok": True, "report_enabled": ENABLE_REPORT, "report_dir": REPORT_DIR}

@app.get("/sales/analyze")
async def sales_analyze(store_id: str = Query(...)):
    return await sales.analyze_sales(store_id=store_id)

@app.get("/stock/analysis")
async def stock_analysis(store_id: str = Query(...)):
    return await stock.analyze_stock(store_id=store_id)

if ENABLE_REPORT:
    @app.get("/report/build")
    async def report_build(store_id: str = Query(...), request: str = "standart rapor"):
        s = await sales.analyze_sales(store_id)
        st = await stock.analyze_stock(store_id)
        res = await report.build_report(store_id, request, s, st, prefer_pdf=True)

        # dönen path'ten dosya adını çıkarıp public URL üret
        fname = os.path.basename(res["path"])
        res["public_url"] = f"/reports/{fname}"
        res["download_url"] = f"/report/download?name={fname}"
        return res

    @app.get("/report/download")
    async def report_download(name: str = Query(...)):
        # güvenlik: sadece REPORT_DIR içinden dosya ver
        path = os.path.abspath(os.path.join(REPORT_DIR, name))
        if not path.startswith(REPORT_DIR) or not os.path.exists(path):
            raise HTTPException(status_code=404, detail="Dosya bulunamadı")
        # içerik türünü FastAPI algılar (html/pdf)
        return FileResponse(path, filename=name)
else:
    @app.get("/report/build")
    async def report_build_disabled():
        raise HTTPException(status_code=503, detail="Report temporarily disabled")
