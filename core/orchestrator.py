# core/orchestrator.py
from __future__ import annotations

import os
import json
import asyncio
from typing import Any, Dict, Optional, List, Callable

from dotenv import load_dotenv
load_dotenv()

# ---- Mindbricks client
from infrastructure.external.mindbricks import MindbricksClient

# ---- Repo (memory ↔ Mindbricks)
from core.repositories.memory import InMemorySalesRepository, InMemoryStockRepository
try:
    # varsa iki repo da gelecek; yoksa Sales'i None bırakırız
    from core.repositories.mindbricks import MindbricksSalesRepository, MindbricksStockRepository  # type: ignore
except Exception:
    MindbricksSalesRepository = None  # type: ignore
    from core.repositories.mindbricks import MindbricksStockRepository  # type: ignore

# ---- Ajanlar
from core.agents.sales_agent import SalesAgent
from core.agents.stock_agent import StockAgent
from core.agents.report_agent import ReportAgent

# ---- Service katmanı (MB ↔ Lokal ajan seçimi)
from core.services.sales_service import SalesService
from core.services.stock_service import StockService
from core.services.report_service import ReportService

# ---- Cache
from infrastructure.caching.cache import make_cache


# =========================
# LLM (yalnız plan + özet)  → OPSİYONEL
# =========================
class _Gemini:
    def __init__(self, model: str = "gemini-1.5-pro"):
        import google.generativeai as genai  # type: ignore
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("Gemini API key missing. Set GOOGLE_API_KEY or VITE_GEMINI_API_KEY")
        genai.configure(api_key=api_key)
        self._model = genai.GenerativeModel(model)

    async def _gen(self, messages: List[Dict[str, Any]]) -> str:
        try:
            resp = await self._model.generate_content_async(messages)
            return getattr(resp, "text", "") or ""
        except Exception:
            return ""

    async def plan(self, user_query: str, store_id: str) -> Dict[str, Any]:
        system = (
            "You are a planner. Choose EXACTLY ONE tool from this allowlist and produce a minimal JSON plan.\n"
            "Allowed tools: sales.analyze, stock.analysis, report.build\n"
            "Return ONLY minified JSON without backticks or commentary."
        )
        user = f"""
User query (Turkish): {user_query}
Store id: {store_id}

Examples of valid outputs:
{{"tool":"sales.analyze","args":{{"store_id":"{store_id}"}}}}
{{"tool":"stock.analysis","args":{{"store_id":"{store_id}","product_id":"P100"}}}}
{{"tool":"report.build","args":{{"store_id":"{store_id}","request":"pdf raporu","format":"pdf"}}}}

Rules:
- If user asks about generating/downloading a report: tool="report.build".
- If user asks about stock / critical / reorder or a specific product: tool="stock.analysis".
- Else default to tool="sales.analyze".
""".strip()

        raw = await self._gen([{"role": "system", "parts": [system]}, {"role": "user", "parts": [user]}])
        if not raw:
            return {"tool": "sales.analyze", "args": {"store_id": store_id}}
        return _ensure_json(raw, default={"tool": "sales.analyze", "args": {"store_id": store_id}})

    async def summarize(self, user_query: str, tool: str, data: Dict[str, Any], extras: Dict[str, Any]) -> str:
        style = os.getenv("ASSISTANT_STYLE", "Kısa, açık ve kibar cevap ver. Emir kipinden kaçın.")
        sys = (
            "You are a Turkish assistant for retail analytics. "
            "Always answer in Turkish, short and clear. Never show JSON or code fences."
        )
        user = f"""
Kullanıcı isteği: {user_query}
Seçilen tool: {tool}
Özetlenecek veri: {json.dumps(_compact_payload(tool, data), ensure_ascii=False)}
Ek kurallar: {style}

Notlar:
- 'az satan & popülaritesi düşen' için weekly_trend < -0.05 ve total_sold düşük olanları vurgula.
- Rapor linki varsa bir kez ver.
""".strip()

        txt = await self._gen([{"role": "system", "parts": [sys]}, {"role": "user", "parts": [user]}])
        return txt.strip() if txt else _deterministic_summary(tool, data)


# =========================
# Yardımcılar
# =========================
def _ensure_json(raw: str, default: Dict[str, Any]) -> Dict[str, Any]:
    s = (raw or "").strip()
    if s.startswith("```"):
        parts = s.split("```")
        s = parts[1].strip() if len(parts) >= 2 else s.strip("`").strip()
    if s.lower().startswith("json"):
        s = s[4:].lstrip(": \n")
    try:
        out = json.loads(s)
        if isinstance(out, dict):
            return out
    except Exception:
        pass
    return default


def _compact_payload(tool: str, data: Dict[str, Any]) -> Dict[str, Any]:
    if tool == "sales.analyze":
        prods = data.get("products") or []
        top = sorted(prods, key=lambda p: float(p.get("total_revenue", 0.0)), reverse=True)[:3]
        lows = sorted(prods, key=lambda p: int(p.get("total_sold", 0)))[:3]
        return {
            "count": len(prods),
            "top_by_revenue": [
                {"id": p.get("product_id"), "name": p.get("product_name") or p.get("name"),
                 "sold": p.get("total_sold"), "rev": p.get("total_revenue"), "trend": p.get("weekly_trend")}
                for p in top
            ],
            "low_sellers": [
                {"id": p.get("product_id"), "name": p.get("product_name") or p.get("name"),
                 "sold": p.get("total_sold"), "trend": p.get("weekly_trend")}
                for p in lows
            ],
        }
    if tool in ("stock.analysis", "stock.product"):
        prods = data.get("products") or []
        crit = [p for p in prods if p.get("is_critical")]
        sample = (crit[:3] if crit else prods[:3])
        return {
            "count": len(prods),
            "critical_count": len(crit),
            "sample": [
                {"id": p.get("product_id"),
                 "name": p.get("name") or p.get("product_name"),
                 "onhand": p.get("current_stock"),
                 "avg_daily": p.get("avg_daily_sales"),
                 "eta": p.get("estimated_days_left"),
                 "reorder": p.get("reorder_qty_suggestion")}
                for p in sample
            ],
        }
    if tool == "report.build":
        return {"format": data.get("format"), "public_url": data.get("public_url")}
    return {"ok": True}


def _pick_product(products: List[Dict[str, Any]], product_id: Optional[str], name: Optional[str]) -> Optional[Dict[str, Any]]:
    if not products:
        return None
    if product_id:
        pid = str(product_id).upper().replace("P", "")
        for p in products:
            cand = str(p.get("product_id") or "").upper().replace("P", "")
            if pid == cand:
                return p
    if name:
        q = (name or "").strip().lower()
        if len(q) >= 3:
            cands = [p for p in products if q in str(p.get("name") or p.get("product_name") or "").lower()]
            if cands:
                return sorted(cands, key=lambda x: x.get("current_stock", 0), reverse=True)[0]
    return None


def _deterministic_summary(tool: str, data: Dict[str, Any]) -> str:
    if tool == "sales.analyze":
        prods = data.get("products") or []
        total = sum(float(p.get("total_revenue", 0)) for p in prods)
        top = sorted(prods, key=lambda p: float(p.get("total_revenue", 0)), reverse=True)[:1]
        name = (top[0].get("product_name") or top[0].get("name")) if top else "-"
        return f"Satış özeti hazır. Ürün: {len(prods)} • Toplam ciro: {total:,.2f} TL • En çok satan: {name}".replace(",", ".")
    if tool.startswith("stock"):
        prods = data.get("products") or []
        crit = [p for p in prods if p.get("is_critical")]
        return f"Stok özeti hazır. {len(prods)} ürün, {len(crit)} kritik."
    if tool == "report.build":
        url = data.get("public_url") or ""
        return f"Rapor hazır. İndirme: {url}" if url else "Rapor oluşturuldu."
    return "İstek işlendi."


# =========================
# Orchestrator (planner/executor)
# =========================
CACHE_TTL = int(os.getenv("CACHE_TTL_SECONDS", "600"))

class Orchestrator:
    """
    Planı (LLM varsa) üretir, uygun tool'u çalıştırır (sales/stock/report),
    sonucu kısa Türkçe özete çevirir. Analizi alt ajan/servis yapar.
    """

    def __init__(self) -> None:
        self.cache = make_cache()

        # Mindbricks client
        try:
            self.mb_client = MindbricksClient()
        except Exception:
            self.mb_client = None

        # Veri kaynağı seçimi (repo)
        use_mb_data = os.getenv("USE_MINDBRICKS_DATA", "1") == "1"
        if use_mb_data and self.mb_client:
            # SALES (Mindbricks repo implementasyonu varsa kullan; yoksa memory)
            if MindbricksSalesRepository:  # type: ignore
                sales_repo = MindbricksSalesRepository(self.mb_client)  # type: ignore
            else:
                sales_repo = InMemorySalesRepository(os.getenv("SALES_JSON_PATH", "data/sales.json"))
            # STOCK Mindbricks
            stock_repo = MindbricksStockRepository(self.mb_client)  # type: ignore
        else:
            sales_repo = InMemorySalesRepository(os.getenv("SALES_JSON_PATH", "data/sales.json"))
            stock_repo = InMemoryStockRepository(os.getenv("STOCK_JSON_PATH", "data/stock.json"))

        # Ajanlar (daima bizim ajanlar hesaplıyor)
        self.sales_agent = SalesAgent(sales_repo=sales_repo)
        self.stock_agent = StockAgent(sales_agent=self.sales_agent, stock_repo=stock_repo)
        self.report_agent = ReportAgent()

        # Servis katmanı (env flag'leri ile MB ↔ Lokal seçimi)
        self.sales_svc = SalesService(self.sales_agent, mb=self.mb_client)
        self.stock_svc = StockService(self.stock_agent, mb=self.mb_client)
        self.report_svc = ReportService(self.report_agent, mb=self.mb_client)

        # LLM opsiyonel (yoksa kural-tabanlı planner + deterministic summary)
        try:
            self.llm = _Gemini(model=os.getenv("GEMINI_MODEL", "gemini-1.5-pro"))
        except Exception:
            self.llm = None

        # Tool registry
        self.tools: Dict[str, Callable[..., Any]] = {
            "sales.analyze": self._exec_sales_analyze,
            "stock.analysis": self._exec_stock_analysis,
            "report.build": self._exec_report_build,
        }

    # ---- Tool implementasyonları (cache'li) ----
    async def _exec_sales_analyze(self, store_id: str, **kwargs) -> Dict[str, Any]:
        key = f"sales:{store_id}"
        cached = await self.cache.get_json(key)
        if cached:
            return {"cached": True, **cached}
        data = await self.sales_svc.analyze(store_id)
        await self.cache.set_json(key, data, CACHE_TTL)
        return {"cached": False, **data}

    async def _exec_stock_analysis(self, store_id: str, **kwargs) -> Dict[str, Any]:
        key = f"stock:{store_id}"
        cached = await self.cache.get_json(key)
        if cached:
            return {"cached": True, **cached}
        data = await self.stock_svc.analysis(store_id)
        await self.cache.set_json(key, data, CACHE_TTL)
        return {"cached": False, **data}

    async def _exec_report_build(self, store_id: str, request: str = "standart rapor",
                                 format: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        # rapor öncesi analizleri warm-up (cache)
        await asyncio.gather(self._exec_sales_analyze(store_id), self._exec_stock_analysis(store_id))
        res = await self.report_svc.build(store_id, request)
        return {
            "format": res.get("format"),
            "public_url": res.get("public_url") or res.get("url"),
            "path": res.get("path"),
            "spec": res.get("spec"),
        }

    # ---- LLM yoksa basit kural tabanlı plan ----
    def _rule_plan(self, user_query: str, store_id: str) -> Dict[str, Any]:
        q = (user_query or "").lower()
        if any(k in q for k in ["rapor", "pdf", "çıktı", "download", "indir"]):
            return {"tool": "report.build", "args": {"store_id": store_id, "request": "standart"}}
        if any(k in q for k in ["stok", "kritik", "reorder", "sipariş", "gün kaldı", "eta", "mevcut"]):
            import re
            m = re.search(r"\bP\d+\b", q.upper())
            args = {"store_id": store_id}
            if m:
                args["product_id"] = m.group(0)
            return {"tool": "stock.analysis", "args": args}
        return {"tool": "sales.analyze", "args": {"store_id": store_id}}

    # ---- Planı uygula ----
    async def run(self, user_query: str, store_id: str, user_request: Optional[str] = None) -> Dict[str, Any]:
        # 1) Plan
        plan = await self.llm.plan(user_query, store_id) if self.llm else self._rule_plan(user_query, store_id)

        tool = plan.get("tool", "")
        args = plan.get("args", {}) or {}
        args["store_id"] = store_id  # emniyet

        if tool not in self.tools:
            tool = "sales.analyze"

        # 2) Çalıştır
        data: Dict[str, Any]
        artifacts = {"report_path": "", "format": "none"}

        if tool == "report.build":
            if user_request:
                args["request"] = user_request
            rep = await self.tools[tool](**args)
            data = {"format": rep.get("format"), "public_url": rep.get("public_url"), "spec": rep.get("spec")}
            artifacts = {"report_path": rep.get("path") or "", "format": rep.get("format") or "html"}
        else:
            data = await self.tools[tool](**args)

        # 3) Tek ürün istenmişse daralt
        if tool == "stock.analysis" and ("product_id" in args or "name" in args or "product_name" in args):
            prod = _pick_product(
                data.get("products") or [],
                args.get("product_id"),
                args.get("name") or args.get("product_name"),
            )
            tool_for_summary = "stock.product" if prod else tool
            if prod:
                data = {"products": [prod], "count": 1}
        else:
            tool_for_summary = tool

        # 4) Özet
        reply = await self.llm.summarize(user_query, tool_for_summary, data, {}) if self.llm else _deterministic_summary(tool_for_summary, data)

        return {
            "intent": tool.replace(".", "_"),
            "data": data,
            "artifacts": artifacts,
            "reply": reply,
            "plan": plan,
        }


# FE’nin çağıracağı kolay fonksiyon
async def run_orchestrator(user_query: str, store_id: str, user_request: Optional[str] = None) -> Dict[str, Any]:
    orch = Orchestrator()
    return await orch.run(user_query, store_id, user_request)


# CLI
if __name__ == "__main__":
    async def _demo():
        out = await run_orchestrator("Bu hafta az satan ürün hangisi?", "ISTANBUL_AVM")
        print(json.dumps(out, ensure_ascii=False, indent=2))
    asyncio.run(_demo())
