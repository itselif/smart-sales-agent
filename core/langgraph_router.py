# orchestrator/langgraph_router.py (örnek)
import os, asyncio, json
from dotenv import load_dotenv
load_dotenv()

from langchain_core.tools import Tool
from langgraph.prebuilt import create_react_agent
from langchain_google_genai import ChatGoogleGenerativeAI

from core.agents.sales_agent import SalesAgent
from core.agents.stock_agent import StockAgent
from core.agents.report_agent import ReportAgent

async def build_graph():
    sales = SalesAgent()
    stock = StockAgent(sales_agent=sales)
    report = ReportAgent()

    async def tool_sales(store_id: str):  return await sales.analyze_sales(store_id=store_id)
    async def tool_stock(store_id: str):  return await stock.analyze_stock(store_id=store_id)
    async def tool_report(store_id: str):
        s = await sales.analyze_sales(store_id=store_id)
        st = await stock.analyze_stock(store_id=store_id)
        spec = await report.design_spec("standart", store_id, s if s.get("status")=="success" else None, st)
        html = report.render(store_id, spec); fmt, path = report.to_pdf_or_html(html, True)
        return {"format": fmt, "path": path, "spec": spec}

    tools = [
        Tool(name="SalesAnalysis", func=None, coroutine=tool_sales, description="sales"),
        Tool(name="StockAnalysis", func=None, coroutine=tool_stock, description="stock"),
        Tool(name="BuildReport",  func=None, coroutine=tool_report, description="report"),
    ]

    llm = ChatGoogleGenerativeAI(model=os.getenv("GEMINI_MODEL","gemini-1.5-flash"), temperature=0, google_api_key=os.getenv("GOOGLE_API_KEY"))
    graph = create_react_agent(llm, tools)  # graph.invoke / astream vb.
    return graph

async def demo():
    graph = await build_graph()
    res = await graph.ainvoke({"messages": [{"role":"user","content":"ISTANBUL_AVM için rapor üret"}]})
    print(res)  # dict döner; tool sonuçlarını içerir

if __name__ == "__main__":
    asyncio.run(demo())
