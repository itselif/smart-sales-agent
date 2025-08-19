# tests/auth_login_probe.py
import requests

AUTH_BASE = "https://auth-api-salesai1.prw.mindbricks.com"

EMAIL = "elif.tenant+LOGINTEST@example.com"
PASSWORD = "MyPass123!"

# Önce register edip hesabı oluşturuyoruz (varsa 409 olabilir, sorun değil)
try:
    reg = requests.post(f"{AUTH_BASE}/registertenantuser", json={
        "socialCode": "TEST-LOGIN",
        "password": PASSWORD,
        "fullname": "Elif Login",
        "email": EMAIL,
        "avatar": "avatar.png"
    })
    print("REGISTER:", reg.status_code)
except Exception as e:
    print("REGISTER error:", e)

candidates = [
    ("POST", "/login"),
    ("POST", "/signin"),
    ("POST", "/auth/login"),
    ("POST", "/sessions"),
    ("POST", "/session"),
    ("POST", "/users/login"),
]

payloads = [
    {"email": EMAIL, "password": PASSWORD},
    {"username": EMAIL, "password": PASSWORD},
    {"login": EMAIL, "password": PASSWORD},
]

def try_one(method, path, body):
    url = AUTH_BASE + path
    try:
        if method == "POST":
            r = requests.post(url, json=body)
        else:
            r = requests.get(url, params=body)

        print(f"\n==> {method} {path}  status={r.status_code}")
        print("access-token:", r.headers.get("salesai1-access-token"))
        print("refresh-token:", r.headers.get("salesai1-refresh-token"))
        try:
            print("json:", r.json())
        except Exception:
            print("text:", r.text[:400])
    except Exception as e:
        print(f"{method} {path} error:", e)

for m,p in candidates:
    for body in payloads:
        try_one(m, p, body)
