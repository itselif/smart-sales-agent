import os, json, asyncio, pytest
import core.orchestrator as orch

@pytest.mark.asyncio
async def test_orchestrator_routing_and_cache(monkeypatch):
    # LLM'i kapat (router fallback)
    monkeypatch.setenv("GOOGLE_API_KEY", "")
    monkeypatch.setenv("VITE_GEMINI_API_KEY", "")

    # 1) STOCK isteği
    out1 = await orch.run_orchestrator("stok durumunu özetle", "ISTANBUL_AVM")
    assert out1["intent"] == "stock"
    assert "data" in out1
    assert "products" in out1["data"] or "products" in out1  # normalize edilmiş veya tool raw

    # 2) Aynı isteği tekrar yap → cache True beklenir (tool raw dönerse)
    out2 = await orch.run_orchestrator("stok durumunu özetle", "ISTANBUL_AVM")
    # 'cached' bilgisi tool çıktısının içinde
    cached_flag = (out2.get("data") or out2).get("cached")
    assert cached_flag is True

@pytest.mark.asyncio
async def test_orchestrator_report_builds_file(monkeypatch):
    monkeypatch.setenv("GOOGLE_API_KEY", "")  # LLM yok; rule-based
    out = await orch.run_orchestrator("pdf rapor üret", "ISTANBUL_AVM")
    assert out["intent"] == "report"
    assert "artifacts" in out
    assert out["artifacts"]["format"] in ("pdf","html")
    assert os.path.exists(out["artifacts"]["report_path"])
