# api/auth_proxy.py
from __future__ import annotations
from fastapi import APIRouter, HTTPException, Request
import httpx
import os

router = APIRouter(prefix="/auth", tags=["auth"])

# Mindbricks AUTH servisi kökü
AUTH_BASE = os.getenv("MINDBRICKS_AUTH_BASE", "https://auth-api-salesai1.prw.mindbricks.com")

def _normalize_login_payload(payload: dict) -> dict:
    """
    Mindbricks ortamına göre değişebilen login şemasını normalize eder.
    3 olasılığı da destekliyoruz:
      - {"email","password"}  (klasik)
      - {"username","password"}
      - {"socialCode","password"} (sende sık geçti)
    Öncelik: socialCode -> email -> username
    """
    pwd = payload.get("password")
    if not pwd:
        raise HTTPException(status_code=400, detail={"message": "password gerekli"})
    social = payload.get("socialCode") or payload.get("social_code")
    email = payload.get("email")
    username = payload.get("username")

    if social:
        return {"socialCode": social, "password": pwd}
    if email:
        return {"email": email, "password": pwd}
    if username:
        return {"username": username, "password": pwd}
    raise HTTPException(status_code=400, detail={"message": "email/username ya da socialCode gerekli"})

@router.post("/login")
async def login(payload: dict, request: Request):
    """
    FE buraya POST eder. Biz Mindbricks /login'e forward ederiz.
    Başarılıysa response header'lardaki access/refresh token'ı body'ye düşürürüz.
    """
    body = _normalize_login_payload(payload)

    # İstersen burada sabit header ekleyebilirsin (genelde gerekmez)
    headers = {"Content-Type": "application/json"}

    async with httpx.AsyncClient(timeout=15.0) as cli:
        try:
            r = await cli.post(f"{AUTH_BASE}/login", json=body, headers=headers)
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail={"message": f"auth servisine ulaşılamadı: {e}"})

    # Mindbricks bazı hataları 500 dönerek gövdeye JSON koyuyor → biz payload’ı FE’ye geçiririz
    access = r.headers.get("salesai1-access-token")
    refresh = r.headers.get("salesai1-refresh-token")

    # JSON/HTML olabilir; JSON’a çevirmeyi deneriz
    data: dict
    try:
        data = r.json()
    except Exception:
        data = {"raw": r.text[:400]}

    if r.status_code >= 400 or not access:
        # Tipik hata: EmailVerificationNeeded ya da UserLoginWithoutCredentials
        raise HTTPException(status_code=r.status_code, detail=data)

    return {
        "ok": True,
        "accessToken": access,
        "refreshToken": refresh,
        "data": data,
    }
