# core/repositories/mindbricks_user_prefs.py
from typing import Optional, Dict, Any
from infrastructure.external.mindbricks import MindbricksClient
import os

class MindbricksUserPrefsRepository:
    def __init__(self, mb: MindbricksClient):
        self.mb = mb
        self.service = os.getenv("MINDBRICKS_USER_SERVICE", "usermanagement") or "usermanagement"
        self.list_path = "/userpreferences"
        self.create_path = "/userpreferences"

    async def get_by_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        res = await self.mb.get_json(self.service, self.list_path, params={"userId": user_id, "limit": 1})
        items = res.get("userPreferences") or res.get("items") or []
        return items[0] if items else None

    async def upsert(self, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        cur = await self.get_by_user(user_id)
        body = {
            "userId": user_id,
            "activeStoreId": payload.get("active_store_id"),
            "selectedStoreIds": payload.get("selected_store_ids", []),
            "assignedStoreIds": payload.get("assigned_store_ids", []),
        }
        if cur:
            return await self.mb.patch_json(self.service, f"{self.create_path}/{cur['id']}", json=body)
        return await self.mb.post_json(self.service, self.create_path, json=body)
