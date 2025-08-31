# api/main.py
from __future__ import annotations

import os
import json
from pathlib import Path
from typing import Optional, Dict, Any
from fastapi import FastAPI, Query, HTTPException, Body, Depends
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
ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

def env_flag(name: str, default: str = "0") -> bool:
    return (os.getenv(name, default) or "").strip() == "1"

def any_true(*flags: bool) -> bool:
    return any(bool(f) for f in flags)

# Bayraklar
USE_MB_DATA      = env_flag("USE_MINDBRICKS_DATA")
USE_MB_SALES     = env_flag("USE_MINDBRICKS_SALES")
USE_MB_STOCK     = env_flag("USE_MINDBRICKS_STOCK")
USE_MB_REPORTING = env_flag("USE_MINDBRICKS_REPORTING")
USE_MEMORY       = env_flag("USE_MEMORY", "1")

MB_SUFFIX = (os.getenv("MINDBRICKS_SUFFIX", "") or "").strip()
MB_TOKEN  = (os.getenv("MINDBRICKS_SERVICE_TOKEN") or os.getenv("MINDBRICKS_API_KEY") or "").strip()
MB_ACTIVE = any_true(USE_MB_DATA, USE_MB_SALES, USE_MB_STOCK, USE_MB_REPORTING)

# UserPreference servis & path’leri (Mindbricks)
PREF_SERVICE      = (os.getenv("MINDBRICKS_PREF_SERVICE") or "storemanagement").strip()
PREF_LIST_PATH    = (os.getenv("MINDBRICKS_PREF_LIST_PATH") or "/pref/listPref").strip()
PREF_CREATE_PATH  = (os.getenv("MINDBRICKS_PREF_CREATE_PATH") or "/pref/createPref").strip()
PREF_UPDATE_PATH  = (os.getenv("MINDBRICKS_PREF_UPDATE_PATH") or "/pref/updatePref").strip()

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
BASE_DIR = Path(__file__).resolve().parents[1]
REPORT_DIR = (BASE_DIR / "storage" / "reports").absolute()
REPORT_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/reports", StaticFiles(directory=str(REPORT_DIR)), name="reports")

# JSON fallback (MB yoksa)
PREFS_PATH = (BASE_DIR / "storage" / "user_prefs.json").absolute()
PREFS_PATH.parent.mkdir(parents=True, exist_ok=True)
if not PREFS_PATH.exists():
    PREFS_PATH.write_text("{}", encoding="utf-8")

def _load_prefs_fs() -> Dict[str, Any]:
    try:
        return json.loads(PREFS_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}

def _save_prefs_fs(data: Dict[str, Any]) -> None:
    PREFS_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

# App state
app.state.mb_client: Optional[MindbricksClient] = None
app.state.sales_svc: Optional[SalesService] = None
app.state.stock_svc: Optional[StockService] = None
app.state.report_svc: Optional[ReportService] = None
app.state.report_dir = str(REPORT_DIR)

# ========== Startup ==========
@app.on_event("startup")
async def _startup() -> None:
    # Mindbricks client
    if MB_ACTIVE and MB_SUFFIX and MB_TOKEN:
        print(f"[MB][startup] enabling Mindbricks client  suffix={MB_SUFFIX}  token_set={bool(MB_TOKEN)}")
        app.state.mb_client = MindbricksClient()
    else:
        print(f"[MB][startup] disabled (MB_ACTIVE={MB_ACTIVE}, suffix={'OK' if MB_SUFFIX else 'MISSING'}, token={'OK' if MB_TOKEN else 'MISSING'})")
        app.state.mb_client = None

    # Sales / Stock / Report servisleri
    sales_repo = MindbricksSalesRepository(app.state.mb_client) if app.state.mb_client else None
    sales_agent = SalesAgent(sales_repo=sales_repo)

    stock_repo = MindbricksStockRepository(app.state.mb_client) if app.state.mb_client else None
    stock_agent = StockAgent(sales_agent=sales_agent, stock_repo=stock_repo)

    report_agent = ReportAgent(output_dir=str(REPORT_DIR))

    app.state.sales_svc  = SalesService(sales_agent,  mb=app.state.mb_client)
    app.state.stock_svc  = StockService(stock_agent,  mb=app.state.mb_client)
    app.state.report_svc = ReportService(
        report_agent, mb=app.state.mb_client,
        public_mount_prefix="/reports", report_dir=str(REPORT_DIR)
    )

# ========== Helpers ==========
def _need_mb(mb: Optional[MindbricksClient]) -> MindbricksClient:
    if not mb:
        raise HTTPException(503, detail="Mindbricks client not available")
    return mb

# ========== Endpoints ==========
@app.get("/")
async def root():
    return {"status": "ok", "message": "StorePilot API çalışıyor"}

@app.get("/healthz")
async def healthz():
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
    if "public_url" not in res or not res.get("public_url"):
        path = res.get("path")
        if path:
            fname = os.path.basename(path)
            res["public_url"] = f"/reports/{fname}"
            res["download_url"] = f"/report/download?name={fname}"
    return res

@app.get("/report/download")
async def report_download(name: str = Query(...)):
    safe_path = (REPORT_DIR / name).absolute()
    if not str(safe_path).startswith(str(REPORT_DIR)) or not safe_path.exists():
        raise HTTPException(status_code=404, detail="Dosya bulunamadı")
    return FileResponse(str(safe_path), filename=name)

# ---- STORES LIST (proxy) ----
@app.get("/stores/list")
async def stores_list():
    if not app.state.mb_client:
        return {"stores": []}

    service = os.getenv("MINDBRICKS_STORE_SERVICE", "storemanagement").strip() or "storemanagement"
    env_path = (os.getenv("MINDBRICKS_STORES_LIST_PATH") or "/stores").strip()

    candidate_paths = []
    candidate_paths.append(env_path if env_path.startswith("/") else f"/{env_path}")
    if "/stores" not in candidate_paths:
        candidate_paths.append("/stores")
    if "/store" not in candidate_paths:
        candidate_paths.append("/store")

    last_err = None
    for path in candidate_paths:
        try:
            raw = await app.state.mb_client.get_json(service, path, params={"limit": 100})
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
                for it in items if it is not None
            ]
            return {"stores": stores, "source_path_tried": path}
        except Exception as e:
            last_err = str(e)
            continue

    return {"stores": [], "error": last_err or "unknown_error"}

# ---- USER PREFS (Mindbricks + FS fallback) ----
@app.get("/user/prefs")
async def get_user_prefs(user_id: str = Query(..., description="Auth user id")):
    # MB varsa oradan çek
    if app.state.mb_client:
        try:
            raw = await app.state.mb_client.get_json(
                PREF_SERVICE, PREF_LIST_PATH, params={"userId": user_id, "limit": 1}
            )
            items = raw.get("userpreferences") or raw.get("items") or raw.get("data") or []
            if items:
                it = items[0]
                return {
                    "id": it.get("id") or it.get("_id"),
                    "userId": it.get("userId"),
                    "storeId": it.get("storeId") or None,
                    "selectedStoreIds": it.get("selectedStoreIds") or [],
                }
        except Exception as e:
            # düş ve FS fallback
            print("[prefs][MB] list failed:", e)

    # FS fallback
    data = _load_prefs_fs()
    prefs = data.get(user_id) or {}
    return {
        "id": None,
        "userId": user_id,
        "storeId": prefs.get("current_store_id") or None,
        "selectedStoreIds": prefs.get("selected_store_ids") or [],
    }

@app.post("/user/prefs")
async def upsert_user_prefs(payload: Dict[str, Any] = Body(...)):
    user_id = payload.get("userId") or payload.get("user_id")
    if not user_id:
        raise HTTPException(400, detail="userId required")

    store_id = payload.get("storeId") or payload.get("current_store_id")
    selected_ids = payload.get("selectedStoreIds") or payload.get("selected_store_ids") or []

    # MB varsa upsert
    if app.state.mb_client:
        try:
            # önce var mı bak
            raw = await app.state.mb_client.get_json(
                PREF_SERVICE, PREF_LIST_PATH, params={"userId": user_id, "limit": 1}
            )
            items = raw.get("userpreferences") or raw.get("items") or []
            if items:
                pref_id = items[0].get("id") or items[0].get("_id")
                # bazı şemalarda path /pref/updatePref/{id}, bazısında body'de id beklenir
                patch_body = {"storeId": store_id, "selectedStoreIds": selected_ids}
                try:
                    res = await app.state.mb_client.patch_json(
                        PREF_SERVICE, f"{PREF_UPDATE_PATH}/{pref_id}", data=patch_body
                    )
                except Exception:
                    res = await app.state.mb_client.patch_json(
                        PREF_SERVICE, PREF_UPDATE_PATH, data={**patch_body, "id": pref_id}
                    )
                return {"ok": True, "id": pref_id, "data": res}
            else:
                # create
                create_body = {"userId": user_id, "storeId": store_id, "selectedStoreIds": selected_ids}
                res = await app.state.mb_client.post_json(PREF_SERVICE, PREF_CREATE_PATH, data=create_body)
                new_id = res.get("id") or res.get("_id")
                return {"ok": True, "id": new_id, "data": res}
        except Exception as e:
            print("[prefs][MB] upsert failed -> FS fallback:", e)

    # FS fallback
    data = _load_prefs_fs()
    data[user_id] = {"current_store_id": store_id, "selected_store_ids": selected_ids}
    _save_prefs_fs(data)
    return {"ok": True, "id": None, "data": {"source": "fs"}}

# ---- Debug / Env ----
@app.get("/debug/stock")
async def debug_stock(store_id: str = Query(..., description="Mağaza ID veya GUID")):
    if not app.state.mb_client:
        return {"success": False, "error": "Mindbricks client not available"}
    try:
        data = await app.state.mb_client.get_json(
            "inventorymanagement", "/inventoryitems",
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

@app.get("/debug/env")
async def debug_env():
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

# Orchestrator
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

# Test endpoint
@app.get("/test/inventory")
async def test_inventory(store_id: str = Query(...)):
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
                } for item in stock_data[:10]
            ]
        }
    except Exception as e:
        return {"success": False, "error": str(e), "store_id": store_id}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
