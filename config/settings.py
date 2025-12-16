import os
from dotenv import load_dotenv
from openai import OpenAI
from databases import Database

load_dotenv()

DATABASE_URL = "sqlite:///./db/inventory.db"
database = Database(DATABASE_URL)

_client = None

def get_client():
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        _client = OpenAI(api_key=api_key)
    return _client

def get_llm():
    def call_llm(prompt: str) -> str:
        try:
            client = get_client()
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
