# ========= StorePilot Quick Runner (PowerShell) =========
# PROJE KÖKÜ: Bulamazsa mevcut klasörü kullanır
$ROOT = "E:\smart-sales-agent"
if (-not (Test-Path $ROOT)) { $ROOT = (Get-Location).Path }

# Yollar
$API = Join-Path $ROOT "api"
$FE  = Join-Path $ROOT "frontend"
$PY  = Join-Path $ROOT ".venv\Scripts\python.exe"
if (-not (Test-Path $PY)) { $PY = "python" }   # venv yoksa sistem python

# ---- Kontroller ----
if (-not (Test-Path $API)) { throw "API klasörü bulunamadı: $API" }
if (-not (Test-Path $FE))  { throw "Frontend klasörü bulunamadı: $FE" }

# Backend .env notu (sende zaten olmalı):
#   $ROOT\.env içinde en azından:
#   GOOGLE_API_KEY=YOUR_GEMINI_KEY
#   GEMINI_MODEL=gemini-1.5-flash
#   TZ=Europe/Istanbul

# Frontend .env (yoksa oluştur)
$feEnvPath = Join-Path $FE ".env"
if (-not (Test-Path $feEnvPath)) {
  "VITE_API_BASE_URL=http://localhost:8000" | Out-File -FilePath $feEnvPath -Encoding utf8 -Force
  Write-Host "frontend/.env oluşturuldu." -ForegroundColor Green
}

# Node kurulu mu?
try { node -v > $null } catch { throw "Node.js yüklü değil gibi görünüyor. https://nodejs.org/ " }

# ---- Frontend bağımlılıkları (gerekliyse) ----
if (-not (Test-Path (Join-Path $FE "node_modules"))) {
  Write-Host "npm install (frontend) çalışıyor..." -ForegroundColor Yellow
  Push-Location $FE
  npm install
  Pop-Location
}

# ---- Backend'i başlat (arka plan job) ----
if (Get-Job -Name "storepilot-backend" -ErrorAction SilentlyContinue) { Remove-Job -Name "storepilot-backend" -Force }
Start-Job -Name "storepilot-backend" -ScriptBlock {
  param($root, $api, $py)
  Set-Location $root
  # .env kökteyken uvicorn başlat
  & $py -m uvicorn api.main:app --reload --port 8000
} -ArgumentList $ROOT, $API, $PY | Out-Null
Write-Host "Backend job başlatıldı: storepilot-backend  (http://localhost:8000)" -ForegroundColor Green

# ---- Frontend'i başlat (arka plan job) ----
if (Get-Job -Name "storepilot-frontend" -ErrorAction SilentlyContinue) { Remove-Job -Name "storepilot-frontend" -Force }
Start-Job -Name "storepilot-frontend" -ScriptBlock {
  param($fe)
  Set-Location $fe
  npm run dev
} -ArgumentList $FE | Out-Null
Write-Host "Frontend job başlatıldı: storepilot-frontend (http://localhost:5173)" -ForegroundColor Green

# ---- Tarayıcıda aç ----
Start-Process "http://localhost:8000/healthz"
Start-Process "http://localhost:8000/docs"
Start-Process "http://localhost:5173"

# ---- Kullanışlı komutlar ----
Write-Host "`nLog görmek için:" -ForegroundColor Cyan
Write-Host "  Receive-Job -Name storepilot-backend -Keep -Wait" -ForegroundColor DarkCyan
Write-Host "  Receive-Job -Name storepilot-frontend -Keep -Wait" -ForegroundColor DarkCyan
Write-Host "`nJob'ları durdurmak için:" -ForegroundColor Cyan
Write-Host "  Stop-Job -Name storepilot-backend,storepilot-frontend; Remove-Job -Name storepilot-backend,storepilot-frontend" -ForegroundColor DarkCyan
# =========================================================
