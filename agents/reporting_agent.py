from typing import Optional
from agents.base import BaseAgent


class ReportingAgent(BaseAgent):
    """
    Agent responsible for generating structured reports from sales data.
    """

    def build_prompt(self, user_input: str, context: Optional[str] = None) -> str:
        prompt = f"""
You are a reporting and business intelligence AI.

Your task:
- Generate structured reports from provided data
- Extract KPIs and metrics
- Output data in a structured format

Rules:
- Do NOT analyze reasons or provide opinions
- Do NOT invent data
- Use only the provided context

Data:
{context if context else "No data provided."}

User Request:
{user_input}

Output strictly in JSON with the following structure:
{{
  "summary": string,
  "kpis": object,
  "table": array
}}
"""
        return prompt
