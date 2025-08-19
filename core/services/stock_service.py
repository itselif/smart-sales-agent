# core/services/stock_service.py
from __future__ import annotations
import os
from typing import Dict
from core.agents.stock_agent import StockAgent
from infrastructure.external.mindbricks import MindbricksClient

class StockService:
    def __init__(self, agent: StockAgent, mb: MindbricksClient | None = None):
        self.agent = agent
        self.mb = mb
        self.use_mb = os.getenv("USE_MINDBRICKS_STOCK", "1") == "1"
        self.mb_path = os.getenv("MINDBRICKS_STOCK_ANALYSIS_PATH", "/stock/analysis")
        # 🔧 ÖNEMLİ: doğru subdomain adı
        self.mb_service = os.getenv("MINDBRICKS_STOCK_SERVICE", "inventorymanagement")


    async def analysis(self, store_id: str) -> Dict:
        if self.use_mb and self.mb:
            try:
                return await self.mb.get_json(self.mb_service, self.mb_path, params={"store_id": store_id})
            except Exception:
                # 🔁 Fallback: Mindbricks hata verirse lokal ajana düş
                pass
        return await self.agent.analyze_stock(store_id=store_id)
