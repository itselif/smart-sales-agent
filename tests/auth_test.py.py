# auth_test.py
import requests

BASE_URL = "https://auth-api-salesai1.prw.mindbricks.com"

# Login bilgilerini kendine göre değiştir
payload = {
    "username": "admin@aadmin.com",
    "password": "superadmin"
}

res = requests.post(f"{BASE_URL}/auth/login", json=payload)

print("Status:", res.status_code)
print("Response:", res.json())
