from typing import Optional
from agents.base import BaseAgent


class SalesAgent(BaseAgent):
    """
    Agent responsible for analyzing sales data and providing insights.
    """

    def build_prompt(self, user_input: str, context: Optional[str] = None) -> str:
        prompt = f"""
You are a senior sales analyst AI.

Your responsibilities:
- Analyze sales performance
- Identify trends and anomalies
- Provide clear business insights
- Suggest actionable recommendations

Rules:
- Do NOT invent data
- Use only the provided context
- Be concise and business-oriented

Sales Data:
{context if context else "No sales data provided."}

User Question:
{user_input}

Answer as a sales expert.
"""
        return prompt
