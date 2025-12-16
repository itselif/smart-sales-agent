import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def get_llm():
    def call_llm(prompt: str) -> str:
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0,
                max_tokens=1024,
            )
            return (response.choices[0].message.content or "").strip()
        except Exception as exc:
            return f"An error occurred during the LLM call: {type(exc).__name__}: {exc}"

    return call_llm
