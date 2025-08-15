import pytest
from core.agents.stock_agent import StockAgent

class _FakeSales:
    async def get_sales_data(self, product_id: str):
        # Stok ajanına basit satış hızları verelim:
        # P100 hızlı (5/gün), P200 yavaş (0.5/gün), P300 orta (2/gün)
        return {
            "P100": {"daily_avg": 5.0, "trend": "increasing"},
            "P200": {"daily_avg": 0.5, "trend": "stable"},
            "P300": {"daily_avg": 2.0, "trend": "decreasing"},
        }.get(product_id, {"daily_avg":1.0,"trend":"stable"})

@pytest.mark.asyncio
async def test_stock_critical_and_days_left(monkeypatch):
    st = StockAgent(sales_agent=_FakeSales())

    async def _fake_stock(_store):
        return [
            {"product_id":"P100","name":"Hızlı Ürün","current_stock":8,"min_required":5,"lead_time_days":3,"category":"x","price":10.0,"supplier":"A"},
            {"product_id":"P200","name":"Yavaş Ürün","current_stock":2,"min_required":10,"lead_time_days":7,"category":"x","price":20.0,"supplier":"B"},
            {"product_id":"P300","name":"Orta Ürün","current_stock":25,"min_required":8,"lead_time_days":5,"category":"x","price":30.0,"supplier":"C"},
        ]
    monkeypatch.setattr(st, "get_stock_data", _fake_stock)

    res = await st.analyze_stock("IST")
    prods = {p["product_id"]: p for p in res["products"]}

    # days_left = stock / daily
    assert prods["P100"]["estimated_days_left"] == pytest.approx(8/5.0, rel=1e-3)
    assert prods["P200"]["estimated_days_left"] == pytest.approx(2/0.5, rel=1e-3)
    assert prods["P300"]["estimated_days_left"] == pytest.approx(25/2.0, rel=1e-3)

    # kritik kurallarından en az biri tetiklenmeli
    critical_ids = {p["product_id"] for p in res["critical_products"]}
    assert "P200" in critical_ids  # min_required altı ve lead_time riski var
