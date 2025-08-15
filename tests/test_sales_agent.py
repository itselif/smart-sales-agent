import asyncio
import pytest
from core.agents.sales_agent import SalesAgent

@pytest.mark.asyncio
async def test_sales_analyze_totals(monkeypatch):
    sa = SalesAgent()

    # İç veri kaynağını deterministik mock'la
    async def _fake_data(store_id, product_id=None):
        # 3 gün, 3 ürün -> toplam adet= (3+2+1)=6, ciro= (6*100)=600 gibi düşünebilirsin;
        # burada doğrudan 3 kayıt koyalım:
        return [
            {"date":"2025-08-10","product_id":"P100","product_name":"Kulaklık","quantity":2,"revenue":500.0,"category":"electronics","discount":0},
            {"date":"2025-08-11","product_id":"P200","product_name":"Şarj","quantity":3,"revenue":600.0,"category":"electronics","discount":0.1},
            {"date":"2025-08-12","product_id":"P300","product_name":"Saat","quantity":4,"revenue":1200.0,"category":"wearables","discount":0},
        ]
    monkeypatch.setattr(sa, "_get_enhanced_sales_data", _fake_data)

    res = await sa.analyze_sales("ISTANBUL_AVM")
    assert res["status"] == "success"
    # ürün bazında toplanmış mı?
    prods = res["products"]
    assert len(prods) == 3
    total_sold = sum(p["total_sold"] for p in prods)
    total_rev = sum(p["total_revenue"] for p in prods)
    assert total_sold == 2+3+4
    assert total_rev == 500.0 + 600.0 + 1200.0
