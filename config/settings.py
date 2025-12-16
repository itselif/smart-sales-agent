import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


def get_llm():
    model = genai.GenerativeModel("models/gemini-2.5-flash")

    def call_llm(prompt: str) -> str:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0,
                "max_output_tokens": 1024,
            }
        )
        return response.text.strip()

    return call_llm
