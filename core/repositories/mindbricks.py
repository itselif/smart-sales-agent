# core/repositories/mindbricks.py
from __future__ import annotations

import os
import re
from typing import List, Optional, Dict, Any

from core.repositories.base import StockRepository
from core.models.stock import StockRow
from infrastructure.external.mindbricks import MindbricksClient

_UUID_RE = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$"
)


def _parse_store_map(s: str) -> Dict[str, str]:
    """
    MINDBRICKS_STORE_ID_MAP="ISTANBUL_AVM:d26f...;ANKARA_STORE:aaaa-...."
    ';' veya ',' ile ayrılmış "KEY:UUID" çiftleri.
    """
    out: Dict[str, str] = {}
    if not s:
        return out
    for part in re.split(r"[;,]", s):
        part = (part or "").strip()
        if not part or ":" not in part:
            continue
        k, v = part.split(":", 1)
        out[k.strip()] = v.strip()
    return out


class MindbricksStockRepository(StockRepository):
    """
    Mindbricks inventoryManagement → listInventoryItems
      GET /inventoryitems?storeId=<GUID>&limit=<N>

    - store filtresi ENV ile kontrol edilir (MINDBRICKS_FILTER_BY_STORE).
    - storeId "ALL" veya "*" gelirse filtre kapatılır.
    - store_id bir UUID değilse MINDBRICKS_STORE_ID_MAP'ten GUID eşlemesi aranır.
    """

    def __init__(
        self,
        mb: MindbricksClient,
        *,
        service: Optional[str] = None,
        list_path: Optional[str] = None,
    ) -> None:
        self.mb = mb
        self.service = service or os.getenv("MINDBRICKS_STOCK_SERVICE", "inventorymanagement")
        self.list_path = list_path or os.getenv(
            "MINDBRICKS_INVENTORY_LIST_PATH", "/inventoryitems"
        )

        # Parametreler
        self.store_param = os.getenv("MINDBRICKS_STORE_PARAM", "storeId")
        self.list_limit = int(os.getenv("MINDBRICKS_LIST_LIMIT", "200"))

        self.filter_by_store_env = os.getenv("MINDBRICKS_FILTER_BY_STORE", "1") == "1"

        # Mağaza adı → GUID map
        self.store_map = _parse_store_map(os.getenv("MINDBRICKS_STORE_ID_MAP", ""))

        # Varsayılanlar
        self.default_lead_time = int(os.getenv("DEFAULT_LEAD_TIME_DAYS", "5"))
        self.default_price = float(os.getenv("DEFAULT_PRICE", "0.0"))

        self.debug = os.getenv("MB_DEBUG", "0") == "1"

    # ---------------- helpers ----------------
    def _is_uuid(self, s: str) -> bool:
        return bool(_UUID_RE.match(s or ""))

    def _store_guid_for(self, store_id: str) -> Optional[str]:
        if self._is_uuid(store_id):
            return store_id
        return self.store_map.get(store_id)

    # ---------------- main API ----------------
    async def get_stock_snapshot(self, store_id: str) -> List[StockRow]:
        params: Dict[str, Any] = {"limit": self.list_limit}

        force_no_filter = str(store_id).strip().upper() in {"ALL", "*"}
        apply_store_filter = (self.filter_by_store_env and not force_no_filter)

        if apply_store_filter:
            guid = self._store_guid_for(store_id)
            if guid:
                params[self.store_param] = guid

        if self.debug:
            print(f"[MB] ↓ requesting inventory list")
            print(f"[MB]   service = {self.service}")
            print(f"[MB]   path    = {self.list_path}")
            print(f"[MB]   params  = {params}")

        try:
            data: Any = await self.mb.get_json(self.service, self.list_path, params=params)
        except Exception as e:
            raise RuntimeError(
                f"Mindbricks inventory listesi alınamadı: "
                f"service={self.service}, path={self.list_path}, params={params}"
            ) from e

        # Payload formatı
        if isinstance(data, dict):
            rows_json = data.get("inventoryItems") or data.get("items") or []
        elif isinstance(data, list):
            rows_json = data
        else:
            rows_json = []

        out: List[StockRow] = []
        for r in rows_json or []:
            try:
                product_id = str(r.get("productId"))
                qty = int(r.get("quantity") or 0)
                low_thr = int(r.get("lowStockThreshold") or 0)
                lead_time_days = int(r.get("leadTimeDays") or self.default_lead_time)
                price = float(r.get("price") or self.default_price)

                out.append(
                    StockRow(
                        product_id=product_id,
                        name=None,
                        current_stock=qty,
                        min_required=low_thr,
                        lead_time_days=lead_time_days,
                        category=None,
                        price=price,
                        supplier=None,
                    )
                )
            except Exception as map_err:
                if self.debug:
                    print(f"[MB] skip row: {map_err} | row={r}")
                continue

        if self.debug:
            pids = [x.product_id for x in out]
            print(f"[MB] ↑ mapped {len(out)} items: {pids}")

        return out
 