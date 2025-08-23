# backend/api/auth_proxy.py
from __future__ import annotations

import os
import time
import sqlite3
from typing import Optional, Tuple, Dict, Any

import httpx
import jwt
from passlib.hash import bcrypt
from fastapi import APIRouter, HTTPException, Body, Response
from pathlib import Path

router = APIRouter(prefix="/auth", tags=["auth"])

# ===== Mindbricks AUTH (register/create user işlemleri) =====
AUTH_BASE = os.getenv("MINDBRICKS_AUTH_BASE", "https://auth-api-salesai1.prw.mindbricks.com").rstrip("/")
API_KEY = os.getenv("MINDBRICKS_AUTH_API_KEY", "").strip()

# ===== Lokal Session (JWT) ayarları =====
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-prod")
JWT_ISSUER = os.getenv("JWT_ISSUER", "storepilot")
ACCESS_TTL_SEC = int(os.getenv("ACCESS_TTL_SEC", "3600"))       # 1 saat
REFRESH_TTL_SEC = int(os.getenv("REFRESH_TTL_SEC", "2592000"))  # 30 gün

# Varsayılan DB klasörü: <proje>/infrastructure/database
_DEFAULT_DB_DIR = Path(__file__).resolve().parents[2] / "infrastructure" / "database"
_DEFAULT_DB_DIR.mkdir(parents=True, exist_ok=True)
_DEFAULT_DB_PATH = _DEFAULT_DB_DIR / "auth_local.db"

DB_PATH = os.getenv("AUTH_SQLITE_PATH", str(_DEFAULT_DB_PATH))

# -------------------- Utils --------------------
def _norm_email(v: Optional[str]) -> Optional[str]:
    return v.strip().lower() if isinstance(v, str) and v.strip() else None

def _norm_social(v: Optional[str]) -> Optional[str]:
    # İstersen .upper() da tercih edebilirsin; login&register aynı olsun yeter.
    return v.strip().lower() if isinstance(v, str) and v.strip() else None

def _db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def _init_db():
    conn = _db()
    try:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            social_code TEXT,
            password_hash TEXT NOT NULL,
            fullname TEXT,
            created_at INTEGER NOT NULL
        );
        """)
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);")
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_social ON users(social_code);")
        conn.commit()
    finally:
        conn.close()

_init_db()

def _headers(extra: Optional[Dict[str, str]] = None) -> Dict[str, str]:
    h = {"Content-Type": "application/json"}
    if API_KEY:
        h["x-api-key"] = API_KEY
    if extra:
        h.update(extra)
    return h

async def _post_auth(path: str, json_body: Dict[str, Any]):
    """Mindbricks AUTH servisinde register vb."""
    url = f"{AUTH_BASE}{path}"
    async with httpx.AsyncClient(timeout=20.0) as cli:
        try:
            r = await cli.post(url, json=json_body, headers=_headers())
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail={"message": f"auth servisine ulaşılamadı: {e}"})
    try:
        data = r.json()
    except Exception:
        data = {"raw": r.text[:400]}
    if r.status_code >= 400:
        raise HTTPException(status_code=r.status_code, detail=data)
    return r, data

def _make_token(sub: str, ttl: int, extra: Optional[Dict[str, Any]] = None) -> str:
    now = int(time.time())
    payload = {"iss": JWT_ISSUER, "sub": sub, "iat": now, "exp": now + ttl}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def _upsert_local_user(email: Optional[str], social: Optional[str], raw_password: str, fullname: Optional[str]):
    email_n = _norm_email(email)
    social_n = _norm_social(social)
    if not (email_n or social_n):
        raise HTTPException(status_code=400, detail={"message": "email veya socialCode gerekli"})

    ph = bcrypt.hash(raw_password)
    now = int(time.time())
    conn = _db()
    try:
        row = None
        if email_n:
            row = conn.execute("SELECT * FROM users WHERE email = ?", (email_n,)).fetchone()
        if not row and social_n:
            row = conn.execute("SELECT * FROM users WHERE social_code = ?", (social_n,)).fetchone()

        if row:
            conn.execute(
                "UPDATE users SET password_hash=?, fullname=?, created_at=? WHERE id=?",
                (ph, fullname, now, row["id"]),
            )
        else:
            conn.execute(
                "INSERT INTO users (email, social_code, password_hash, fullname, created_at) VALUES (?, ?, ?, ?, ?)",
                (email_n, social_n, ph, fullname, now),
            )
        conn.commit()
    finally:
        conn.close()

def _verify_local_user(email: Optional[str], social: Optional[str], raw_password: str) -> Dict[str, Any]:
    email_n = _norm_email(email)
    social_n = _norm_social(social)
    if not (email_n or social_n):
        raise HTTPException(status_code=400, detail={"message": "email veya socialCode gerekli"})

    conn = _db()
    try:
        row = None
        if email_n:
            row = conn.execute("SELECT * FROM users WHERE email = ?", (email_n,)).fetchone()
        if not row and social_n:
            row = conn.execute("SELECT * FROM users WHERE social_code = ?", (social_n,)).fetchone()
    finally:
        conn.close()

    if not row or not bcrypt.verify(raw_password, row["password_hash"]):
        raise HTTPException(status_code=401, detail={"message": "Geçersiz kimlik bilgileri"})

    return dict(row)

def _normalize_register_payload(p: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
    fullname = p.get("fullname") or p.get("name")
    body = {
        "socialCode": p.get("socialCode") or p.get("social_code"),
        "password": p.get("password"),
        "fullname": fullname,
        "email": p.get("email"),
        "avatar": p.get("avatar") or "",
    }
    missing = [k for k, v in body.items() if k in ("socialCode", "password", "fullname", "email") and not v]
    if missing:
        raise HTTPException(status_code=400, detail={"message": f"eksik alanlar: {', '.join(missing)}"})

    reg_as = (p.get("registerAs") or "").strip().lower()
    endpoint = "/registertenantuser" if reg_as != "owner" else "/registerstoreowner"
    return endpoint, body

# -------------------- Endpoints --------------------
@router.post("/register")
async def register(payload: Dict[str, Any] = Body(...)):
    """
    1) Mindbricks AUTH'ta kullanıcı oluştur
    2) Lokal DB'ye (SQLite) normalize edilmiş credential + bcrypt hash kaydet
    3) JWT üret ve dön
    """
    path, reg_body = _normalize_register_payload(payload)

    # 1) Mindbricks kaydı
    _, reg_data = await _post_auth(path, reg_body)

    # 2) Lokal credential kaydı (normalize)
    _upsert_local_user(
        email=_norm_email(reg_body.get("email")),
        social=_norm_social(reg_body.get("socialCode")),
        raw_password=reg_body["password"],
        fullname=reg_body.get("fullname"),
    )

    # 3) Token üret
    subject = _norm_email(reg_body.get("email")) or _norm_social(reg_body.get("socialCode"))
    access = _make_token(subject, ACCESS_TTL_SEC, {"typ": "access"})
    refresh = _make_token(subject, REFRESH_TTL_SEC, {"typ": "refresh"})

    return {
        "ok": True,
        "accessToken": access,
        "refreshToken": refresh,
        "data": {
            "register": reg_data,
            "user": {
                "email": _norm_email(reg_body.get("email")),
                "socialCode": _norm_social(reg_body.get("socialCode")),
                "fullname": reg_body.get("fullname"),
            },
        },
    }

@router.post("/login")
async def login(payload: Dict[str, Any] = Body(...), response: Response = None):
    """
    Lokal credential ile login.
    Body örn:
      {"email":"e@x.com","password":"..."}  veya
      {"socialCode":"SC-1","password":"..."}
    """
    p = payload or {}
    pwd = (p.get("password") or "").strip()
    email = _norm_email(p.get("email"))
    social = _norm_social(p.get("socialCode") or p.get("social_code"))
    if not pwd:
        raise HTTPException(status_code=400, detail={"message": "password gerekli"})
    if not (email or social):
        raise HTTPException(status_code=400, detail={"message": "email veya socialCode gerekli"})

    user_row = _verify_local_user(email, social, pwd)
    subject = user_row.get("email") or user_row.get("social_code")

    access = _make_token(subject, ACCESS_TTL_SEC, {"typ": "access"})
    refresh = _make_token(subject, REFRESH_TTL_SEC, {"typ": "refresh"})

    # (opsiyonel) header olarak expose et
    if response is not None:
        response.headers["salesai1-access-token"] = access
        response.headers["salesai1-refresh-token"] = refresh
        response.headers["Access-Control-Expose-Headers"] = "salesai1-access-token, salesai1-refresh-token"

    return {
        "ok": True,
        "accessToken": access,
        "refreshToken": refresh,
        "data": {
            "user": {
                "fullname": user_row.get("fullname"),
                "email": user_row.get("email"),
                "socialCode": user_row.get("social_code"),
            }
        },
    }

@router.post("/refresh")
async def refresh_token(payload: Dict[str, Any] = Body(...)):
    """refreshToken ile yeni accessToken üret."""
    token = (payload or {}).get("refreshToken")
    if not token:
        raise HTTPException(status_code=400, detail={"message": "refreshToken gerekli"})
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"], options={"require": ["exp", "sub"]})
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail={"message": "refreshToken süresi doldu"})
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail={"message": "Geçersiz refreshToken"})

    sub = decoded.get("sub")
    new_access = _make_token(sub, ACCESS_TTL_SEC, {"typ": "access"})
    return {"ok": True, "accessToken": new_access}

@router.get("/_debug_users")
async def _debug_users():
    """GEÇİCİ: son kullanıcı kayıtlarını gör. Prod’da kaldır."""
    conn = _db()
    try:
        rows = conn.execute(
            "SELECT id,email,social_code,fullname,created_at FROM users ORDER BY id DESC LIMIT 20"
        ).fetchall()
        return {"ok": True, "users": [dict(r) for r in rows]}
    finally:
        conn.close()

@router.get("/ping")
async def ping():
    return {"ok": True, "auth_base": AUTH_BASE, "db_path": DB_PATH}
