# core/repositories/mindbricks_sales.py
from __future__ import annotations
from datetime import date
from typing import List, Optional
from core.repositories.base import SalesRepository
from core.models.sales import SalesRecord
from infrastructure.external.mindbricks import MindbricksClient

class MindbricksSalesRepository(SalesRepository):
    def __init__(self, mb_client: MindbricksClient):
        self.mb = mb_client
        self.service = "salesManagement"
        self.sales_path = "/sales"  # veya env'den al

    async def get_sales_records(
        self,
        store_id: str,
        start_date: date,
        end_date: date,
        product_ids: Optional[List[str]] = None,
    ) -> List[SalesRecord]:
        params = {
            "storeId": store_id,
            "startDate": start_date.isoformat(),
            "endDate": end_date.isoformat(),
            "limit": 1000  # veya env'den al
        }
        
        if product_ids:
            params["productIds"] = ",".join(product_ids)
        
        data = await self.mb.get_json(self.service, self.sales_path, params=params)
        
        # API response formatına göre mapping yap
        records = []
        for item in data.get('sales', []) or data.get('items', []):
            records.append(SalesRecord(
                store_id=item.get('storeId', store_id),
                date=item.get('date'),
                product_id=item.get('productId'),
                product_name=item.get('productName'),
                quantity=item.get('quantity', 0),
                unit_price=item.get('unitPrice', 0.0),
                revenue=item.get('revenue', 0.0),
                category=item.get('category'),
                discount=item.get('discount', 0.0)
            ))
        
        return records