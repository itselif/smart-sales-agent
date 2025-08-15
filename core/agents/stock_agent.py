# core/agents/stock_agent.py

from __future__ import annotations  # <- 1. satırda olmalı

import asyncio
import os
import re
from typing import TYPE_CHECKING, Dict, List, Optional, Literal, Union
from datetime import datetime, timezone, timedelta

from dotenv import load_dotenv
import google.generativeai as genai

# ---- TZ: Europe/Istanbul (fallback: TRT/UTC+3) ----

try:
    from zoneinfo import ZoneInfo
    try:
        IST_TZ = ZoneInfo("Europe/Istanbul")
    except Exception:
        IST_TZ = timezone(timedelta(hours=3), name="TRT")
except Exception:
    IST_TZ = timezone(timedelta(hours=3), name="TRT")

if TYPE_CHECKING:
    from core.agents.sales_agent import SalesAgent

load_dotenv()


def _normalize_product_id(pid: int | str | None) -> Optional[str]:
    """
    Testlerde product_id bazen int (1, 999), bazen string ('P100') gelebilir.
    int -> 1 => 'P100', 2 => 'P200', 3 => 'P300'
    str  -> aynen döndür.
    """
    if pid is None:
        return None
    try:
        n = int(pid)
        return f"P{n*100}"
    except (ValueError, TypeError):
        return str(pid)
    
def _denormalize_product_id(pid_str: str) -> int | str:
    """
    'P100' -> 1, 'P200' -> 2, ... Bölünebiliyorsa 100'e böl.
    Bölünemiyorsa dokunma (string döndür).
    """
    if not isinstance(pid_str, str):
        return pid_str
    m = re.fullmatch(r"P(\d+)", pid_str)
    if not m:
        return pid_str
    try:
        n = int(m.group(1))
        if n % 100 == 0:
            return n // 100
        return pid_str
    except Exception:
        return pid_str

class StockAgent:
    def __init__(self, sales_agent: "SalesAgent" | None = None):
        self.sales_agent = sales_agent

        # Opsiyonel: Gemini (testlerde gerekmez)
        self.gemini = None
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            # hafif model tercih edilebilir; testler için fark etmez
            self.gemini = genai.GenerativeModel("gemini-1.5-pro")

        # Trafik seviyesine göre eşikler
        self.critical_threshold_rules = {
            "high":   {"min_stock": 20, "sales_threshold": 15.0},
            "medium": {"min_stock": 10, "sales_threshold": 5.0},
            "low":    {"min_stock": 3,  "sales_threshold": 1.0},
        }

    # -------- Mock stok verisi --------
    async def get_stock_data(self, store_id: str) -> List[Dict]:
        return [
            {
                "product_id": "P100", "name": "Premium Kulaklık",
                "current_stock": 8, "min_required": 5, "lead_time_days": 3,
                "category": "electronics", "price": 599.99, "supplier": "TechCorp"
            },
            {
                "product_id": "P200", "name": "Kablosuz Şarj Aleti",
                "current_stock": 2, "min_required": 10, "lead_time_days": 7,
                "category": "electronics", "price": 199.99, "supplier": "PowerGadgets"
            },
            {
                "product_id": "P300", "name": "Akıllı Saat",
                "current_stock": 25, "min_required": 8, "lead_time_days": 5,
                "category": "wearables", "price": 1299.99, "supplier": "WearableTech"
            },
        ]

    # -------- SalesAgent entegrasyonu --------
    async def _get_sales_metrics_for_product(self, store_id: str, product_id: str) -> Dict:
        """
        SalesAgent.analyze_sales(store_id, product_id) çıktısından:
          - avg_daily_sales
          - weekly_trend (neg/poz → 'decreasing'/'increasing'/'stable')
        üretir. Veri yoksa makul default döndürür.
        """
        try:
            if not self.sales_agent:
                return {"avg_daily_sales": 1.0, "trend_label": "stable"}

            analysis = await self.sales_agent.analyze_sales(
                store_id=store_id, product_id=product_id
            )
            if analysis.get("status") != "success" or not analysis.get("products"):
                return {"avg_daily_sales": 1.0, "trend_label": "stable"}

            p = analysis["products"][0]  # product_id ile filtrelendiği için tek bir ürün beklenir
            avg = float(p.get("avg_daily_sales", 1.0))
            weekly_trend = float(p.get("weekly_trend", 0.0))
            if weekly_trend > 0.05:
                trend_label = "increasing"
            elif weekly_trend < -0.05:
                trend_label = "decreasing"
            else:
                trend_label = "stable"

            return {"avg_daily_sales": max(0.0, avg), "trend_label": trend_label}
        except Exception:
            # Entegre ajan yoksa/hatada defaults
            return {"avg_daily_sales": 1.0, "trend_label": "stable"}

    # -------- Ana analiz --------
    async def analyze_stock(self, store_id: str) -> Dict:
        stock_rows = await self.get_stock_data(store_id)
        analyzed: List[Dict] = []

        for prod in stock_rows:
            sales_metrics = await self._get_sales_metrics_for_product(
                store_id, prod["product_id"]
            )
            analysis = self._analyze_single_product(prod, sales_metrics)
            analyzed.append(analysis)

        return {
            "store_id": store_id,
            "analysis_date": datetime.now(tz=IST_TZ).isoformat(),
            "products": analyzed,
            "critical_products": [p for p in analyzed if p["is_critical"]],
            "total_value": round(
                sum(p["current_stock"] * p.get("price", 0.0) for p in analyzed), 2
            ),
        }

    def _analyze_single_product(self, product: Dict, sales_metrics: Dict) -> Dict:
        avg_daily = float(sales_metrics.get("avg_daily_sales", 1.0)) or 1.0
        trend = sales_metrics.get("trend_label", "stable")

        traffic_level = self._determine_traffic_level(avg_daily)
        days_left = (product["current_stock"] / avg_daily) if avg_daily > 0 else float("inf")

        # Artan talepte tedarik riskine karşı buffer'ı yükselt
        buffer_days = 5 if trend == "increasing" else 3
        is_critical = (
            product["current_stock"] < self.critical_threshold_rules[traffic_level]["min_stock"]
            or days_left < (product["lead_time_days"] + buffer_days)
            or product["current_stock"] < product.get("min_required", 0)
        )

        return {
            **product,
            "avg_daily_sales": round(avg_daily, 2),
            "sales_trend": trend,
            "traffic_level": traffic_level,
            "estimated_days_left": None if days_left == float("inf") else round(days_left, 1),
            "is_critical": is_critical,
            "stock_value": round(product["current_stock"] * product.get("price", 0.0), 2),
        }

    def _determine_traffic_level(self, sales_rate: float) -> str:
        if sales_rate >= self.critical_threshold_rules["high"]["sales_threshold"]:
            return "high"
        if sales_rate >= self.critical_threshold_rules["medium"]["sales_threshold"]:
            return "medium"
        return "low"

    # -------- Raporlama --------
    async def generate_report(
        self,
        analysis_result: Dict,
        format: Literal["text", "json", "ai"] = "text"
    ) -> Union[str, Dict]:
        if format == "json":
            return analysis_result
        if format == "ai":
            return await self._generate_ai_report(analysis_result)
        return self._format_text_report(analysis_result)

    async def _generate_ai_report(self, analysis: Dict) -> str:
        if not self.gemini:
            return "Gemini API not configured"

        prompt = f"""
Stok Analiz Raporu
Mağaza: {analysis['store_id']}
Toplam Stok Değeri: ${analysis.get('total_value', 0):,.2f}
Kritik Ürün Sayısı: {len(analysis.get('critical_products', []))}

Görev:
1) Kritik ürünler için tedarikçi, adet ve gerekçe içeren acil sipariş listesi oluştur.
2) Satış trendine göre stok seviyelerini optimize edecek 3 aksiyon öner.
3) 1 haftalık tükenme riski olanları vurgula.
Cevabı maddeler halinde, kısa ve uygulanabilir yaz.
"""
        try:
            resp = await self.gemini.generate_content_async(prompt)
            return resp.text
        except Exception as e:
            return f"⚠️ AI Rapor Hatası: {e}"

    def _format_text_report(self, analysis: Dict) -> str:
        lines = [
            f"📅 Rapor Tarihi: {datetime.now(tz=IST_TZ).strftime('%d.%m.%Y %H:%M')}",
            f"🏬 Mağaza: {analysis['store_id']}",
            f"📦 Toplam Stok Değeri: ${analysis.get('total_value', 0):,.2f}",
            "",
        ]
        crit = analysis.get("critical_products", [])
        if not crit:
            lines.append("✅ Kritik stok yok.")
            return "\n".join(lines)

        lines.append("🚨 Kritik Stoklar:")
        for p in crit:
            lines.append(
                f"- {p['name']} ({p['product_id']}) | Stok: {p['current_stock']} | "
                f"ETA: {p.get('estimated_days_left','?')} gün | Tedarikçi: {p.get('supplier','-')}"
            )
        return "\n".join(lines)

    # -------- API yüzeyi: async ve sync --------
    async def arun(
        self,
        store_id: str,
        product_id: int | str | None = None,
        format: Literal["json", "text", "ai"] = "json",
    ):
        """
        Async sürüm: orchestrator gibi async çağrılar için.
        """
        analysis = await self.analyze_stock(store_id)

        # Toplu analiz
        if product_id is None:
            result_all = {"status": "ok", **analysis}
            result_all["critical_stock"] = analysis.get("critical_products", [])
            if format == "json":
                return result_all
            elif format == "text":
                return self._format_text_report(analysis)
            elif format == "ai":
                return await self._generate_ai_report(analysis)
            return result_all

        # Tekil ürün
        norm_id = _normalize_product_id(product_id)
        found = next(
            (p for p in analysis.get("products", []) if p.get("product_id") == norm_id),
            None,
        )
        if found:
            out_product = dict(found)
            out_product["product_id"] = _denormalize_product_id(found.get("product_id"))
            return {
                "status": "ok",
                "store_id": store_id,
                "product": out_product,
                "is_critical": out_product.get("is_critical", False),
            }

        else:
            return {
                "status": "not_found",
                "store_id": store_id,
                "product_id": norm_id,
                "message": "Product not found in stock analysis",
            }

    def run(
        self,
        store_id: str,
        product_id: int | str | None = None,
        format: Literal["json", "text", "ai"] = "json",
    ):
        """
        Senkron sarmalayıcı: unittest/pytest'in senkron testleri için.
        İçeride ayrı bir event loop açar, arun()'u bloklayarak çalıştırır.
        """
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            new_loop = asyncio.new_event_loop()
            try:
                return new_loop.run_until_complete(
                    self.arun(store_id, product_id=product_id, format=format)
                )
            finally:
                new_loop.close()

        return asyncio.run(self.arun(store_id, product_id=product_id, format=format))
