# core/orchestrator.py
from __future__ import annotations

import os
import json
import asyncio
import re
from typing import Any, Dict, Optional, Literal

from dotenv import load_dotenv
from pydantic import BaseModel

from core.agents.sales_agent import SalesAgent
from core.agents.stock_agent import StockAgent
from core.agents.report_agent import ReportAgent, LLMClientProtocol

from core.repositories.memory import InMemorySalesRepository, InMemoryStockRepository
# from core.repositories.postgres import PostgresSalesRepository, PostgresStockRepository

from infrastructure.caching.cache import make_cache

load_dotenv()

# ==========================
# Basit yardımcılar
# ==========================
def ensure_json_like(obj: Any) -> Dict[str, Any]:
    if isinstance(obj, dict):
        return obj
    s = (str(obj or "").strip())
    # code fence temizliği
    if s.startswith("```"):
        parts = s.split("```")
        if len(parts) >= 2:
            s = parts[1].strip()
        else:
            s = s.strip("`").strip()
    low = s.lower()
    if low.startswith("jsonc"):
        s = s[5:].lstrip(": \n")
    elif low.startswith("json"):
        s = s[4:].lstrip(": \n")
    try:
        return json.loads(s)
    except Exception:
        return {"raw": s}

def normalize_output(intent: Literal["sales","stock","report","unknown"], data: Dict[str, Any], *, report_path: str = "", fmt: Literal["pdf","html","none"] = "none") -> Dict[str, Any]:
    return {"intent": intent, "data": data, "artifacts": {"report_path": report_path, "format": fmt}}

# ==========================
# Opsiyonel LLM (DI)
# ==========================
class _GeminiClient(LLMClientProtocol):
    """İstersen kullan; yoksa None geçir."""
    def __init__(self, api_key: str, model: str = "gemini-1.5-pro"):
        # import’u local tutuyoruz ki opsiyonel olsun
        import google.generativeai as genai  # type: ignore
        genai.configure(api_key=api_key)
        self._model = genai.GenerativeModel(model)

    async def generate_content_async(self, prompt: str | list) -> Any:
        return await self._model.generate_content_async(prompt)

def make_llm() -> Optional[LLMClientProtocol]:
    gkey = os.getenv("GOOGLE_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")
    if gkey:
        return _GeminiClient(gkey, os.getenv("GEMINI_MODEL", "gemini-1.5-pro"))
    # İstersen OpenAI benzeri başka bir client da eklenebilir
    return None

# ==========================
# Router (LLM’siz, hafif)
# ==========================
REPORT_WORDS = ("report","rapor","pdf","çıktı","döküm","doküman")
STOCK_WORDS  = ("stock","stok","envanter","kritik","reorder","satın alma")
SALES_WORDS  = ("sales","satış","ciro","trend","forecast","tahmin")

def choose_intent(user_text: str) -> Literal["report","stock","sales"]:
    t = (user_text or "").lower()
    if any(w in t for w in REPORT_WORDS):
        return "report"
    if any(w in t for w in STOCK_WORDS):
        return "stock"
    # default
    return "sales"

# ==========================
# Orchestrator
# ==========================
CACHE_TTL = int(os.getenv("CACHE_TTL_SECONDS", "600"))  # 10 dk

class Orchestrator:
    def __init__(self):
        self.cache = make_cache()

        # DI: repository seçimi (varsayılan memory)
        if os.getenv("USE_MEMORY", "1") == "1":
            sales_repo = InMemorySalesRepository(os.getenv("SALES_JSON_PATH", "data/sales.json"))
            stock_repo = InMemoryStockRepository(os.getenv("STOCK_JSON_PATH", "data/stock.json"))
        else:
            sales_repo = None
            stock_repo = None
            # sales_repo = PostgresSalesRepository(dsn=os.getenv("PG_DSN"))
            # stock_repo = PostgresStockRepository(dsn=os.getenv("PG_DSN"))

        # Opsiyonel LLM (sadece ReportAgent/SalesAgent içgörüler için)
        llm = make_llm()

        self.sales = SalesAgent(sales_repo=sales_repo, llm=llm)   # llm opsiyonel
        self.stock = StockAgent(sales_agent=self.sales, stock_repo=stock_repo)
        self.report = ReportAgent(llm=llm)                        # llm opsiyonel

    # ---- Tool benzeri metodlar ----
    async def tool_sales(self, store_id: str) -> Dict[str, Any]:
        key = f"sales:{store_id}:{self.sales.trend_analysis_period}"
        cached = await self.cache.get_json(key)
        if cached:
            return {"cached": True, **cached}
        data = await self.sales.analyze_sales(store_id=store_id)
        await self.cache.set_json(key, data, CACHE_TTL)
        return {"cached": False, **data}

    async def tool_stock(self, store_id: str) -> Dict[str, Any]:
        key = f"stock:{store_id}"
        cached = await self.cache.get_json(key)
        if cached:
            return {"cached": True, **cached}
        data = await self.stock.analyze_stock(store_id=store_id)
        await self.cache.set_json(key, data, CACHE_TTL)
        return {"cached": False, **data}

    async def tool_report(self, store_id: str, user_request: str = "standart rapor") -> Dict[str, Any]:
        # Sales + Stock paralel
        s_task = asyncio.create_task(self.tool_sales(store_id))
        st_task = asyncio.create_task(self.tool_stock(store_id))
        s, st = await asyncio.gather(s_task, st_task)

        out = await self.report.build_report(
            store_id=store_id,
            user_request=user_request,
            sales=s,
            stock=st,
            prefer_pdf=True,
        )
        # {"format","path","spec"}
        return out

    # ---- Ana giriş noktası ----
    async def run(self, user_query: str, store_id: str, user_request: Optional[str] = None) -> Dict[str, Any]:
        intent = choose_intent(user_query)

        if intent == "report":
            rep = await self.tool_report(store_id, user_request or user_query)
            return normalize_output("report", {"spec": rep.get("spec")}, report_path=rep.get("path",""), fmt=rep.get("format","html"))

        if intent == "stock":
            st = await self.tool_stock(store_id)
            return normalize_output("stock", st)

        # default sales
        sa = await self.tool_sales(store_id)
        return normalize_output("sales", sa)


# CLI demo
if __name__ == "__main__":
    async def _demo():
        orch = Orchestrator()
        out = await orch.run("ISTANBUL_AVM için pdf raporu üret", "ISTANBUL_AVM")
        print(json.dumps(out, ensure_ascii=False, indent=2))
    asyncio.run(_demo())
