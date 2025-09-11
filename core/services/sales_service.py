# core/services/sales_service.py
from __future__ import annotations
import os
from typing import Dict
from core.agents.sales_agent import SalesAgent
from core.repositories.mindbricks_sales import MindbricksSalesRepository
from infrastructure.external.mindbricks import MindbricksClient

class SalesService:
    def __init__(self, agent: SalesAgent, mb: MindbricksClient | None = None):
        self.agent = agent
        self.mb = mb
        self.use_mb = os.getenv("USE_MINDBRICKS_SALES", "1") == "1"
        
        # Mindbricks repository'yi oluştur
        self.mb_repo = None
        if mb:
            self.mb_repo = MindbricksSalesRepository(mb)

    async def analyze(self, store_id: str, days: Optional[int] = None) -> Dict:
        # Önce Mindbricks'ten veri çekip lokal analiz yapmayı dene
        if self.use_mb and self.mb_repo:
            try:
                # SalesAgent'ın repository'sini geçici olarak Mindbricks repo ile değiştir
                original_repo = self.agent.repo
                self.agent.repo = self.mb_repo
                
                # Analizi çalıştır
                result = await self.agent.analyze_sales(store_id=store_id, days=days)
                
                # Repository'yi eski haline getir
                self.agent.repo = original_repo
                
                return result
                
            except Exception as e:
                print(f"[SalesService] Mindbricks hatası: {e}")
                # Fallback: orijinal repository ile devam et
                if hasattr(self.agent, 'repo') and self.agent.repo:
                    return await self.agent.analyze_sales(store_id, days=days)
                raise
        
        # Fallback: agent'ın orijinal repository'si
        return await self.agent.analyze_sales(store_id, days=days)