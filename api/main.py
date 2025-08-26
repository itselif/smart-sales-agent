from __future__ import annotations

import os
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

# Ajanlar (lokal)
from core.agents.sales_agent import SalesAgent
from core.agents.stock_agent import StockAgent
from core.agents.report_agent import ReportAgent

# Servis katmanı
from core.services.sales_service import SalesService
from core.services.stock_service import StockService
from core.services.report_service import ReportService

# Mindbricks
from infrastructure.external.mindbricks import MindbricksClient
from core.repositories.mindbricks import MindbricksStockRepository
from core.repositories.mindbricks_sales import MindbricksSalesRepository
from api.auth_proxy import router as auth_router


# ========== .env ==========
# Proje kökünden .env'yi YÜKLE ve var olan env'yi override et
ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

def env_flag(name: str, default: str = "0") -> bool:
    return (os.getenv(name, default) or "").strip() == "1"

def any_true(*flags: bool) -> bool:
    return any(bool(f) for f in flags)

# Bayraklar (ana: USE_MINDBRICKS_DATA; eskilerle geriye uyumlu)
USE_MB_DATA      = env_flag("USE_MINDBRICKS_DATA")  # önerilen
USE_MB_SALES     = env_flag("USE_MINDBRICKS_SALES")
USE_MB_STOCK     = env_flag("USE_MINDBRICKS_STOCK")
USE_MB_REPORTING = env_flag("USE_MINDBRICKS_REPORTING")
USE_MEMORY       = env_flag("USE_MEMORY", "1")

MB_SUFFIX = (os.getenv("MINDBRICKS_SUFFIX", "") or "").strip()
MB_TOKEN  = (os.getenv("MINDBRICKS_SERVICE_TOKEN") or os.getenv("MINDBRICKS_API_KEY") or "").strip()

MB_ACTIVE = any_true(USE_MB_DATA, USE_MB_SALES, USE_MB_STOCK, USE_MB_REPORTING)

# ========== FastAPI ==========
app = FastAPI(title="StorePilot API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

# Rapor klasörü ve statik mount
REPORT_DIR = (Path(__file__).resolve().parents[1] / "storage" / "reports").absolute()
REPORT_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/reports", StaticFiles(directory=str(REPORT_DIR)), name="reports")

# App state
app.state.mb_client: Optional[MindbricksClient] = None
app.state.sales_svc: Optional[SalesService] = None
app.state.stock_svc: Optional[StockService] = None
app.state.report_svc: Optional[ReportService] = None
app.state.report_dir = str(REPORT_DIR)

# ========== Startup ==========
@app.on_event("startup")
async def _startup() -> None:
    # Mindbricks client'ı yalnızca gerekli koşullar sağlanırsa kur
    if MB_ACTIVE and MB_SUFFIX and MB_TOKEN:
        print(f"[MB][startup] enabling Mindbricks client  suffix={MB_SUFFIX}  token_set={bool(MB_TOKEN)}")
        app.state.mb_client = MindbricksClient()  # kendi .env'inden suffix/token okur
    else:
        print(f"[MB][startup] disabled "
              f"(MB_ACTIVE={MB_ACTIVE}, suffix={'OK' if MB_SUFFIX else 'MISSING'}, token={'OK' if MB_TOKEN else 'MISSING'})")
        app.state.mb_client = None

    # Sales agent için repository bağlantısı
    sales_repo = None
    if app.state.mb_client:
        sales_repo = MindbricksSalesRepository(app.state.mb_client)
    
    sales_agent = SalesAgent(sales_repo=sales_repo)

    # Stock agent için repository bağlantısı
    stock_repo = None
    if app.state.mb_client:
        stock_repo = MindbricksStockRepository(app.state.mb_client)
    
    stock_agent = StockAgent(sales_agent=sales_agent, stock_repo=stock_repo)
    report_agent = ReportAgent(output_dir=str(REPORT_DIR))

    # Servisleri bağla (mb varsa mb üzerinden, yoksa lokal ajan)
    app.state.sales_svc  = SalesService(sales_agent, mb=app.state.mb_client)
    app.state.stock_svc  = StockService(stock_agent, mb=app.state.mb_client)
    app.state.report_svc = ReportService(
        report_agent, mb=app.state.mb_client,
        public_mount_prefix="/reports", report_dir=str(REPORT_DIR)
    )

# ========== Endpoints ==========
@app.get("/")
async def root():
    return {"status": "ok", "message": "StorePilot API çalışıyor"}

@app.get("/healthz")
async def healthz():
    # healthz üzerinde env'yi net göster
    return {
        "ok": True,
        "report_dir": str(REPORT_DIR),
        "mindbricks_active": bool(app.state.mb_client is not None),
        "use_memory": USE_MEMORY,
        "use_mb_data": USE_MB_DATA,
        "use_mb_sales": USE_MB_SALES,
        "use_mb_stock": USE_MB_STOCK,
        "use_mb_reporting": USE_MB_REPORTING,
        "mb_suffix": MB_SUFFIX,
        "mb_token_set": bool(MB_TOKEN),
        "stock_service": os.getenv("MINDBRICKS_STOCK_SERVICE"),
        "inventory_list_path": os.getenv("MINDBRICKS_INVENTORY_LIST_PATH"),
        "store_param": os.getenv("MINDBRICKS_STORE_PARAM"),
        "mb_probe_example": f"https://salesManagement{MB_SUFFIX}/health" if MB_SUFFIX else "",
    }

@app.get("/sales/analyze")
async def sales_analyze(store_id: str = Query(..., description="Mağaza ID veya GUID")):
    return await app.state.sales_svc.analyze(store_id)

@app.get("/stock/analysis")
async def stock_analysis(store_id: str = Query(..., description="Mağaza ID veya GUID")):
    return await app.state.stock_svc.analysis(store_id)

@app.get("/report/build")
async def report_build(store_id: str = Query(...), request: str = "standart rapor"):
    res = await app.state.report_svc.build(store_id, request)
    # public_url yoksa dosyayı /reports altına publish et
    if "public_url" not in res or not res.get("public_url"):
        path = res.get("path")
        if path:
            fname = os.path.basename(path)
            res["public_url"] = f"/reports/{fname}"
            res["download_url"] = f"/report/download?name={fname}"
    return res

@app.get("/stores/list")
async def stores_list():
    if not app.state.mb_client:
        return {"stores": []}

    service = os.getenv("MINDBRICKS_STORE_SERVICE", "storemanagement").strip() or "storemanagement"
    env_path = (os.getenv("MINDBRICKS_STORES_LIST_PATH") or "/stores").strip()

    # Güvenli fallback sırası
    candidate_paths = []
    # 1) env ne diyorsa onu ekle
    candidate_paths.append(env_path if env_path.startswith("/") else f"/{env_path}")
    # 2) doğru olanı mutlaka dene
    if "/stores" not in candidate_paths:
        candidate_paths.append("/stores")
    # 3) bazı eski şemalar için tekil de dene
    if "/store" not in candidate_paths:
        candidate_paths.append("/store")

    last_err = None
    for path in candidate_paths:
        try:
            raw = await app.state.mb_client.get_json(
                service, path, params={"limit": 100}
            )
            items = raw.get("stores") or raw.get("data") or raw.get("items") or []
            stores = [
                {
                    "id": it.get("id") or it.get("_id"),
                    "name": it.get("name"),
                    "fullname": it.get("fullname") or it.get("name"),
                    "city": it.get("city") or "",
                    "avatar": it.get("avatar") or "",
                    "active": bool(it.get("active", it.get("isActive", True))),
                }
                for it in items
                if it is not None
            ]
            return {"stores": stores, "source_path_tried": path}
        except Exception as e:
            last_err = str(e)
            continue

    return {"stores": [], "error": last_err or "unknown_error"}


@app.get("/report/download")
async def report_download(name: str = Query(...)):
    safe_path = (REPORT_DIR / name).absolute()
    if not str(safe_path).startswith(str(REPORT_DIR)) or not safe_path.exists():
        raise HTTPException(status_code=404, detail="Dosya bulunamadı")
    return FileResponse(str(safe_path), filename=name)

# Debug endpoint for stock data
@app.get("/debug/stock")
async def debug_stock(store_id: str = Query(..., description="Mağaza ID veya GUID")):
    """Debug endpoint for stock data - tests Mindbricks connection directly"""
    if not app.state.mb_client:
        return {"success": False, "error": "Mindbricks client not available"}
    
    try:
        # Doğrudan Mindbricks'e istek at
        data = await app.state.mb_client.get_json(
            "inventorymanagement", 
            "/inventoryitems",
            params={"storeId": store_id, "limit": 200}
        )
        return {
            "success": True, 
            "data_count": len(data.get('inventoryItems', [])),
            "sample_data": data.get('inventoryItems', [])[:3] if data.get('inventoryItems') else [],
            "full_response_keys": list(data.keys()) if isinstance(data, dict) else []
        }
    except Exception as e:
        return {"success": False, "error": str(e), "store_id": store_id}

# Debug endpoint for environment variables
@app.get("/debug/env")
async def debug_env():
    """Debug endpoint to check environment variables"""
    env_vars = {
        "USE_MINDBRICKS_STOCK": os.getenv("USE_MINDBRICKS_STOCK"),
        "MINDBRICKS_STOCK_SERVICE": os.getenv("MINDBRICKS_STOCK_SERVICE"),
        "MINDBRICKS_INVENTORY_LIST_PATH": os.getenv("MINDBRICKS_INVENTORY_LIST_PATH"),
        "MINDBRICKS_STORE_PARAM": os.getenv("MINDBRICKS_STORE_PARAM"),
        "MINDBRICKS_SUFFIX": os.getenv("MINDBRICKS_SUFFIX"),
        "MINDBRICKS_API_KEY_SET": bool(os.getenv("MINDBRICKS_API_KEY")),
        "MINDBRICKS_SERVICE_TOKEN_SET": bool(os.getenv("MINDBRICKS_SERVICE_TOKEN")),
        "MB_DEBUG": os.getenv("MB_DEBUG"),
    }
    return {"env_vars": env_vars}

# Orchestrator (opsiyonel LLM akışı)
from core.orchestrator import run_orchestrator

@app.get("/orchestrate-llm")
async def orchestrate_llm(q: str = Query(..., description="Kullanıcı mesajı"),
                          store_id: str = Query(..., description="Mağaza ID")):
    try:
        return await run_orchestrator(user_query=q, store_id=store_id)
    except Exception as e:
        import logging; logging.exception("orchestrate failed")
        raise HTTPException(status_code=500, detail=f"orchestrate_failed: {e}")

@app.post("/orchestrate-llm")
async def orchestrate_llm_post(payload: dict = Body(...)):
    q = payload.get("q") or payload.get("message") or ""
    store_id = payload.get("store_id") or ""
    if not q or not store_id:
        raise HTTPException(400, detail="q and store_id required")
    try:
        return await run_orchestrator(user_query=q, store_id=store_id)
    except Exception as e:
        import logging; logging.exception("orchestrate failed")
        raise HTTPException(status_code=500, detail=f"orchestrate_failed: {e}")

# Test endpoint for direct inventory access
@app.get("/test/inventory")
async def test_inventory(store_id: str = Query(...)):
    """Test endpoint that uses MindbricksStockRepository directly"""
    if not app.state.mb_client:
        return {"error": "Mindbricks client not available"}
    
    try:
        repo = MindbricksStockRepository(app.state.mb_client)
        stock_data = await repo.get_stock_snapshot(store_id)
        
        return {
            "success": True,
            "store_id": store_id,
            "item_count": len(stock_data),
            "items": [
                {
                    "product_id": item.product_id,
                    "current_stock": item.current_stock,
                    "min_required": item.min_required,
                    "price": item.price
                } for item in stock_data[:10]  # İlk 10 ürün
            ]
        }
    except Exception as e:
        return {"success": False, "error": str(e), "store_id": store_id}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)