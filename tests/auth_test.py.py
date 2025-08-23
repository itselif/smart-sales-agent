import os
from dotenv import load_dotenv

# .env'yı yükle
load_dotenv()

# Tüm environment variables'ları listeleyin
print("All environment variables from .env:")
for key, value in os.environ.items():
    if key.startswith('GOOGLE') or key.startswith('GEMINI') or key.startswith('MB_'):
        print(f"{key}: {value}")

# Özellikle API key'i kontrol edin
api_key = os.getenv("GOOGLE_API_KEY")
print(f"\nGOOGLE_API_KEY: {'SET' if api_key else 'NOT SET'}")
if api_key:
    print(f"Key length: {len(api_key)}")
    print(f"Key starts with: {api_key[:10]}...")