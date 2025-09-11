from __future__ import annotations
import math
from datetime import datetime, timedelta, date
from typing import Dict, List, Optional, Protocol, Any

import numpy as np

from core.agents.base_agent import BaseAgent
from core.repositories.base import SalesRepository
from core.models.sales import SalesRecord, ProductAnalysis, SalesAnalysisResult


# ---- Opsiyonel LLM sözleşmesi (DI) ----
class LLMClientProtocol(Protocol):
    async def generate_content_async(self, prompt: str) -> Any: ...


class SalesAgent(BaseAgent):
    """
    Sadece repository üzerinden satış verisi okur.
    Mock üretim KAPALI (bilerek). Repo sağlanmazsa çalışmaz.
    Ürün bazında analiz/tahmin yapar; (opsiyonel) LLM içgörüsü ekleyebilir.
    """

    def __init__(
        self,
        sales_repo: Optional[SalesRepository] = None,
        trend_analysis_period: int = 30,
        *,
        llm: Optional[LLMClientProtocol] = None,  # DI: opsiyonel LLM
    ):
        super().__init__(name="Advanced Sales Analyst")
        self.repo = sales_repo
        self.trend_analysis_period = int(trend_analysis_period)
        self.llm = llm

        # Basit mevsimsellik (config edilebilir)
        self.seasonal_factors = {
            "Q1": 0.9,
            "Q2": 1.0,
            "Q3": 1.1,
            "Q4": 1.3,
            "holidays": ["12-25", "01-01", "07-04"],
            "weekend_boost": 1.5,
        }

        # Ayarlar (config’e taşınabilir)
        self.trend_backoff_threshold = 0.6  # trend aşırıysa pencere genişlet
        self.expand_days = 15
        self.max_window_days = 60
        self.trend_cap = 0.5  # ±0.5

    # -------------------------------------------------------------------------
    # Public API
    # -------------------------------------------------------------------------

    async def analyze_sales(
        self,
        store_id: str,
        product_ids: Optional[List[str]] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        days: Optional[int] = None,
    ) -> Dict:
        """
        1) Veri topla (HER ZAMAN repo’dan)
        2) Analiz
        3) Gözlemle: trend aşırıysa pencereyi genişlet ve yeniden analiz
        """
        if not end_date:
            end_date = date.today()
        if not start_date:
            # days parametresi varsa onu kullan, yoksa default trend_analysis_period
            analysis_days = days if days is not None else self.trend_analysis_period
            start_date = end_date - timedelta(days=analysis_days)

        # 1) veri
        rows = await self._fetch_rows(store_id, start_date, end_date, product_ids)

        # Eğer boşsa: pencereyi kademeli genişlet (kullanıcı yanıt alabilsin)
        if not rows:
            window_days = (end_date - start_date).days + 1
            try_days = window_days
            while try_days < self.max_window_days and not rows:
                try_days += self.expand_days
                new_start = end_date - timedelta(days=try_days)
                rows = await self._fetch_rows(store_id, new_start, end_date, product_ids)
                if rows:
                    start_date = new_start
                    break

        # Hâlâ boşsa: veri evrenine göre anchor’la (repo’daki en güncel tarihe yanaş)
        if not rows:
            try:
                # Repo’dan geniş bir aralık çekip en geç tarihi bul
                universe = await self.repo.get_sales_records(
                    store_id=store_id,
                    start_date=end_date - timedelta(days=self.max_window_days),
                    end_date=end_date,
                    product_ids=product_ids,
                )
                latest = None
                for r in universe:
                    dtxt = getattr(r, 'sale_date', None) or getattr(r, 'date', None) or (r.get('sale_date') if isinstance(r, dict) else None) or (r.get('date') if isinstance(r, dict) else None)
                    if not dtxt:
                        continue
                    try:
                        d = datetime.fromisoformat(str(dtxt)).date()
                    except Exception:
                        try:
                            d = datetime.strptime(str(dtxt), "%Y-%m-%d").date()
                        except Exception:
                            continue
                    if latest is None or d > latest:
                        latest = d
                if latest is not None:
                    anchor_end = latest
                    anchor_start = anchor_end - timedelta(days=(days if days is not None else self.trend_analysis_period))
                    rows = await self._fetch_rows(store_id, anchor_start, anchor_end, product_ids)
                    if rows:
                        start_date, end_date = anchor_start, anchor_end
            except Exception:
                pass

        # 2) analiz (tek tur)
        result = await self._run_analysis(store_id, rows, end_date=end_date)

        # 3) trend aşırı → pencere genişlet
        try:
            max_trend = max(
                abs(p.get("weekly_trend", 0.0)) for p in result.get("products", [])
            ) if result.get("products") else 0.0
        except Exception:
            max_trend = 0.0

        window_days = (end_date - start_date).days + 1
        if max_trend > self.trend_backoff_threshold and window_days < self.max_window_days:
            new_start = start_date - timedelta(days=self.expand_days)
            rows2 = await self._fetch_rows(store_id, new_start, end_date, product_ids)
            result = await self._run_analysis(store_id, rows2, end_date=end_date)

        # Etkin analiz dönemi bilgisini ekle
        result["effective_period_days"] = (end_date - start_date).days + 1
        result["effective_start_date"] = start_date.isoformat()
        result["effective_end_date"] = end_date.isoformat()

        return result

    # -------------------------------------------------------------------------
    # İç akış: veri çekme + tek tur analiz
    # -------------------------------------------------------------------------

    async def _fetch_rows(
        self,
        store_id: str,
        start_date: date,
        end_date: date,
        product_ids: Optional[List[str]],
    ) -> List[Dict]:
        """HER ZAMAN repository'den okur; repo yoksa açık hata fırlatır."""
        if not self.repo:
            raise RuntimeError(
                "SalesRepository is not configured. "
                "Mock data is disabled. Provide a SalesRepository (e.g., InMemorySalesRepository/Postgres adapter)."
            )
        records: List[SalesRecord] = await self.repo.get_sales_records(
            store_id=store_id,
            start_date=start_date,
            end_date=end_date,
            product_ids=product_ids,
        )
        # Pydantic v1/v2 uyumluluğu için
        result = []
        for r in records:
            try:
                if hasattr(r, 'model_dump'):
                    result.append(r.model_dump())
                elif hasattr(r, 'dict'):
                    result.append(r.dict())
                else:
                    result.append(dict(r))
            except Exception:
                # Fallback: manual conversion
                result.append({
                    'id': getattr(r, 'id', ''),
                    'product_id': getattr(r, 'product_id', ''),
                    'product_name': getattr(r, 'product_name', ''),
                    'category': getattr(r, 'category', ''),
                    'quantity': getattr(r, 'quantity', 0),
                    'unit_price': getattr(r, 'unit_price', 0.0),
                    'total_amount': getattr(r, 'total_amount', 0.0),
                    'sale_date': getattr(r, 'sale_date', ''),
                    'store_id': getattr(r, 'store_id', ''),
                })
        return result

    async def _run_analysis(self, store_id: str, rows: List[Dict], *, end_date: date) -> Dict:
        if not rows:
            return SalesAnalysisResult(
                status="error",
                store_id=store_id,
                analysis_period=self.trend_analysis_period,
                products=[],
                trend_analysis={},
            ).model_dump()

        # Haftanın gün etkisini bir kez öğren
        dow_f = self._dow_factors(rows)

        # Ürün bazında analiz
        grouped = self._group_by_product(rows)
        analyzed_products: List[Dict] = []
        for product in grouped:
            analysis = await self._enhanced_product_analysis(
                product,
                dow_factors=dow_f,
                forecast_start_weekday=(end_date + timedelta(days=1)).weekday(),  # DOW hizası
            )
            analyzed_products.append(analysis)

        # Trend analizi
        trend = await self._advanced_trend_analysis(rows)

        # Toplam revenue ve sales hesapla
        total_revenue = sum(p.get("total_revenue", 0.0) for p in analyzed_products)
        total_sales = sum(p.get("total_sold", 0) for p in analyzed_products)
        
        # Ek özetler: top/least seller ve ortalama tahmin güveni
        top_seller = None
        least_seller = None
        avg_confidence = None
        try:
            if analyzed_products:
                top_seller = max(analyzed_products, key=lambda p: float(p.get("total_revenue", 0.0)))
                least_seller = min(analyzed_products, key=lambda p: int(p.get("total_sold", 0)))
                confidences = []
                for p in analyzed_products:
                    sf = p.get("sales_forecast") or {}
                    c = sf.get("confidence")
                    if isinstance(c, (int, float)):
                        confidences.append(float(c))
                if confidences:
                    avg_confidence = round(float(np.mean(confidences)), 2)
        except Exception:
            pass

        result = SalesAnalysisResult(
            status="success",
            store_id=store_id,
            analysis_period=self.trend_analysis_period,
            products=[ProductAnalysis(**a) for a in analyzed_products],
            trend_analysis=trend,
            total_revenue=total_revenue,
            total_sales=total_sales,
        ).model_dump()

        # Sonuç zenginleştirme (model alanlarına ek)
        if top_seller:
            result["top_seller"] = {
                "product_id": top_seller.get("product_id"),
                "product_name": top_seller.get("product_name"),
                "total_sold": top_seller.get("total_sold"),
                "total_revenue": top_seller.get("total_revenue"),
                "weekly_trend": top_seller.get("weekly_trend"),
            }
        if least_seller:
            result["least_seller"] = {
                "product_id": least_seller.get("product_id"),
                "product_name": least_seller.get("product_name"),
                "total_sold": least_seller.get("total_sold"),
                "weekly_trend": least_seller.get("weekly_trend"),
            }
        if avg_confidence is not None:
            result["avg_forecast_confidence"] = avg_confidence

        # AI özet (opsiyonel)
        result["ai_insights"] = await self._maybe_generate_ai_insights(result["products"])

        return result

    # -------------------------------------------------------------------------
    # Metrikler / Tahmin / Yardımcılar
    # -------------------------------------------------------------------------

    def _group_by_product(self, rows: List[Dict]) -> List[Dict]:
        by_pid: Dict[str, Dict] = {}
        for r in rows:
            pid = r["product_id"]
            if pid not in by_pid:
                by_pid[pid] = {
                    "product_id": pid,
                    "product_name": r.get("product_name"),
                    "sales_records": [],
                    "total_quantity": 0,
                    "total_revenue": 0.0,
                    "category": r.get("category"),
                }
            by_pid[pid]["sales_records"].append(r)
            by_pid[pid]["total_quantity"] += int(r["quantity"])
            by_pid[pid]["total_revenue"] += float(r.get("revenue", r.get("total_amount", 0)))
        for v in by_pid.values():
            v["sales_records"].sort(key=lambda x: x["date"])
            v["total_revenue"] = round(v["total_revenue"], 2)
        return list(by_pid.values())

    async def _enhanced_product_analysis(
        self,
        product_data: Dict,
        dow_factors: Optional[Dict[int, float]] = None,
        *,
        forecast_start_weekday: int,
    ) -> Dict:
        daily = self._calculate_daily_sales(product_data["sales_records"])
        weekly_trend = self._calculate_weekly_trend(daily)

        forecast = self._enhanced_forecast(
            daily_sales=daily,
            trend=weekly_trend,
            dow_factors=dow_factors,
            start_weekday=forecast_start_weekday,  # DOW hizası
        )

        analysis = {
            "product_id": product_data["product_id"],
            "product_name": product_data.get("product_name"),
            "category": product_data.get("category"),
            "total_sold": product_data["total_quantity"],
            "total_revenue": product_data["total_revenue"],
            "avg_daily_sales": round(float(np.mean(daily)), 2) if daily else 0.0,
            "sales_consistency": round(self._calculate_consistency(daily), 2),
            "weekly_trend": round(weekly_trend, 2),
            "sales_forecast": forecast,
            "seasonal_impact": self._calculate_seasonal_impact(),
        }

        # Ürün özel AI içgörüsü (opsiyonel)
        analysis["ai_product_insights"] = await self._maybe_get_product_insights(analysis)

        return analysis

    def _calculate_daily_sales(self, sales_records: List[Dict]) -> List[int]:
        by_day: Dict[str, int] = {}
        for r in sales_records:
            by_day[r["date"]] = by_day.get(r["date"], 0) + int(r["quantity"])
        dates_sorted = sorted(by_day.keys())
        return [by_day[d] for d in dates_sorted]

    def _calculate_weekly_trend(self, daily: List[int]) -> float:
        """Son 7 gün / önceki 7 gün - 1"""
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
        """Tutarlılık ~ 1 - CV (0..1)"""
        if not daily:
            return 0.0
        arr = np.array(daily, dtype=float)
        mu = float(np.mean(arr))
        sigma = float(np.std(arr))
        if mu == 0:
            return 0.0
        cv = sigma / mu
        return float(max(0.0, min(1.0, 1.0 - cv)))

    def _dow_factors(self, raw_rows: List[Dict]) -> Dict[int, float]:
        """
        Haftanın günlerine göre göreli talep katsayıları (öğrenilmiş).
        0=Mon .. 6=Sun, ortalama 1.0 civarı normalize edilir.
        """
        by_dow = {i: [] for i in range(7)}
        for r in raw_rows:
            try:
                dow = datetime.strptime(r["date"], "%Y-%m-%d").weekday()
            except Exception:
                continue
            by_dow[dow].append(int(r["quantity"]))

        means = {i: (float(np.mean(v)) if v else 0.0) for i, v in by_dow.items()}
        vals = [m for m in means.values() if m > 0]
        global_mean = float(np.mean(vals)) if vals else 0.0
        if global_mean <= 0:
            return {i: 1.0 for i in range(7)}
        return {i: (means[i] / global_mean if means[i] > 0 else 1.0) for i in range(7)}

    # === Tahmin yardımcıları (DOW hizalı + Poisson toplam λ) ===

    def _sum_next7_with_dow(self, base_day: float, dow_f: Dict[int, float], start_weekday: int) -> float:
        # start_weekday: forecast başlangıcı (0=Mon..6=Sun)
        return sum(base_day * dow_f.get((start_weekday + i) % 7, 1.0) for i in range(7))

    def _poisson_interval_from_total_lambda(self, lam_total: float) -> List[int]:
        lam_total = max(1e-6, lam_total)
        low = int(max(0, lam_total - 1.96 * math.sqrt(lam_total)))
        high = int(lam_total + 1.96 * math.sqrt(lam_total))
        return [low, high]

    def _forecast_sales(
        self,
        daily: List[int],
        weekly_trend: float,
        dow_f: Optional[Dict[int, float]],
        *,
        start_weekday: int,
    ) -> Dict:
        """
        Basit tahmin + gün-etkisi düzeltmesi + Poisson aralığı (7 gün toplam için).
        DOW hizalı ve toplam λ üzerinden interval.
        """
        n = len(daily)
        if n == 0:
            return {"next_7days": 0, "confidence": 0.3, "interval": [0, 0]}

        mean = float(np.mean(daily))
        trend_factor = max(-self.trend_cap, min(self.trend_cap, weekly_trend))
        base_day = max(0.0, mean) * (1.0 + trend_factor)

        if dow_f:
            lam_total = self._sum_next7_with_dow(base_day, dow_f, start_weekday)
        else:
            lam_total = base_day * 7.0

        # Confidence: veri miktarı ve tutarlılık temelli (sezonsallığı katmayalım)
        consistency = self._calculate_consistency(daily)  # 0..1
        base_conf = 0.4 + 0.4 * min(1.0, n / 30.0)        # 0.4..0.8
        confidence = max(0.2, min(0.95, base_conf * (0.7 + 0.3 * consistency)))

        interval = self._poisson_interval_from_total_lambda(lam_total)

        return {
            "next_7days": max(0, int(round(lam_total))),
            "confidence": round(confidence, 2),
            "interval": interval,
        }

    def _enhanced_forecast(
        self,
        daily_sales: List[int],
        trend: float,
        dow_factors: Optional[Dict[int, float]] = None,
        *,
        start_weekday: int,
    ) -> Dict:
        """
        Mevsimsellik ile zenginleştirilmiş tahmin; DOW hizası ve belirsizlik aralığı dahil.
        Confidence sezonsallıkla çarpılmaz; yalnızca beklenen satışlar ölçeklenir.
        """
        base = self._forecast_sales(
            daily=daily_sales,
            weekly_trend=trend,
            dow_f=dow_factors,
            start_weekday=start_weekday,
        )
        q = f"Q{(datetime.now().month - 1) // 3 + 1}"
        seasonal_factor = float(self.seasonal_factors.get(q, 1.0))

        # Beklenen değerleri sezonsallıkla ölçekle
        scaled_next7 = max(0, int(round(base["next_7days"] * seasonal_factor)))
        # Interval'ı da beklenen λ ile aynı oranda ölçeklemek için yaklaşık yaklaşım:
        low, high = base.get("interval", [0, 0])
        scaled_interval = [max(0, int(round(low * seasonal_factor))), max(0, int(round(high * seasonal_factor)))]

        return {
            "next_7days": scaled_next7,
            "confidence": base["confidence"],  # sezonsallık confidence'a uygulanmaz
            "seasonal_factor": seasonal_factor,
            "interval": scaled_interval,
        }

    def _calculate_seasonal_impact(self) -> Dict:
        q = f"Q{(datetime.now().month - 1) // 3 + 1}"
        weekend_boost = self.seasonal_factors.get("weekend_boost", 1.0)
        return {
            "quarter": q,
            "quarter_factor": self.seasonal_factors.get(q, 1.0),
            "weekend_boost": weekend_boost,
        }

    async def _advanced_trend_analysis(self, raw_data: List[Dict]) -> Dict:
        # Hafta günleri toplam adet
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        weekly_pattern = {}
        for i, day in enumerate(labels):
            total = 0
            for d in raw_data:
                try:
                    if datetime.strptime(d["date"], "%Y-%m-%d").weekday() == i:
                        total += int(d["quantity"])
                except Exception:
                    continue
            weekly_pattern[day] = int(total)

        # Kategori trend (naif)
        cats = {d.get("category") for d in raw_data if d.get("category")}
        category_trends: Dict[str, Dict] = {}
        for cat in cats:
            cat_rows = [d for d in raw_data if d.get("category") == cat]
            agg: Dict[str, int] = {}
            for r in cat_rows:
                agg[r["product_id"]] = agg.get(r["product_id"], 0) + int(r["quantity"])
            top_product = max(agg, key=agg.get) if agg else None
            category_trends[cat] = {
                "growth": float(np.random.uniform(-0.2, 0.3)),
                "top_product": top_product,
            }

        # Promosyon etkisi (naif)
        promo_days = [d for d in raw_data if d.get("discount", 0) > 0]
        if promo_days:
            normal = [d["quantity"] for d in raw_data if d.get("discount", 0) == 0]
            promo = [d["quantity"] for d in promo_days]
            normal_avg = float(np.mean(normal)) if normal else 0.0
            promo_avg = float(np.mean(promo)) if promo else 0.0
            effectiveness = 0.0 if normal_avg == 0 else round((promo_avg - normal_avg) / normal_avg, 2)
        else:
            effectiveness, promo_avg = 0.0, 0.0

        return {
            "weekly_pattern": weekly_pattern,
            "category_trends": category_trends,
            "promotion_impact": {
                "effectiveness": effectiveness,
                "avg_boost": round(promo_avg, 2),
            },
        }

    # -------------------------------------------------------------------------
    # AI içgörü (opsiyonel)
    # -------------------------------------------------------------------------

    async def _maybe_generate_ai_insights(self, products: List[Dict]) -> str:
        prompt = (
            "Sales product summaries as JSON:\n"
            f"{products}\n\n"
            "Tasks:\n"
            "1) Top 3 profitable products with brief reasons.\n"
            "2) Two actions for weak performers.\n"
            "3) Stock suggestions with numeric ranges considering seasonality.\n"
            "Return short, bullet points.\n"
        )
        if self.llm is None:
            # Basit deterministik özet (LLM yoksa)
            bullets = []
            if products:
                # kâr proxysi: total_revenue
                top = sorted(products, key=lambda p: p.get("total_revenue", 0), reverse=True)[:3]
                bullets.append("- Top performers: " + ", ".join(p.get("product_id", "?") for p in top))
                weak = sorted(products, key=lambda p: p.get("total_revenue", 0))[:2]
                bullets.append("- Improve: " + ", ".join(p.get("product_id", "?") for p in weak))
                rngs = []
                for p in products:
                    f = (p.get("sales_forecast") or {}).get("interval", [0, 0])
                    rngs.append(f"{p.get('product_id','?')}: {f[0]}–{f[1]}")
                bullets.append("- Stock range (7d): " + "; ".join(rngs))
            return "\n".join(bullets) if bullets else "No data."
        try:
            resp = await self.llm.generate_content_async(prompt)
            return getattr(resp, "text", str(resp))
        except Exception as e:
            return f"AI Insight Error: {e}"

    async def _maybe_get_product_insights(self, product_data: Dict) -> str:
        prompt = (
            "Product JSON:\n"
            f"{product_data}\n\n"
            "Tasks:\n"
            "1) Pricing suggestion given trend/consistency.\n"
            "2) Best promotion window.\n"
            "3) Short actionable bullets.\n"
        )
        if self.llm is None:
            # LLM yoksa kısa deterministik öneri
            trend = product_data.get("weekly_trend", 0.0) or 0.0
            cons = product_data.get("sales_consistency", 0.0) or 0.0
            tip = "Consider small price increase" if trend > 0.1 and cons > 0.5 else "Avoid price hikes; improve visibility"
            return f"- {tip}\n- Weekend promo window\n- Keep stock near forecast median"
        try:
            resp = await self.llm.generate_content_async(prompt)
            return getattr(resp, "text", str(resp))
        except Exception as e:
            return f"AI Product Insight Error: {e}"
