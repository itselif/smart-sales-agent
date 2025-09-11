# core/agents/stock_agent.py
from __future__ import annotations

import asyncio
import concurrent.futures
import re
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Literal, Union, Tuple, Any, Protocol, TypedDict

from core.repositories.base import StockRepository
from core.models.stock import StockRow

# ==== Timezone: Europe/Istanbul (fallback UTC+3) ====
try:
    from zoneinfo import ZoneInfo
    try:
        IST_TZ = ZoneInfo("Europe/Istanbul")
    except Exception:
        IST_TZ = timezone(timedelta(hours=3), name="TRT")
except Exception:
    IST_TZ = timezone(timedelta(hours=3), name="TRT")

# ==== Konfig / sabitler ====
DEFAULT_CRITICAL_RULES: Dict[str, Dict[str, float]] = {
    "high":   {"min_stock": 20, "sales_threshold": 15.0},
    "medium": {"min_stock": 10, "sales_threshold": 5.0},
    "low":    {"min_stock": 3,  "sales_threshold": 1.0},
}
DEFAULT_BUFFER_DAYS = 3
TREND_BUMP_DAYS = 2  # trend "increasing" ise ek buffer

# ==== Tip sözleşmeleri ====
class SalesMetricsTD(TypedDict, total=False):
    avg_daily_sales: float
    trend_label: Literal["increasing", "decreasing", "stable"]
    daily_interval: List[float]  # [low, high]
    forecast_confidence: Optional[float]

class SalesAgentProtocol(Protocol):
    # NOT: İçerde her yerde snake_case kullanıyoruz
    async def analyze_sales(self, *, store_id: str, product_ids: List[str]) -> Dict[str, Any]: ...

class LLMClientProtocol(Protocol):
    async def generate_content_async(self, prompt: str) -> Any: ...

class ProductAnalysisTD(TypedDict, total=False):
    product_id: Union[int, str]
    name: str
    category: str
    supplier: str
    price: float
    current_stock: float
    min_required: float
    lead_time_days: int
    avg_daily_sales: float
    sales_trend: str
    traffic_level: Literal["high", "medium", "low"]
    estimated_days_left: Optional[float]
    estimated_days_left_ci: List[Optional[float]]
    is_critical: bool
    stock_value: float
    safety_stock: int
    lead_time_demand: int
    target_stock_level: int
    reorder_qty_suggestion: int
    policy: Dict[str, float]
    policy_note: str

# ==== ID normalize yardımcıları ====
def _normalize_product_id(pid: int | str | None) -> Optional[str]:
    """int -> 1 => 'P100', 2 => 'P200' ... ; str -> olduğu gibi."""
    if pid is None:
        return None
    try:
        n = int(pid)
        return f"P{n * 100}"
    except (ValueError, TypeError):
        return str(pid)

def _denormalize_product_id(pid_str: str) -> int | str:
    """'P100' -> 1, 'P200' -> 2; bölünemezse string döndür."""
    if not isinstance(pid_str, str):
        return pid_str
    m = re.fullmatch(r"P(\d+)", pid_str)
    if not m:
        return pid_str
    try:
        n = int(m.group(1))
        return n // 100 if n % 100 == 0 else pid_str
    except Exception:
        return pid_str

class StockAgent:
    """
    Stok analiz ajanı (snake_case ile tutarlı).
    - SalesAgent'ten satış metriklerini batch çeker.
    - Emniyet stoğu / hedef stok / sipariş önerisi üretir.
    - format="ai" verilirse LLM ile kısa rapor üretebilir.
    """

    def __init__(
        self,
        sales_agent: SalesAgentProtocol | None = None,
        stock_repo: StockRepository | None = None,
        *,
        service_level: float = 0.95,
        critical_rules: Optional[Dict[str, Dict[str, float]]] = None,
        llm: Optional[LLMClientProtocol] = None,
    ):
        self.sales_agent = sales_agent
        self.stock_repo = stock_repo
        self.service_level = float(service_level)
        self.critical_threshold_rules = critical_rules or DEFAULT_CRITICAL_RULES
        self.llm = llm  # sadece format="ai"

    # -------- Veri kaynağı (repo varsa oradan, yoksa boş) --------
    async def get_stock_data(self, store_id: str) -> List[Dict[str, Any]]:
        if self.stock_repo:
            rows: List[StockRow] = await self.stock_repo.get_stock_snapshot(store_id)
            # Pydantic v1/v2 uyumluluğu için
            result = []
            for r in rows:
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
                        'product_id': getattr(r, 'product_id', ''),
                        'name': getattr(r, 'name', ''),
                        'current_stock': getattr(r, 'current_stock', 0),
                        'min_required': getattr(r, 'min_required', 0),
                        'lead_time_days': getattr(r, 'lead_time_days', 0),
                        'category': getattr(r, 'category', ''),
                        'price': getattr(r, 'price', 0.0),
                        'supplier': getattr(r, 'supplier', ''),
                    })
            return result
        # fallback: mock KAPALI (Mindbricks bağlantısını net görmek için)
        return []

    # -------- SalesAgent entegrasyonu --------
    @staticmethod
    def _default_sales_metrics() -> SalesMetricsTD:
        return {"avg_daily_sales": 1.0, "trend_label": "stable", "daily_interval": [0.8, 1.2]}

    async def _get_sales_metrics_batch(self, store_id: str, product_ids: List[str]) -> Dict[str, SalesMetricsTD]:
        if not product_ids:
            return {}
        if not self.sales_agent:
            return {pid: self._default_sales_metrics() for pid in product_ids}

        try:
            res = await self.sales_agent.analyze_sales(store_id=store_id, product_ids=product_ids)
            if not isinstance(res, dict) or res.get("status") != "success" or not res.get("products"):
                return {pid: self._default_sales_metrics() for pid in product_ids}

            out: Dict[str, SalesMetricsTD] = {}
            for p in res["products"]:
                pid = p.get("product_id")
                if not pid:
                    continue

                avg = float(p.get("avg_daily_sales", 1.0) or 1.0)
                avg = max(0.0, avg)

                weekly_trend = float(p.get("weekly_trend", 0.0) or 0.0)
                if weekly_trend > 0.05:
                    trend_label: Literal["increasing", "decreasing", "stable"] = "increasing"
                elif weekly_trend < -0.05:
                    trend_label = "decreasing"
                else:
                    trend_label = "stable"

                interval = (p.get("sales_forecast") or {}).get("interval")
                if isinstance(interval, list) and len(interval) == 2:
                    try:
                        low7, high7 = float(interval[0]), float(interval[1])
                        daily_low = max(0.0001, low7 / 7.0)
                        daily_high = max(daily_low, high7 / 7.0)
                    except Exception:
                        daily_low, daily_high = max(0.0001, 0.8 * avg), max(0.0001, 1.2 * avg)
                else:
                    daily_low, daily_high = max(0.0001, 0.8 * avg), max(0.0001, 1.2 * avg)

                out[pid] = {
                    "avg_daily_sales": avg,
                    "trend_label": trend_label,
                    "daily_interval": [daily_low, daily_high],
                    "forecast_confidence": (p.get("sales_forecast") or {}).get("confidence"),
                }

            for pid in product_ids:
                out.setdefault(pid, self._default_sales_metrics())

            return out

        except Exception:
            return {pid: self._default_sales_metrics() for pid in product_ids}

    # -------- Ana analiz --------
    async def analyze_stock(self, *, store_id: str) -> Dict[str, Any]:
        stock_rows = await self.get_stock_data(store_id)
        product_ids = [str(p["product_id"]) for p in stock_rows if p.get("product_id") is not None]
        sales_by_pid = await self._get_sales_metrics_batch(store_id, product_ids)

        analyzed: List[ProductAnalysisTD] = []
        for prod in stock_rows:
            metrics = sales_by_pid.get(str(prod["product_id"]), self._default_sales_metrics())
            analyzed.append(self._analyze_single_product(prod, metrics))

        criticals = [p for p in analyzed if p.get("is_critical")]
        total_value = round(sum((p.get("current_stock", 0) or 0) * (p.get("price", 0.0) or 0.0) for p in analyzed), 2)

        return {
            "store_id": store_id,
            "analysis_date": datetime.now(tz=IST_TZ).isoformat(),
            "products": analyzed,
            "critical_products": criticals,
            "total_value": total_value,
        }
    async def analyze_stock_with_data(self, store_id: str, stock_data: List[StockRow]) -> Dict:
        """Dışarıdan sağlanan stok verileri ile analiz yapar"""
        if not stock_data:
            return {
                "store_id": store_id,
                "analysis_date": self._current_datetime(),
                "products": [],
                "critical_products": [],
                "total_value": 0
            }
        
        products = []
        critical_products = []
        total_value = 0
        
        for item in stock_data:
            product_value = item.price * item.current_stock
            
            product_analysis = {
                "product_id": item.product_id,
                "current_stock": item.current_stock,
                "low_stock_threshold": item.min_required,
                "status": "CRITICAL" if item.current_stock <= item.min_required else "OK",
                "estimated_value": product_value,
                "lead_time_days": item.lead_time_days
            }
            
            products.append(product_analysis)
            total_value += product_value
            
            if product_analysis["status"] == "CRITICAL":
                critical_products.append(product_analysis)
        
        return {
            "store_id": store_id,
            "analysis_date": self._current_datetime(),
            "products": products,
            "critical_products": critical_products,
            "total_value": total_value
        }
    # -------- Tekil ürün analizi --------
    def _analyze_single_product(self, product: Dict[str, Any], sales_metrics: SalesMetricsTD) -> ProductAnalysisTD:
        current_stock = max(0.0, float(product.get("current_stock", 0) or 0))
        avg_daily = float(sales_metrics.get("avg_daily_sales", 1.0) or 1.0)
        trend = sales_metrics.get("trend_label", "stable")
        daily_low, daily_high = self._safe_daily_band(sales_metrics.get("daily_interval"), avg_daily)

        traffic_level = self._determine_traffic_level(avg_daily)
        days_left_point = (current_stock / avg_daily) if avg_daily > 0 else float("inf")
        days_left_low, days_left_high = self._days_left_interval(current_stock, daily_low, daily_high)

        buffer_days = DEFAULT_BUFFER_DAYS + (TREND_BUMP_DAYS if trend == "increasing" else 0)

        safety, demand_lt, target_stock = self._reorder_policy(
            avg_daily=avg_daily,
            daily_low=daily_low,
            daily_high=daily_high,
            lead_time_days=int(product.get("lead_time_days", 0) or 0),
            buffer_days=buffer_days,
            service_level=self.service_level,
        )
        reorder_qty = max(0, int(round(target_stock - current_stock)))

        is_critical = (
            current_stock < self.critical_threshold_rules[traffic_level]["min_stock"]
            or days_left_point < (int(product.get("lead_time_days", 0) or 0) + buffer_days)
            or current_stock < float(product.get("min_required", 0) or 0)
        )

        policy = {
            "buffer_days": float(buffer_days),
            "service_level": float(self.service_level),
            "z_score": float(self._z_from_service_level(self.service_level)),
        }

        return {
            **product,
            "current_stock": current_stock,
            "avg_daily_sales": round(avg_daily, 2),
            "sales_trend": trend,
            "traffic_level": traffic_level,
            "estimated_days_left": None if days_left_point == float("inf") else round(days_left_point, 1),
            "estimated_days_left_ci": [None, None] if days_left_point == float("inf") else [round(days_left_low, 1), round(days_left_high, 1)],
            "is_critical": bool(is_critical),
            "stock_value": round(current_stock * float(product.get("price", 0.0) or 0.0), 2),
            "safety_stock": int(round(safety)),
            "lead_time_demand": int(round(demand_lt)),
            "target_stock_level": int(round(target_stock)),
            "reorder_qty_suggestion": reorder_qty,
            "policy": policy,
            "policy_note": f"Buffer {buffer_days} gün, service_level≈{self.service_level:.2f}",
        }

    @staticmethod
    def _safe_daily_band(band: Optional[List[float]], avg_daily: float) -> Tuple[float, float]:
        if not band or len(band) != 2:
            low = max(0.0001, 0.8 * avg_daily)
            high = max(low, 1.2 * avg_daily)
            return low, high
        low, high = float(band[0]), float(band[1])
        low = max(0.0001, low)
        high = max(low, high)
        return low, high

    @staticmethod
    def _days_left_interval(stock: float, daily_low: float, daily_high: float) -> Tuple[float, float]:
        low_days = stock / max(daily_high, 0.0001)  # hızlı tüketim → az gün
        high_days = stock / max(daily_low, 0.0001)  # yavaş tüketim → çok gün
        return low_days, high_days

    @staticmethod
    def _z_from_service_level(p: float) -> float:
        if p >= 0.975:
            return 1.96
        if p >= 0.95:
            return 1.64
        if p >= 0.90:
            return 1.28
        return 1.0

    @staticmethod
    def _reorder_policy(
        *,
        avg_daily: float,
        daily_low: float,
        daily_high: float,
        lead_time_days: int,
        buffer_days: int,
        service_level: float,
    ) -> Tuple[float, float, float]:
        """
        Emniyet stoğu ve hedef stok:
          - LT talebi: avg_daily * lead_time_days
          - Sigma(günlük) ~ (high-low) / (2*1.96)    # ~1σ
          - Emniyet: z * sigma_daily * sqrt(lead_time_days + buffer_days)
          - Hedef stok: LT talebi + emniyet + buffer_days * avg_daily
        """
        sigma_daily = 0.0
        if daily_high > daily_low:
            sigma_daily = max(0.0, (daily_high - daily_low) / (2 * 1.96))
        z = StockAgent._z_from_service_level(service_level)
        horizon = max(1.0, float(lead_time_days + buffer_days))
        safety = z * sigma_daily * (horizon ** 0.5)
        demand_lt = max(0.0, avg_daily) * max(0.0, float(lead_time_days))
        target = demand_lt + safety + buffer_days * max(0.0, avg_daily)
        return safety, demand_lt, target

    def _determine_traffic_level(self, sales_rate: float) -> Literal["high", "medium", "low"]:
        if sales_rate >= self.critical_threshold_rules["high"]["sales_threshold"]:
            return "high"
        if sales_rate >= self.critical_threshold_rules["medium"]["sales_threshold"]:
            return "medium"
        return "low"

    # -------- Raporlama --------
    async def generate_report(
        self,
        analysis_result: Dict[str, Any],
        format: Literal["text", "json", "ai"] = "text",
    ) -> Union[str, Dict[str, Any]]:
        if format == "json":
            return analysis_result
        if format == "ai":
            return await self._generate_ai_report(analysis_result)
        return self._format_text_report(analysis_result)

    async def _generate_ai_report(self, analysis: Dict[str, Any]) -> str:
        if self.llm is None:
            raise RuntimeError("LLM not configured for StockAgent. Provide `llm` in constructor.")
        prompt = (
            f"Stok Analiz Raporu\n"
            f"Mağaza: {analysis['store_id']}\n"
            f"Toplam Stok Değeri: ${analysis.get('total_value', 0):,.2f}\n"
            f"Kritik Ürün Sayısı: {len(analysis.get('critical_products', []))}\n\n"
            f"Görev:\n"
            f"1) Kritik ürünler için tedarikçi, adet ve gerekçe içeren acil sipariş listesi oluştur.\n"
            f"2) Satış trendine göre stok seviyelerini optimize edecek 3 aksiyon öner.\n"
            f"3) 1 haftalık tükenme riski olanları vurgula.\n"
            f"Kısa, uygulanabilir maddelerle yaz."
        )
        resp = await self.llm.generate_content_async(prompt)
        return getattr(resp, "text", str(resp))

    def _format_text_report(self, analysis: Dict[str, Any]) -> str:
        now_text = datetime.now(tz=IST_TZ).strftime("%d.%m.%Y %H:%M")
        lines = [
            f"📅 Rapor Tarihi: {now_text}",
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
            ci = p.get("estimated_days_left_ci") or ["?", "?"]
            eta = p.get("estimated_days_left")
            eta_txt = "∞" if eta is None else f"{eta}"
            lines.append(
                f"- {p.get('name','?')} ({p.get('product_id','?')}) | "
                f"Stok: {p.get('current_stock','?')} | "
                f"ETA: {eta_txt} gün (≈ {ci[0]}–{ci[1]}) | "
                f"Önerilen Sipariş: {p.get('reorder_qty_suggestion',0)} | "
                f"Tedarikçi: {p.get('supplier','-')}"
            )
        return "\n".join(lines)

    # -------- API yüzeyi: async ve sync --------
    async def arun(
        self,
        store_id: str,
        product_id: int | str | None = None,
        format: Literal["json", "text", "ai"] = "json",
    ) -> Union[Dict[str, Any], str]:
        analysis = await self.analyze_stock(store_id=store_id)

        # Toplu analiz
        if product_id is None:
            result_all: Dict[str, Any] = {"status": "ok", **analysis}
            result_all["critical_stock"] = analysis.get("critical_products", [])
            if format == "json":
                return result_all
            if format == "text":
                return self._format_text_report(analysis)
            if format == "ai":
                return await self._generate_ai_report(analysis)
            return result_all

        # Tekil ürün
        norm_id = _normalize_product_id(product_id)
        found = next((p for p in analysis.get("products", []) if p.get("product_id") == norm_id), None)
        if found:
            out_product = dict(found)
            out_product["product_id"] = _denormalize_product_id(found.get("product_id"))
            return {
                "status": "ok",
                "store_id": store_id,
                "product": out_product,
                "is_critical": bool(out_product.get("is_critical", False)),
            }

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
    ) -> Union[Dict[str, Any], str]:
        """Senkron sarmalayıcı."""
        try:
            asyncio.get_running_loop()
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
                fut = ex.submit(lambda: asyncio.run(self.arun(store_id, product_id, format)))
                return fut.result()
        except RuntimeError:
            return asyncio.run(self.arun(store_id, product_id=product_id, format=format))
