# core/agents/sales_agent.py
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Literal, Tuple
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv

from core.agents.base_agent import BaseAgent  # sadece init için

load_dotenv()


class SalesAgent(BaseAgent):
    """
    Advanced Sales Analyst
    - 30 günlük mock satış verisi üretir (ürün bazlı)
    - Ürün bazında konsolidasyon + metrikler
    - Haftalık/kategori trendleri
    - Basit mevsimsellik ve tahmin
    - Opsiyonel Gemini 1.5 Pro ile AI yorumları
    """

    def __init__(self, trend_analysis_period: int = 30):
        super().__init__(name="Advanced Sales Analyst")  # <-- sadece name
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")
        self.gemini = None
        if api_key:
            genai.configure(api_key=api_key)
            self.gemini = genai.GenerativeModel("gemini-1.5-pro")

        self.trend_analysis_period = trend_analysis_period
        self.seasonal_factors = self._load_seasonal_factors()

    # ---------- Public API ----------

    async def analyze_sales(self, store_id: str, product_id: Optional[str] = None) -> Dict:
        """Mağaza (ve opsiyonel ürün) için gelişmiş satış analizi döndürür."""
        raw_data = await self._get_enhanced_sales_data(store_id, product_id)
        if not raw_data:
            return {"status": "error", "message": "No sales data found", "store_id": store_id}

        analyzed_products: List[Dict] = []
        for product in self._group_by_product(raw_data):
            analysis = await self._enhanced_product_analysis(product)
            analyzed_products.append(analysis)

        result = {
            "status": "success",
            "store_id": store_id,
            "analysis_period": self.trend_analysis_period,
            "products": analyzed_products,
            "trend_analysis": await self._advanced_trend_analysis(raw_data),
        }

        if self.gemini:
            try:
                result["ai_insights"] = await self._generate_ai_insights(analyzed_products)
            except Exception as e:
                result["ai_insights"] = f"AI Insight Error: {e}"

        return result

    async def generate_sales_report(
        self,
        analysis_result: Dict,
        format: Literal["text", "ai", "visual"] = "text",
    ) -> str:
        """Metin/AI/visual formatta özet döndürür (PDF vs. raporlama ajanına bırakılmalı)."""
        if format == "ai":
            return analysis_result.get("ai_insights", "AI not available")
        if format == "visual":
            return self._generate_visual_report(analysis_result)
        return self._format_enhanced_summary(analysis_result)

    # ---------- Data generation (mock) ----------

    async def _get_enhanced_sales_data(
        self, store_id: str, product_id: Optional[str] = None
    ) -> List[Dict]:
        """
        30 günlük sahte veri üretir:
        - product_id: P100, P200, P300
        - quantity: N(mu=3, sigma=1) -> en az 1
        - unit_price: ürün bazlı
        - revenue: quantity * unit_price
        - category, discount
        """
        product_names = ["Premium Kulaklık", "Kablosuz Şarj", "Akıllı Saat"]
        categories = ["electronics", "electronics", "wearables"]
        unit_prices = [599.99, 199.99, 1299.99]

        base: List[Dict] = []
        # Son trend_analysis_period gün
        for day_idx, d in enumerate(range(self.trend_analysis_period, 0, -1)):
            date_str = (datetime.now() - timedelta(days=d)).strftime("%Y-%m-%d")
            # Üç üründen biri (sıralı döngü)
            prod_idx = day_idx % 3
            pid = f"P{100 + prod_idx}"

            qty = max(1, int(np.random.normal(3, 1)))
            price = unit_prices[prod_idx]
            base.append(
                {
                    "store_id": store_id,
                    "date": date_str,
                    "product_id": pid,
                    "product_name": product_names[prod_idx],
                    "quantity": qty,
                    "unit_price": price,
                    "revenue": round(qty * price, 2),
                    "category": categories[prod_idx],
                    "discount": 0.1 if day_idx % 5 == 0 else 0,
                }
            )

        if product_id:
            base = [r for r in base if r["product_id"] == product_id]
        return base

    # ---------- Product-level analysis ----------

    def _group_by_product(self, rows: List[Dict]) -> List[Dict]:
        """
        rows -> ürün bazında konsolidasyon
        Dönen her girdide:
        - product_id, product_name
        - sales_records: günlük kayıtlar
        - total_quantity, total_revenue
        """
        by_pid: Dict[str, Dict] = {}
        for r in rows:
            pid = r["product_id"]
            if pid not in by_pid:
                by_pid[pid] = {
                    "product_id": pid,
                    "product_name": r["product_name"],
                    "sales_records": [],
                    "total_quantity": 0,
                    "total_revenue": 0.0,
                    "category": r.get("category"),
                }
            by_pid[pid]["sales_records"].append(r)
            by_pid[pid]["total_quantity"] += r["quantity"]
            by_pid[pid]["total_revenue"] += r["revenue"]

        # kronolojik sırala
        for v in by_pid.values():
            v["sales_records"].sort(key=lambda x: x["date"])
            v["total_revenue"] = round(v["total_revenue"], 2)

        return list(by_pid.values())

    async def _enhanced_product_analysis(self, product_data: Dict) -> Dict:
        daily_sales = self._calculate_daily_sales(product_data["sales_records"])
        weekly_trend = self._calculate_weekly_trend(daily_sales)

        analysis = {
            "product_id": product_data["product_id"],
            "product_name": product_data["product_name"],
            "category": product_data.get("category"),
            "total_sold": product_data["total_quantity"],
            "total_revenue": product_data["total_revenue"],
            "avg_daily_sales": round(float(np.mean(daily_sales)), 2) if daily_sales else 0.0,
            "sales_consistency": round(self._calculate_consistency(daily_sales), 2),
            "weekly_trend": round(weekly_trend, 2),
            "sales_forecast": self._enhanced_forecast(daily_sales, weekly_trend),
            "seasonal_impact": self._calculate_seasonal_impact(product_data),
        }

        if self.gemini:
            try:
                analysis["ai_product_insights"] = await self._get_product_insights(analysis)
            except Exception as e:
                analysis["ai_product_insights"] = f"AI Product Insight Error: {e}"

        return analysis

    # ---------- Metrics helpers (deterministic) ----------

    def _calculate_daily_sales(self, sales_records: List[Dict]) -> List[int]:
        """Günlük toplam adet serisi (kronolojik)."""
        by_day: Dict[str, int] = {}
        for r in sales_records:
            by_day[r["date"]] = by_day.get(r["date"], 0) + int(r["quantity"])
        # kronolojik
        dates_sorted = sorted(by_day.keys())
        return [by_day[d] for d in dates_sorted]

    def _calculate_weekly_trend(self, daily: List[int]) -> float:
        """
        Basit trend: son 7 gün ortalaması / önceki 7 gün ortalaması - 1
        """
        if len(daily) < 14:
            return 0.0
        prev = daily[-14:-7]
        last = daily[-7:]
        prev_avg = float(np.mean(prev)) if prev else 0.0
        last_avg = float(np.mean(last)) if last else 0.0
        if prev_avg == 0:
            return 0.0
        return (last_avg / prev_avg) - 1.0

    def _calculate_consistency(self, daily: List[int]) -> float:
        """
        Tutarlılık ~ 1 - CV (coefficient of variation), 0..1 arası kırpılır.
        """
        if not daily:
            return 0.0
        arr = np.array(daily, dtype=float)
        mu = float(np.mean(arr))
        sigma = float(np.std(arr))
        if mu == 0:
            return 0.0
        cv = sigma / mu
        return float(max(0.0, min(1.0, 1.0 - cv)))  # 0..1

    def _forecast_sales(self, daily: List[int], weekly_trend: float) -> Dict:
        """
        Basit tahmin: mean*7 * (1 + trend_factor)
        Güven: veri uzunluğu ve değişkenliğe göre kaba skor.
        """
        n = len(daily)
        if n == 0:
            return {"next_7days": 0, "confidence": 0.3}

        mean = float(np.mean(daily))
        trend_factor = max(-0.5, min(0.5, weekly_trend))  # aşırı sapmaları sınırla
        next_7 = int(round(mean * 7 * (1.0 + trend_factor)))

        # güven skoru: örnek sayısı ve CV’ye göre
        consistency = self._calculate_consistency(daily)  # 0..1
        base_conf = 0.4 + 0.4 * min(1.0, n / 30.0)        # 0.4..0.8
        confidence = max(0.2, min(0.95, base_conf * (0.7 + 0.3 * consistency)))
        return {"next_7days": max(0, next_7), "confidence": round(confidence, 2)}

    def _enhanced_forecast(self, daily_sales: List[int], trend: float) -> Dict:
        """Mevsimsellik dahil tahmin."""
        base = self._forecast_sales(daily_sales, trend)
        current_quarter = f"Q{(datetime.now().month - 1) // 3 + 1}"
        seasonal_factor = float(self.seasonal_factors.get(current_quarter, 1.0))
        return {
            "next_7days": max(0, int(round(base["next_7days"] * seasonal_factor))),
            "confidence": min(0.95, round(base["confidence"] * seasonal_factor, 2)),
            "seasonal_factor": seasonal_factor,
        }

    def _calculate_seasonal_impact(self, product_data: Dict) -> Dict:
        """
        Kaba mevsimsel etki: şu anki çeyrek faktörü + hafta sonu artışı.
        Gerçek uygulamada ürün/segment bazında kalibre edilmeli.
        """
        q = f"Q{(datetime.now().month - 1) // 3 + 1}"
        weekend_boost = self.seasonal_factors.get("weekend_boost", 1.0)
        return {"quarter": q, "quarter_factor": self.seasonal_factors.get(q, 1.0), "weekend_boost": weekend_boost}

    # ---------- Advanced trend analysis ----------

    async def _advanced_trend_analysis(self, raw_data: List[Dict]) -> Dict:
        # Haftalık desen (hafta günleri toplam adet)
        weekly_pattern = {
            day: sum(d["quantity"] for d in raw_data if datetime.strptime(d["date"], "%Y-%m-%d").weekday() == i)
            for i, day in enumerate(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
        }

        # Kategori trend (mock growth + en çok satan)
        categories = {d["category"] for d in raw_data}
        category_trends = {}
        for cat in categories:
            cat_rows = [d for d in raw_data if d["category"] == cat]
            top_product = max(cat_rows, key=lambda x: x["quantity"])["product_id"] if cat_rows else None
            category_trends[cat] = {
                "growth": float(np.random.uniform(-0.2, 0.3)),
                "top_product": top_product,
            }

        promo = await self._analyze_promotion_effect(raw_data)
        return {"weekly_pattern": weekly_pattern, "category_trends": category_trends, "promotion_impact": promo}

    async def _analyze_promotion_effect(self, data: List[Dict]) -> Dict:
        promo_days = [d for d in data if d.get("discount", 0) > 0]
        if not promo_days:
            return {"effectiveness": 0.0, "avg_boost": 0.0}

        normal = [d["quantity"] for d in data if d.get("discount", 0) == 0]
        promo = [d["quantity"] for d in promo_days]
        normal_avg = float(np.mean(normal)) if normal else 0.0
        promo_avg = float(np.mean(promo)) if promo else 0.0
        effectiveness = 0.0 if normal_avg == 0 else round((promo_avg - normal_avg) / normal_avg, 2)
        return {"effectiveness": effectiveness, "avg_boost": round(promo_avg, 2)}

    # ---------- AI prompts ----------

    async def _generate_ai_insights(self, products: List[Dict]) -> str:
        if not self.gemini:
            return "AI not configured."

        prompt = f"""
Satış Analiz Verileri (ürün özetleri JSON):
{products}

İstenen:
1) En kârlı 3 ürünü belirle ve kısa gerekçe yaz.
2) Zayıf performanslı ürünler için 2 aksiyon öner.
3) Mevsimselliği dikkate alarak stok önerisi yap (nicel aralıklar ver).
Cevabı madde madde, kısa ve uygulanabilir yaz.
"""
        resp = await self.gemini.generate_content_async(prompt)
        return resp.text

    async def _get_product_insights(self, product_data: Dict) -> str:
        if not self.gemini:
            return ""
        prompt = f"""
Ürün Analizi (JSON):
{product_data}

İstenen:
1) Trend ve tutarlılığına göre fiyatlandırma önerisi.
2) En uygun promosyon zaman aralığı.
3) Kısa aksiyon maddeleri.
Kısa, net, maddeler halinde.
"""
        resp = await self.gemini.generate_content_async(prompt)
        return resp.text

    # ---------- Reporting strings (UI önizleme) ----------

    def _format_enhanced_summary(self, analysis: Dict) -> str:
        lines = [
            f"📊 {analysis.get('analysis_period', self.trend_analysis_period)} Günlük Gelişmiş Analiz",
            f"🏬 Mağaza: {analysis.get('store_id','-')}",
            f"📅 Son Güncelleme: {datetime.now().strftime('%d.%m.%Y %H:%M')}",
            "",
        ]
        products = analysis.get("products", [])
        total_sold = sum(p.get("total_sold", 0) for p in products)
        total_rev = sum(p.get("total_revenue", 0.0) for p in products)
        lines += [f"💰 Toplam Satış: {total_sold} adet", f"💵 Ciro: ${total_rev:,.2f}", ""]

        if products:
            top = max(products, key=lambda x: x.get("total_revenue", 0.0))
            lines += [
                "🏆 En Başarılı Ürün:",
                f"- {top.get('product_name','?')} (${top.get('total_revenue',0):,.2f})",
                f"  📈 Tahmin: {top['sales_forecast']['next_7days']} adet/sonraki hafta",
                "",
            ]

        lines.append("📈 Öne Çıkan Trendler:")
        trend = analysis.get("trend_analysis", {})
        for cat, data in (trend.get("category_trends") or {}).items():
            growth = float(data.get("growth", 0))
            updown = "↑" if growth > 0 else "↓"
            lines.append(f"- {cat.capitalize()}: {updown} {abs(growth):.1%} (En iyi: {data.get('top_product','-')})")
        return "\n".join(lines)

    def _generate_visual_report(self, analysis: Dict) -> str:
        products = sorted(analysis.get("products", []), key=lambda x: x.get("total_revenue", 0.0), reverse=True)
        weekly = (analysis.get("trend_analysis") or {}).get("weekly_pattern") or {}
        out = [
            "🖥️ GRAFİKSEL RAPOR ÖNİZLEME",
            "📊 Ürün Performansı:",
            *[
                f"{p.get('product_name','?')}: {'■' * max(1, int(p.get('total_sold',0) / 5))} {p.get('total_sold',0)} adet"
                for p in products[:3]
            ],
            "",
            "⏰ Zaman Dağılımı:",
            *[f"{day}: {'■' * max(1, int(count / 10))}" for day, count in weekly.items()],
        ]
        return "\n".join(out)

    # ---------- Config ----------

    def _load_seasonal_factors(self) -> Dict:
        return {
            "Q1": 0.9,
            "Q2": 1.0,
            "Q3": 1.1,
            "Q4": 1.3,
            "holidays": ["12-25", "01-01", "07-04"],
            "weekend_boost": 1.5,
        }
