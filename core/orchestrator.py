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

# ---- Repo (memory ↔ Mindbricks) - güvenli import
try:
    from core.repositories.memory import InMemorySalesRepository, InMemoryStockRepository  # type: ignore
except Exception:
    InMemorySalesRepository = None  # type: ignore
    InMemoryStockRepository = None  # type: ignore

try:
    from core.repositories.mindbricks import MindbricksSalesRepository, MindbricksStockRepository  # type: ignore
except Exception:
    MindbricksSalesRepository = None  # type: ignore
    MindbricksStockRepository = None  # type: ignore

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
# LLM (plan + özet) → OPSİYONEL
# =========================
# =========================
# LLM (plan + özet) → REST ile (grpc yok)
# =========================
class _Gemini:
    def __init__(self, model: str = "gemini-1.5-pro"):
        import httpx  # type: ignore
        self._api_key = (
            os.getenv("GOOGLE_API_KEY")
            or os.getenv("VITE_GEMINI_API_KEY")
            or os.getenv("GEMINI_API_KEY")
        )
        if not self._api_key:
            raise RuntimeError("Gemini API key missing. Set GOOGLE_API_KEY or VITE_GEMINI_API_KEY or GEMINI_API_KEY")

        self._model = os.getenv("GEMINI_MODEL", model)
        self._base = os.getenv("GEMINI_API_BASE", "https://generativelanguage.googleapis.com/v1")
        self._http = httpx.AsyncClient(timeout=30.0)

    async def _gen(self, prompt: str) -> str:
        """Gemini generateContent REST çağrısı."""
        url = f"{self._base}/models/{self._model}:generateContent?key={self._api_key}"
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": prompt}]}
            ]
        }
        try:
            r = await self._http.post(url, json=payload)
            r.raise_for_status()
            data = r.json()
            # metni çıkar
            try:
                cand = (data.get("candidates") or [])[0]
                parts = cand.get("content", {}).get("parts", [])
                for part in parts:
                    if "text" in part:
                        return (part["text"] or "").strip()
            except Exception:
                pass
            return ""
        except Exception as e:
            if os.getenv("MB_DEBUG", "0") == "1":
                print(f"[llm-rest] generate failed: {e}")
            return ""

    async def plan(self, user_query: str, store_id: str) -> Dict[str, Any]:
        prompt = (
            "You are an intent router + planner for a retail analytics assistant.\n"
            "Decide whether to call a tool or NOT call any tool (just chat/clarify).\n\n"
            "Allowed tools: sales.analyze, stock.analysis, report.build, none\n"
            "Output STRICTLY a minified JSON with fields: tool (string), args (object), rationale (string<=80 chars)\n"
            "If tool = none, DO NOT ask to call any tool. Keep args as {}.\n"
            "When none: it's for greetings, chit-chat, or clarifying questions about missing info.\n"
            "When report intent: use report.build. When stock intent: stock.analysis. Else: sales.analyze.\n"
            "Respond only JSON. No backticks.\n\n"
            f"User(Turkish): {user_query}\n"
            f"StoreId: {store_id}\n\n"
            "Examples:\n"
            f'{{"tool":"none","args":{{}},"rationale":"greeting only"}}\n'
            f'{{"tool":"report.build","args":{{"store_id":"{store_id}","format":"pdf"}},"rationale":"user asked for pdf report"}}\n'
            f'{{"tool":"stock.analysis","args":{{"store_id":"{store_id}","product_id":"P120"}},"rationale":"specific stock question"}}\n'
            f'{{"tool":"sales.analyze","args":{{"store_id":"{store_id}"}},"rationale":"generic sales insight"}}\n'
        )
        raw = await self._gen(prompt)
        if not raw:
            return {"tool": "sales.analyze", "args": {"store_id": store_id}, "rationale": "fallback"}
        return _ensure_json(raw, default={"tool": "sales.analyze", "args": {"store_id": store_id}})

    async def summarize(self, user_query: str, tool: str, data: Dict[str, Any], extras: Dict[str, Any]) -> str:
        style = os.getenv("ASSISTANT_STYLE", "Kısa, net, aksiyon odaklı yaz. Emir kipinden kaçın.")
        if tool == "none":
            prompt = (
                "You are a Turkish assistant for retail analytics. "
                "User wrote a greeting or a short chat/clarify input. "
                "Reply briefly, friendly, and guide user to actions (sales, stock, report). "
                "No code, no JSON, no tool suggestions. Keep it <= 2 short sentences.\n\n"
                f"Kullanıcı: {user_query}\n"
                f"Üslup: {style}\n"
            )
            txt = await self._gen(prompt)
            return txt or "Merhaba! Satış özeti, stok analizi veya rapor üretimi için isteğini yazabilirsin."

        sys_user_prompt = (
            "You are a Turkish assistant for retail analytics. "
            "Answer concise, action-oriented. Do not greet. No chit-chat. No code fences.\n\n"
            f"Kullanıcı isteği: {user_query}\n"
            f"Seçilen tool: {tool}\n"
            f"Özetlenecek veri: {json.dumps(_compact_payload(tool, data), ensure_ascii=False)}\n"
            f"Üslup: {style}\n\n"
            "Kurallar:\n"
            "- Sonuç cümleleri kısa ve net olsun.\n"
            "- weekly_trend < -0.05 ve total_sold düşük olanları 'az satan & düşen' diye belirt.\n"
            "- Link varsa bir kez, yalın biçimde ver.\n"
        )
        txt = await self._gen(sys_user_prompt)
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


def _tl(amount: float) -> str:
    """US -> TR sayı biçimi: 82,493.48 -> 82.493,48"""
    s = f"{amount:,.2f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def _compact_payload(tool: str, data: Dict[str, Any]) -> Dict[str, Any]:
    if tool == "sales.analyze":
        prods = data.get("products") or []
        if not prods:
            return {"count": 0, "top_by_revenue": [], "min_seller": None, "total_revenue_fmt": _tl(0.0)}
        top_rev = max(prods, key=lambda p: float(p.get("total_revenue", 0.0)))
        min_sold = min(prods, key=lambda p: int(p.get("total_sold", 0)))
        total_rev = sum(float(p.get("total_revenue", 0.0)) for p in prods)
        return {
            "count": len(prods),
            "top_by_revenue": [{
                "id": top_rev.get("product_id"),
                "name": top_rev.get("product_name") or top_rev.get("name"),
                "sold": top_rev.get("total_sold"),
                "rev": top_rev.get("total_revenue"),
                "trend": top_rev.get("weekly_trend"),
            }],
            "min_seller": {
                "id": min_sold.get("product_id"),
                "name": min_sold.get("product_name") or min_sold.get("name"),
                "sold": min_sold.get("total_sold"),
                "trend": min_sold.get("weekly_trend"),
            },
            "total_revenue_fmt": _tl(total_rev),
        }

    if tool in ("stock.analysis", "stock.product"):
        prods = data.get("products") or []
        crit = [p for p in prods if p.get("is_critical")]
        sample = (crit[:3] if crit else prods[:3])
        return {
            "count": len(prods),
            "critical_count": len(crit),
            "sample": [
                {
                    "id": p.get("product_id"),
                    "name": p.get("name") or p.get("product_name"),
                    "onhand": p.get("current_stock"),
                    "avg_daily": p.get("avg_daily_sales"),
                    "eta": p.get("estimated_days_left"),
                    "reorder": p.get("reorder_qty_suggestion"),
                }
                for p in sample
            ],
        }

    if tool == "report.build":
        return {"format": data.get("format"), "public_url": data.get("public_url")}

    return {"ok": True}


def _pick_product(products: List[Dict[str, Any]], product_id: Optional[str], name: Optional[str]) -> Optional[Dict[str, Any]]:
    if not products:
        return None

    # pydantic vs. olursa normalize et
    norm: List[Dict[str, Any]] = []
    for p in products:
        if isinstance(p, dict):
            norm.append(p)
            continue
        try:
            norm.append(p.model_dump() if hasattr(p, "model_dump") else dict(p))
        except Exception:
            continue

    if not norm:
        return None

    if product_id:
        pid = str(product_id).upper().replace("P", "")
        for p in norm:
            cand = str(p.get("product_id") or "").upper().replace("P", "")
            if pid == cand:
                return p
    if name:
        q = (name or "").strip().lower()
        if len(q) >= 3:
            cands = [p for p in norm if q in str(p.get("name") or p.get("product_name") or "").lower()]
            if cands:
                return sorted(cands, key=lambda x: x.get("current_stock", 0), reverse=True)[0]
    return None


def _deterministic_summary(tool: str, data: Dict[str, Any]) -> str:
    status = data.get("status")

    if tool == "sales.analyze":
        prods = data.get("products") or []
        if status == "no_data" or not prods:
            return "Bu tarih aralığında satış verisi bulunamadı."
        total = sum(float(p.get("total_revenue", 0)) for p in prods)
        top = max(prods, key=lambda p: float(p.get("total_revenue", 0)))
        name = (top.get("product_name") or top.get("name")) if top else "-"
        return f"Satış özeti hazır. Ürün: {len(prods)} • Toplam ciro: {_tl(total)} TL • En çok ciro: {name}"

    if tool.startswith("stock"):
        prods = data.get("products") or []
        crit = [p for p in prods if p.get("is_critical")]
        return f"Stok özeti hazır. {len(prods)} ürün, {len(crit)} kritik."

    if tool == "report.build":
        url = (data.get("public_url") or "").strip()
        return "Rapor hazır. İndirme bağlantısı mevcut." if url else "Rapor oluşturuldu."

    if tool == "none":
        return "Merhaba! Satış, stok veya rapor için nasıl yardımcı olabilirim?"

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
        self.debug = (os.getenv("MB_DEBUG", "0") == "1")

        # Mindbricks client
        try:
            self.mb_client = MindbricksClient()
        except Exception:
            self.mb_client = None

        # Veri kaynağı seçimi (repo)
        use_mb_data = os.getenv("USE_MINDBRICKS_DATA", "1") == "1"
        if use_mb_data and self.mb_client:
            # SALES
            if MindbricksSalesRepository:
                sales_repo = MindbricksSalesRepository(self.mb_client)  # type: ignore
            else:
                sales_repo = InMemorySalesRepository(os.getenv("SALES_JSON_PATH", "data/sales.json")) if InMemorySalesRepository else None  # type: ignore
            # STOCK
            if MindbricksStockRepository:
                stock_repo = MindbricksStockRepository(self.mb_client)  # type: ignore
            else:
                stock_repo = InMemoryStockRepository(os.getenv("STOCK_JSON_PATH", "data/stock.json")) if InMemoryStockRepository else None  # type: ignore
        else:
            sales_repo = InMemorySalesRepository(os.getenv("SALES_JSON_PATH", "data/sales.json")) if InMemorySalesRepository else None  # type: ignore
            stock_repo = InMemoryStockRepository(os.getenv("STOCK_JSON_PATH", "data/stock.json")) if InMemoryStockRepository else None  # type: ignore

        # Ajanlar
        self.sales_agent = SalesAgent(sales_repo=sales_repo)
        self.stock_agent = StockAgent(sales_agent=self.sales_agent, stock_repo=stock_repo)
        self.report_agent = ReportAgent()

        # Servis katmanı (env flag'leri ile MB ↔ Lokal seçimi)
        self.sales_svc = SalesService(self.sales_agent, mb=self.mb_client)
        self.stock_svc = StockService(self.stock_agent, mb=self.mb_client)
        self.report_svc = ReportService(self.report_agent, mb=self.mb_client)

        # LLM opsiyonel
        try:
            self.llm = _Gemini(model=os.getenv("GEMINI_MODEL", "gemini-1.5-pro"))
        except Exception as e:
            if self.debug:
                print(f"[orch] LLM disabled: {e}")
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

    # ---- LLM yoksa basit kural tabanlı plan (opsiyonel fallback) ----
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
        planner_used = "rule"
        try:
            if self.llm:
                plan = await self.llm.plan(user_query, store_id)
                planner_used = "gemini"
            else:
                plan = self._rule_plan(user_query, store_id)
        except Exception as e:
            if self.debug:
                print(f"[orch] plan failed -> rule fallback: {e}")
            plan = self._rule_plan(user_query, store_id)
            planner_used = "rule"

        tool = (plan.get("tool") or "").strip()
        args = (plan.get("args") or {})
        args["store_id"] = store_id  # emniyet

        if self.debug:
            print(f"[orch] plan={plan} (planner={planner_used})")

        # 2) 'none' → hiçbir tool çalıştırma, sohbet yanıtı üret
        if tool == "none":
            reply = await self.llm.summarize(user_query, tool, {}, {}) if self.llm else _deterministic_summary("none", {})
            return {
                "intent": "none",
                "data": {},
                "artifacts": {},
                "reply": reply,
                "plan": plan,
                "meta": {"planner": planner_used, "summarizer": "gemini" if self.llm else "deterministic", "cached": False},
            }

        # Tanınmayan tool → varsayılan satış analizi
        if tool not in self.tools:
            tool = "sales.analyze"

        # 3) Tool'u çalıştır
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

        # 4) Tek ürün istenmişse daralt (stok)
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

        # 5) Özet
        summarizer_used = "deterministic"
        try:
            if self.llm:
                reply = await self.llm.summarize(user_query, tool_for_summary, data, {})
                summarizer_used = "gemini" if reply else "deterministic"
                if not reply:
                    reply = _deterministic_summary(tool_for_summary, data)
            else:
                reply = _deterministic_summary(tool_for_summary, data)
        except Exception as e:
            if self.debug:
                print(f"[orch] summarize failed -> deterministic: {e}")
            reply = _deterministic_summary(tool_for_summary, data)
            summarizer_used = "deterministic"

        return {
            "intent": tool.replace(".", "_"),
            "data": data,
            "artifacts": artifacts,
            "reply": reply,
            "plan": plan,
            "meta": {
                "planner": planner_used,
                "summarizer": summarizer_used,
                "cached": bool(data.get("cached")),
            },
        }


# FE’nin çağıracağı kolay fonksiyon
async def run_orchestrator(user_query: str, store_id: str, user_request: Optional[str] = None) -> Dict[str, Any]:
    orch = Orchestrator()
    return await orch.run(user_query, store_id, user_request)


# CLI (quick demo)
if __name__ == "__main__":
    async def _demo():
        out = await run_orchestrator("Selam.", "ISTANBUL_AVM")
        print(json.dumps(out, ensure_ascii=False, indent=2))
    asyncio.run(_demo())
