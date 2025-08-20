# core/repositories/mindbricks_sales.py
from __future__ import annotations
import os
from datetime import date, datetime
from typing import List, Optional, Dict, Any

from core.repositories.base import SalesRepository
from core.models.sales import SalesRecord
from infrastructure.external.mindbricks import MindbricksClient

def _dt_to_iso(d: date) -> str:
    # YYYY-MM-DD -> Mindbricks filtrelerinde genelde _gte/_lte var, zaman kısmını koymayalım
    return d.isoformat()

class MindbricksSalesRepository(SalesRepository):
    """
    SalesAgent için ürün-bazlı kayıtları `salesdetail` objesinden okur.
    Query: /salesdetails?storeId=...&transactionDate_gte=YYYY-MM-DD&transactionDate_lte=YYYY-MM-DD
    """

    def __init__(self, mb: MindbricksClient):
        self.mb = mb
        self.service = os.getenv("MINDBRICKS_SALES_SERVICE", "salesmanagement")
        self.path = os.getenv("MINDBRICKS_SALESDETAIL_LIST_PATH", "/salesdetails")

    async def get_sales_records(
        self,
        *,
        store_id: str,
        start_date: date,
        end_date: date,
        product_ids: Optional[List[str]] = None,
    ) -> List[SalesRecord]:
        # Mindbricks list filtreleri: field + _gte/_lte şeklinde çalışıyor (UI’deki Filter Settings)
        params: Dict[str, Any] = {
            "storeId": store_id,
            "transactionDate_gte": _dt_to_iso(start_date),
            "transactionDate_lte": _dt_to_iso(end_date),
            "limit": 1000,  # gerekirse pagination eklenir
        }
        if product_ids:
            # Birçok Mindbricks instance’ında virgüllü çoklu değer kabul ediliyor; etmiyorsa döngüyle fetch et
            params["productId_in"] = ",".join(product_ids)

        resp = await self.mb.get_json(self.service, self.path, params=params)
        # Beklenen cevap: {"salesdetails":[{...}, ...], "rowCount":...} gibi
        rows: List[Dict[str, Any]] = []
        if isinstance(resp, dict):
            # Koleksiyon anahtarını yakala (salesdetails / data / items vs)
            if "salesdetails" in resp:
                rows = resp["salesdetails"]
            elif "data" in resp and isinstance(resp["data"], list):
                rows = resp["data"]
            else:
                # fallback: düz liste dönmüş olabilir
                rows = [r for r in resp.values() if isinstance(r, list)]
                rows = rows[0] if rows else []

        out: List[SalesRecord] = []
        for r in rows:
            # Mindbricks alan adları → model alanları
            pid = r.get("productId") or r.get("product_id")
            qty = r.get("quantity") or 0
            unit_price = r.get("unitPrice") or r.get("unit_price") or 0.0
            pname = r.get("productName") or r.get("product_name")
            disc = r.get("discount") or 0.0
            cat = r.get("category")  # varsa

            # transactionDate genelde ISO string. "YYYY-MM-DD" formatına indir.
            tdate_raw = r.get("transactionDate") or r.get("date")
            if isinstance(tdate_raw, str):
                try:
                    # 2025-08-17T14:30:00.000Z -> 2025-08-17
                    tdate = datetime.fromisoformat(tdate_raw.replace("Z","+00:00")).date().isoformat()
                except Exception:
                    tdate = tdate_raw[:10]
            else:
                tdate = str(tdate_raw)[:10]

            revenue = float(qty) * float(unit_price) * (1.0 - float(disc or 0.0))

            out.append(SalesRecord(
                store_id=store_id,
                date=tdate,
                product_id=str(pid),
                product_name=pname,
                quantity=int(qty),
                unit_price=float(unit_price),
                revenue=round(revenue, 2),
                category=cat,
                discount=float(disc or 0.0),
            ))
        return out
