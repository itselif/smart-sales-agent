# Smart Sales Agent — Development Guide

```bash
# ===============================
# Terminal A — Backend (FastAPI)
# ===============================

# 1) Proje köküne geç
cd E:\smart-sales-agent

# 2) (Opsiyonel) sanal ortamı aktif et
.\.venv\Scripts\activate
.\.venv312\Scripts\activate

# Requiremts içeriğini indir
pip install -r requirements.txt

# 3) .env içinde olduğundan emin ol (örnek içerik)
# GOOGLE_API_KEY=.....
# GEMINI_MODEL=gemini-1.5-flash
# TZ=Europe/Istanbul

# 4) Backend’i çalıştır
python -m uvicorn api.main:app --reload --port 8000

# Test Endpoints:
# http://localhost:8000/healthz
# http://localhost:8000/sales/analyze?store_id=ISTANBUL_AVM
# http://localhost:8000/stock/analysis?store_id=ISTANBUL_AVM
# http://localhost:8000/orchestrate-llm?q=pdf%20raporu%20%C3%BCret&store_id=ISTANBUL_AVM

# Durdurmak için: Ctrl + C


# ===============================
# Terminal B — Frontend (Vite/React)
# ===============================

# 1) FE klasörüne geç
cd E:\smart-sales-agent\frontend

# 2) İlk kez çalıştırıyorsan bağımlılıkları kur
npm install

# 3) frontend/.env oluştur (bir kez yeter)
# İçerik:
# VITE_API_BASE_URL=http://localhost:8000

# 4) FE’yi çalıştır
npm run dev

# Vite çıktısındaki adrese git:
# http://localhost:5173

# Not: FE, VITE_API_BASE_URL üzerinden backend’e çağrı atıyor.
