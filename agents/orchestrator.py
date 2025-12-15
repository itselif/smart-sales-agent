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

        decision = self.llm(decision_prompt).strip()

        if decision == "sales_agent":
            return self.sales_agent.run(user_input, context)

        if decision == "reporting_agent":
            return self.reporting_agent.run(user_input, context)

        if decision == "stock_agent":
            return self.stock_agent.run(user_input, context)

        # fallback
        return {
            "error": "Could not determine the appropriate agent."
        }
