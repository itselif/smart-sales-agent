# reporting_test.py
import requests

BASE_URL = "https://reporting-api-salesai1.prw.mindbricks.com"

token = "<BURAYA_AUTH_TOKEN_YAPISTIR>"

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

payload = {
    "reportType": "daily_sales",
    "storeIds": ["ISTANBUL_AVM"],  # örnek
    "dateFrom": "2025-08-01",
    "dateTo": "2025-08-10",
    "productIds": ["P123", "P456"],
    "format": "pdf",
    "status": "pending"
}

res = requests.post(f"{BASE_URL}/reportrequests", headers=headers, json=payload)

print("Status:", res.status_code)
print("Response:", res.json())
