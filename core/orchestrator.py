# core/orchestrator.py
from __future__ import annotations

import os, json, asyncio
from typing import Any, Dict

from dotenv import load_dotenv
load_dotenv()

# Tools / LLM
from langchain_core.tools import Tool
from langchain.agents import initialize_agent, AgentType
from langchain_google_genai import ChatGoogleGenerativeAI
try:
    from langchain_openai import ChatOpenAI
except Exception:
    ChatOpenAI = None

# Agents
from core.agents.sales_agent import SalesAgent
from core.agents.stock_agent import StockAgent
from core.agents.report_agent import ReportAgent

# Cache
from infrastructure.caching.cache import make_cache
import ast, re

# ---------- küçük yardımcılar ----------
def ensure_json(obj: Any) -> Dict[str, Any]:
    if isinstance(obj, dict):
        return obj
    if not isinstance(obj, str):
        try:
            return json.loads(json.dumps(obj))
        except Exception:
            return {"ok": True, "raw": str(obj)}
    s = obj.strip()
    m = re.search(r"```(?:json)?\s*(.*?)```", s, re.S | re.I)
    if m:
        s = m.group(1).strip()
    try:
        return json.loads(s)
    except Exception:
        pass
    try:
        lit = ast.literal_eval(s)
        if isinstance(lit, dict):
            return lit
    except Exception:
        pass
    return {"ok": True, "raw": s}

def normalize_orchestrator_output(out: Dict[str, Any]) -> Dict[str, Any]:
    # hedef şema: {intent, data, artifacts{report_path, format}}
    if "intent" in out:
        return out
    if all(k in out for k in ("format", "path", "spec")):
        return {
            "intent": "report",
            "data": {"spec": out["spec"]},
            "artifacts": {"report_path": out["path"], "format": out["format"]},
        }
    if "report" in out and isinstance(out["report"], dict):
        rep = out["report"]
        return {
            "intent": "report",
            "data": {"spec": rep.get("spec")},
            "artifacts": {"report_path": rep.get("path",""), "format": rep.get("format","html")},
        }
    return {"intent": "unknown", "data": out, "artifacts": {"report_path":"", "format":"none"}}

def rule_based_router(q: str) -> str:
    q = (q or "").lower()
    if any(k in q for k in ["rapor", "pdf", "report"]): return "report"
    if any(k in q for k in ["stok", "stock"]):          return "stock"
    return "sales"

def make_llm():
    gkey = os.getenv("GOOGLE_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")
    if gkey:
        return ChatGoogleGenerativeAI(
            model=os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),  # küçük model tercih
            temperature=0,
            google_api_key=gkey,
        )
    if ChatOpenAI and os.getenv("OPENAI_API_KEY"):
        return ChatOpenAI(model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"), temperature=0)
    return None

# ---------- orchestrator with caching ----------
CACHE_TTL = int(os.getenv("CACHE_TTL_SECONDS", "600"))  # 10 dk

async def build_orchestrator_agent():
    cache = make_cache()
    sales = SalesAgent()
    stock = StockAgent(sales_agent=sales)
    report = ReportAgent()

    async def tool_sales(store_id: str) -> Dict[str, Any]:
        key = f"sales:{store_id}:{sales.trend_analysis_period}"
        cached = await cache.get_json(key)
        if cached:
            return {"cached": True, **cached}
        data = await sales.analyze_sales(store_id=store_id)
        await cache.set_json(key, data, CACHE_TTL)
        return {"cached": False, **data}

    async def tool_stock(store_id: str) -> Dict[str, Any]:
        key = f"stock:{store_id}"
        cached = await cache.get_json(key)
        if cached:
            return {"cached": True, **cached}
        data = await stock.analyze_stock(store_id=store_id)
        await cache.set_json(key, data, CACHE_TTL)
        return {"cached": False, **data}

    # core/orchestrator.py içindeki tool_report'u değiştir
    def _summarize_sales_for_report(s: dict) -> dict:
        prods = s.get("products", [])
        total_units = sum(p.get("total_sold", 0) for p in prods)
        total_rev = sum(p.get("total_revenue", 0.0) for p in prods)
        top = sorted(prods, key=lambda x: x.get("total_revenue", 0.0), reverse=True)[:5]
        top_sellers = [
            {
                "productId": p["product_id"],
                "name": p.get("product_name", "?"),
                "units": int(p.get("total_sold", 0)),
                "revenue": round(p.get("total_revenue", 0.0), 2),
            } for p in top
        ]
        return {
            "totalRevenue": round(total_rev, 2),
            "totalUnits": int(total_units),
            "topSellers": top_sellers,
            # İstersen trendByDay ekleyebiliriz; şimdilik boş bırak.
            # "trendByDay": [{"date": "...", "revenue": ...}, ...]
        }

    def _summarize_stock_for_report(st: dict) -> dict:
        snaps = []
        for p in st.get("products", []):
            snaps.append({
                "productId": p["product_id"],
                "onHand": int(p.get("current_stock", 0)),
                "avgDailySales": float(p.get("avg_daily_sales", 0.0) or 0.0),
                "estimatedDaysToZero": p.get("estimated_days_left"),
            })
        return {
            "total_value": round(float(st.get("total_value", 0.0)), 2),
            "snapshots": snaps,
        }

    async def tool_report(store_id: str, user_request: str = "standart rapor") -> Dict[str, Any]:
        # 1) sales & stock (cache’li zaten)
        s = await tool_sales(store_id)   # aynı dosyada tanımlı async fonksiyonu çağırıyoruz
        st = await tool_stock(store_id)

        sales_view = _summarize_sales_for_report(s)
        stock_view = _summarize_stock_for_report(st)

        # 2) LLM rapor taslağı (spec) + render
        spec = await report.design_spec(
            user_request=user_request,
            store_id=store_id,
            sales=sales_view,
            stock=stock_view,
        )
        html = report.render(store_id=store_id, spec=spec)
        fmt, path = report.to_pdf_or_html(html, prefer_pdf=True)
        return {"format": fmt, "path": path, "spec": spec}


    tools = [
        Tool(name="SalesAnalysis", description="Input: store_id (str). Sales analysis.", func=None, coroutine=tool_sales),
        Tool(name="StockAnalysis", description="Input: store_id (str). Stock analysis.", func=None, coroutine=tool_stock),
        Tool(
            name="BuildReport",
            description="Input: store_id (str). Build report (PDF/HTML).",
            func=None,
            coroutine=tool_report,
            return_direct=True, 
        ),
    ]


    llm = make_llm()
    if llm is None:
        return None, tools  # LLM yoksa kural tabanlı çalışacağız

    system_rules = (
        "You are a router. Pick exactly one tool based on the user's text.\n"
        "- report/pdf -> BuildReport\n"
        "- stock -> StockAnalysis\n"
        "- else -> SalesAnalysis\n"
        "Always output pure JSON: {\"intent\":\"sales|stock|report\",\"data\":{...},\"artifacts\":{\"report_path\":\"\",\"format\":\"pdf|html|none\"}}"
    )

    agent = initialize_agent(
        tools=tools,
        llm=llm.bind(system_message=system_rules),
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True,
        max_iterations=4,
        handle_parsing_errors=True,
    )
    return agent, tools


async def run_orchestrator(user_query: str, store_id: str) -> Dict[str, Any]:
    agent, tools = await build_orchestrator_agent()

    # LLM yoksa (veya quota’da patlarsa) → kural tabanlı çağrı
    async def call_tool(name: str):
        for t in tools:
            if t.name == name:
                return await t.coroutine(store_id)
        raise RuntimeError("Tool not found.")

    if agent is None:
        intent = rule_based_router(user_query)
        if intent == "sales":
            data = await call_tool("SalesAnalysis")
            return {"intent": "sales", "data": data, "artifacts": {"report_path": "", "format": "none"}}
        if intent == "stock":
            data = await call_tool("StockAnalysis")
            return {"intent": "stock", "data": data, "artifacts": {"report_path": "", "format": "none"}}
        res = await call_tool("BuildReport")
        return {"intent": "report", "data": {"spec": res.get("spec")}, "artifacts": {"report_path": res.get("path",""), "format": res.get("format","html")}}

    # LLM sadece routing için (küçük prompt)
    prompt = f"Kullanıcı isteği: {user_query}\nMağaza: {store_id}\nJSON ile yanıtla."
    try:
        res = await agent.ainvoke({"input": prompt})
        text = res.get("output", res)
        out = ensure_json(text)
        # tool’un ham sonucu zaten JSON döner; FE direkt kullanır
        return out
    except Exception as e:
        # Quota/LLM hatası → kural tabanlı fallback
        intent = rule_based_router(user_query)
        base = {"intent": intent, "artifacts": {"report_path": "", "format": "none"}, "note": f"LLM fallback: {type(e).__name__}"}
        if intent == "sales":
            data = await call_tool("SalesAnalysis"); base["data"] = data; return base
        if intent == "stock":
            data = await call_tool("StockAnalysis"); base["data"] = data; return base
        res = await call_tool("BuildReport")
        base["data"] = {"spec": res.get("spec")}
        base["artifacts"] = {"report_path": res.get("path",""), "format": res.get("format","html")}
        return base


# CLI demo
if __name__ == "__main__":
    async def _demo():
        out = await run_orchestrator("ISTANBUL_AVM için pdf raporu üret", "ISTANBUL_AVM")
        print(json.dumps(out, ensure_ascii=False, indent=2))
    asyncio.run(_demo())
