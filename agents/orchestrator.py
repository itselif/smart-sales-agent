from agents.sales_agent import SalesAgent
from agents.reporting_agent import ReportingAgent
from agents.stock_agent import StockAgent


class Orchestrator:
    """
    Decides which agent should handle the user's request.
    """

    def __init__(self, llm):
        self.llm = llm

        self.sales_agent = SalesAgent(
            name="sales_agent",
            llm=llm,
            system_prompt=""
        )

        self.reporting_agent = ReportingAgent(
            name="reporting_agent",
            llm=llm,
            system_prompt=""
        )

        self.stock_agent = StockAgent(
            name="stock_agent",
            llm=llm,
            system_prompt=""
        )

    def route(self, user_input: str, context: str = None):
        decision_prompt = f"""
You are an AI orchestrator.

Your task is to decide which agent should handle the user's request.

Agents:
- sales_agent: sales analysis, trends, insights, recommendations
- reporting_agent: structured reports, KPIs, tables, summaries
- stock_agent: inventory risk, stock levels, replenishment or transfer suggestions

User request:
"{user_input}"

Respond with ONLY one of the following values:
- sales_agent
- reporting_agent
- stock_agent
"""

        decision_raw = self.llm(decision_prompt)
        decision = (decision_raw or "").strip()

        # If the LLM call returned an error message, directly return it to the user
        if "An error occurred in the LLM call" in decision:
            return {
                "agent": "general",
                "response": decision,
                "output": decision,
                "data": None,
                "publicUrl": None,
                "downloadUrl": None,
                "meta": {},
            }

        d = decision.lower()

        if d in ("sales_agent", "sales"):
            return self.sales_agent.run(user_input, context)

        if d in ("reporting_agent", "report", "report_agent"):
            return self.reporting_agent.run(user_input, context)

        if d in ("stock_agent", "stock", "inventory_agent", "inventory"):
            return self.stock_agent.run(user_input, context)

        if "sales" in d:
            return self.sales_agent.run(user_input, context)

        if "report" in d:
            return self.reporting_agent.run(user_input, context)

        if "stock" in d or "inventory" in d:
            return self.stock_agent.run(user_input, context)

        # fallback
        fallback_text = "I couldn't route your request to a suitable agent at the moment. Could you please clarify your request a bit more?"
        return {
            "agent": "general",
            "response": fallback_text,
            "output": fallback_text,
        }
