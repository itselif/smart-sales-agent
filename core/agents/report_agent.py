from __future__ import annotations

import os, json, math, base64, mimetypes
from typing import Dict, Any, Optional, Tuple, List, Protocol
from datetime import datetime
from zoneinfo import ZoneInfo
from uuid import uuid4

from jinja2 import Environment, BaseLoader, select_autoescape

# === Matplotlib (headless) ===
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# === Opsiyonel PDF motorları ===
try:
    from weasyprint import HTML  # type: ignore
    _WEASY_OK = True
except Exception:
    _WEASY_OK = False

try:
    import pdfkit  # type: ignore
    _PDFKIT_OK = True
except Exception:
    _PDFKIT_OK = False

# === Opsiyonel JSON Schema ===
try:
    import jsonschema  # type: ignore
    _JSONSCHEMA_OK = True
except Exception:
    _JSONSCHEMA_OK = False

IST_TZ = ZoneInfo("Europe/Istanbul")


# ---- Opsiyonel LLM sözleşmesi (DI) ----
class LLMClientProtocol(Protocol):
    async def generate_content_async(self, prompt: str | List[Dict[str, Any]]) -> Any: ...


class ReportAgent:
    """
    Rapor üretici:
      plan    : kullanıcı isteği + satış/stok -> (opsiyonel LLM) JSON spec
      validate/repair: şemaya göre doğrula; hatalıysa (opsiyonel LLM) ile onar
      enrich  : KPI ve kritik tablolarını otomatik tamamla
      render  : grafik üret, HTML oluştur
      export  : PDF (WeasyPrint/pdfkit) ya da HTML
    """

    # ---- JSON şema: LLM/spec bununla eşleşmeli ----
    _SPEC_SCHEMA: Dict[str, Any] = {
        "type": "object",
        "required": ["title", "kpis", "blocks"],
        "properties": {
            "title": {"type": "string"},
            "kpis": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["label", "value"],
                    "properties": {
                        "label": {"type": "string"},
                        "value": {"type": ["string", "number"]},
                    },
                    "additionalProperties": False,
                },
            },
            "blocks": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["type", "title"],
                    "properties": {
                        "type": {"type": "string", "enum": ["chart", "table", "text"]},
                        "title": {"type": "string"},
                        "chart_type": {"type": "string", "enum": ["line", "bar", "pie"]},
                        "x": {"type": "array"},
                        "y": {"type": "array"},
                        "caption": {"type": ["string", "null"]},
                        "headers": {
                            "type": "array",
                            "items": {"type": ["string", "number"]},
                            "minItems": 1,
                        },
                        "rows": {
                            "type": "array",
                            "items": {
                                "type": "array",
                                "items": {"type": ["string", "number", "array", "object", "null"]},
                            },
                        },
                        "text": {"type": "string"},
                        "image_path": {"type": ["string", "null"]},
                    },
                    "additionalProperties": True,
                },
            },
        },
        "additionalProperties": True,
    }

    def __init__(self, output_dir: str = "/tmp", *, llm: Optional[LLMClientProtocol] = None):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.llm = llm

        self.env = Environment(
            loader=BaseLoader(),
            autoescape=select_autoescape(["html", "xml"]),
            trim_blocks=True,
            lstrip_blocks=True,
        )

        # Minimal HTML iskeleti
        self._BASE_TEMPLATE = """
<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>{{ title }}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; }
    h1,h2 { margin: 0 0 8px 0; }
    .meta { color: #555; font-size: 0.9rem; margin-bottom: 24px; }
    .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit,minmax(260px,1fr)); }
    .card { border: 1px solid #eee; padding: 12px; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
    .section { margin: 24px 0; }
    .img { margin: 12px 0; }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; font-size: 0.95rem; }
    th, td { border: 1px solid #eee; padding: 8px; text-align: left; }
    th { background: #fafafa; position: sticky; top: 0; z-index: 1; }
    tbody tr:nth-child(odd) { background: #fcfcfc; }
    .kpi { font-size: 1.2rem; font-weight: 600; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; }
  </style>
</head>
<body>
  <h1>{{ title }}</h1>
  <div class="meta">
    Mağaza: <b>{{ store_id }}</b> • Rapor Tarihi: {{ report_dt }}
  </div>

  {% if kpis %}
  <div class="grid">
    {% for k in kpis %}
      <div class="card">
        <div>{{ k.label }}</div>
        <div class="kpi">{{ k.value }}</div>
      </div>
    {% endfor %}
  </div>
  {% endif %}

  {% for block in blocks %}
    <div class="section">
      <h2>{{ block.title }}</h2>

      {% if block.type == "chart" %}
        {% if block.image_path %}
        <div class="img">
          <img src="{{ block.image_path }}" />
        </div>
        {% endif %}
        {% if block.caption %}<div>{{ block.caption }}</div>{% endif %}
      {% elif block.type == "table" %}
        <table>
          <thead><tr>{% for h in block.headers %}<th>{{ h }}</th>{% endfor %}</tr></thead>
          <tbody>
            {% for row in block.rows %}
            <tr>{% for cell in row %}<td>{{ cell }}</td>{% endfor %}</tr>
            {% endfor %}
          </tbody>
        </table>
      {% elif block.type == "text" %}
        <div>{{ block.text }}</div>
      {% endif %}
    </div>
  {% endfor %}
</body>
</html>
        """.strip()

    # ------------------------------------------------------------------
    # ADAPTERS: domain sonuçlarını LLM için sadeleştir
    # ------------------------------------------------------------------
    def _adapt_sales_for_llm(self, sales: dict) -> dict:
        prods = sales.get("products", []) or []
        trend = sales.get("trend_analysis") or {}
        weekly = (trend.get("weekly_pattern") or {})
        return {
            "totalRevenue": round(sum(p.get("total_revenue", 0.0) for p in prods), 2),
            "totalUnits": int(sum(p.get("total_sold", 0) for p in prods)),
            "topSellers": [
                {
                    "productId": p["product_id"],
                    "name": p.get("product_name"),
                    "units": int(p.get("total_sold", 0)),
                    "revenue": round(p.get("total_revenue", 0.0), 2),
                    "weeklyTrend": float(p.get("weekly_trend", 0.0)),
                    "forecastNext7": int((p.get("sales_forecast") or {}).get("next_7days", 0)),
                }
                for p in sorted(prods, key=lambda x: x.get("total_revenue", 0.0), reverse=True)[:5]
            ],
            "weeklyPattern": weekly,  # {"Mon": 12, ...}
        }

    def _adapt_stock_for_llm(self, stock: dict) -> dict:
        snaps = []
        for p in stock.get("products", []) or []:
            snaps.append({
                "productId": p["product_id"],
                "name": p.get("name"),
                "onHand": int(p.get("current_stock", 0)),
                "avgDailySales": float(p.get("avg_daily_sales", 0.0) or 0.0),
                "estimatedDaysToZero": p.get("estimated_days_left"),
                "estimatedDaysCI": p.get("estimated_days_left_ci"),
                "reorderQty": p.get("reorder_qty_suggestion"),
                "safetyStock": p.get("safety_stock"),
                "leadTime": p.get("lead_time_days"),
                "trend": p.get("sales_trend"),
                "isCritical": bool(p.get("is_critical", False)),
            })
        return {
            "total_value": round(float(stock.get("total_value", 0.0)), 2),
            "snapshots": snaps,
        }

    # ------------------------------------------------------------------
    # PLAN → PRODUCE → VALIDATE/REPAIR → ENRICH → RENDER
    # ------------------------------------------------------------------
    async def build_report(
        self,
        store_id: str,
        user_request: str,
        sales: Optional[Dict],
        stock: Optional[Dict],
        prefer_pdf: bool = True,
    ) -> Dict[str, Any]:
        """Tek uç nokta: spec üret, zenginleştir, render et, PDF/HTML döndür."""
        # 1) Plan & Produce
        spec = await self.design_spec(user_request, store_id, sales, stock)

        # 2) Validate (ve gerekirse onar)
        ok, spec = await self._validate_and_repair(spec, user_request, store_id, sales, stock)

        # 3) Enrich
        spec = self._enrich_spec(spec, store_id, sales, stock)

        # 4) Render + Export
        html = self.render(store_id=store_id, spec=spec)
        fmt, path, html_path, pdf_path = self.to_pdf_or_html(html, prefer_pdf=prefer_pdf)
        return {"format": fmt, "path": path, "html_path": html_path, "pdf_path": pdf_path, "spec": spec}

    # -------------------- DESIGN --------------------
    async def design_spec(
        self, user_request: str, store_id: str, sales: Optional[Dict], stock: Optional[Dict]
    ) -> Dict[str, Any]:
        sales_json = json.dumps(self._adapt_sales_for_llm(sales or {}), ensure_ascii=False)
        stock_json = json.dumps(self._adapt_stock_for_llm(stock or {}), ensure_ascii=False)

        # LLM varsa onu kullan; yoksa deterministik minimal spec üret
        if self.llm is None:
            # Minimal tablo + varsa haftalık pattern grafiği
            sal = json.loads(sales_json)
            stk = json.loads(stock_json)
            blocks: List[Dict[str, Any]] = []
            weekly = sal.get("weeklyPattern") or {}
            if weekly:
                x = list(weekly.keys())
                y = [float(weekly[k]) for k in x]
                blocks.append({"type": "chart", "title": "Haftalık Talep Deseni", "chart_type": "bar", "x": x, "y": y, "caption": "Günlere göre toplam adet"})
            # kritik tablo
            crit_rows = [
                [
                    snap.get("name") or snap.get("productId"),
                    snap.get("onHand"),
                    snap.get("avgDailySales"),
                    snap.get("estimatedDaysToZero"),
                    (snap.get("estimatedDaysCI") or ["-", "-"]),
                    snap.get("reorderQty"),
                ]
                for snap in (stk.get("snapshots") or [])
                if snap.get("isCritical")
            ]
            if crit_rows:
                blocks.append({
                    "type": "table",
                    "title": "Kritik Stoklar",
                    "headers": ["Ürün", "Stok", "Günlük Ortalama", "ETA", "ETA CI", "Önerilen Sipariş"],
                    "rows": crit_rows
                })

            return {
                "title": "Satış & Stok Raporu",
                "kpis": [],
                "blocks": blocks
            }

        system = (
            "You are a report layout designer for e-commerce analytics. "
            "Return ONLY a strict JSON object matching the provided schema. "
            "No markdown fences, no commentary."
        )
        schema_hint = json.dumps(self._SPEC_SCHEMA, ensure_ascii=False)
        prompt = f"""
Kullanıcı isteği: {user_request}
Mağaza: {store_id}

Satış verisi (JSON):
{sales_json}

Stok verisi (JSON):
{stock_json}

Kurallar:
- Sadece geçerli JSON döndür.
- Şema (jsonschema):
{schema_hint}
- KPI'ları kısa tut (örn. Toplam Ciro, Toplam Adet, Toplam Stok Değeri, Kritik Ürün Sayısı).
- Veri yoksa blok oluşturma.
- 1 adet zaman serisi/haftalık desen grafiği, 1 adet tablo ekle (top ürünler veya kritik stoklar).
"""
        resp = await self.llm.generate_content_async(
            [{"role": "system", "parts": [system]}, {"role": "user", "parts": [prompt]}]
        )
        raw = self._strip_code_fence(getattr(resp, "text", str(resp)))
        return json.loads(raw)

    # -------------------- VALIDATE & REPAIR --------------------
    async def _validate_and_repair(
        self,
        spec: Dict[str, Any],
        user_request: str,
        store_id: str,
        sales: Optional[Dict],
        stock: Optional[Dict],
    ) -> Tuple[bool, Dict[str, Any]]:
        def _valid_min(spec_obj: Dict[str, Any]) -> bool:
            return isinstance(spec_obj, dict) and all(k in spec_obj for k in ("title", "kpis", "blocks"))

        # jsonschema varsa kullan
        if _JSONSCHEMA_OK:
            try:
                jsonschema.validate(spec, self._SPEC_SCHEMA)  # type: ignore
                return True, spec
            except Exception:
                pass
        else:
            if _valid_min(spec):
                return True, spec

        # LLM yoksa: minimal onarım
        if self.llm is None:
            fixed = {"title": spec.get("title") or "Satış & Stok Raporu", "kpis": spec.get("kpis") or [], "blocks": spec.get("blocks") or []}
            return True, fixed

        # LLM ile onar
        sales_json = json.dumps(self._adapt_sales_for_llm(sales or {}), ensure_ascii=False)
        stock_json = json.dumps(self._adapt_stock_for_llm(stock or {}), ensure_ascii=False)
        schema_hint = json.dumps(self._SPEC_SCHEMA, ensure_ascii=False)
        prompt = f"""
Aşağıdaki spec hatalı veya eksik. Şu şemaya uyan bir JSON'a ONAR:
Şema:
{schema_hint}

Hatalı spec:
{json.dumps(spec, ensure_ascii=False)}

Bağlam (özet satış/stok):
{sales_json}
{stock_json}

Kurallar:
- Sadece geçerli JSON döndür.
- Başlık, en az 1 tablo veya 1 grafik ve birkaç KPI bulunsun.
"""
        resp = await self.llm.generate_content_async([{"role": "user", "parts": [prompt]}])
        raw = self._strip_code_fence(getattr(resp, "text", str(resp)))
        fixed = json.loads(raw)

        if _JSONSCHEMA_OK:
            jsonschema.validate(fixed, self._SPEC_SCHEMA)  # type: ignore
        return True, fixed

    # -------------------- ENRICH --------------------
    def _enrich_spec(self, spec: Dict[str, Any], store_id: str, sales: Optional[Dict], stock: Optional[Dict]) -> Dict[str, Any]:
        spec = dict(spec or {})
        spec.setdefault("title", "Satış & Stok Raporu")
        spec.setdefault("kpis", [])
        spec.setdefault("blocks", [])

        sal = self._adapt_sales_for_llm(sales or {})
        stk = self._adapt_stock_for_llm(stock or {})

        def _has_kpi(label: str) -> bool:
            return any(k.get("label") == label for k in spec["kpis"])

        if sal.get("totalRevenue") is not None and not _has_kpi("Toplam Ciro"):
            spec["kpis"].append({"label": "Toplam Ciro", "value": sal["totalRevenue"]})
        if sal.get("totalUnits") is not None and not _has_kpi("Toplam Satış Adedi"):
            spec["kpis"].append({"label": "Toplam Satış Adedi", "value": sal["totalUnits"]})
        if stk.get("total_value") is not None and not _has_kpi("Toplam Stok Değeri"):
            spec["kpis"].append({"label": "Toplam Stok Değeri", "value": stk["total_value"]})
        crit_count = sum(1 for s in stk.get("snapshots", []) if s.get("isCritical"))
        if not _has_kpi("Kritik Ürün"):
            spec["kpis"].append({"label": "Kritik Ürün", "value": crit_count})

        # Kritik tablo yoksa ekle
        has_crit_table = any(b.get("type") == "table" and "Kritik" in (b.get("title", "")) for b in spec["blocks"])
        if not (has_rit_table := has_crit_table):
            crit_rows = [
                [
                    snap.get("name") or snap["productId"],
                    snap.get("onHand"),
                    snap.get("avgDailySales"),
                    snap.get("estimatedDaysToZero"),
                    (snap.get("estimatedDaysCI") or ["-", "-"]),
                    snap.get("reorderQty"),
                ]
                for snap in stk.get("snapshots", [])
                if snap.get("isCritical")
            ]
            if crit_rows:
                spec["blocks"].append({
                    "type": "table",
                    "title": "Kritik Stoklar",
                    "headers": ["Ürün", "Stok", "Günlük Ortalama", "ETA", "ETA CI", "Önerilen Sipariş"],
                    "rows": crit_rows
                })

        # Grafik yoksa ve weeklyPattern varsa bar grafiği ekle
        has_chart = any(b.get("type") == "chart" for b in spec["blocks"])
        weekly = sal.get("weeklyPattern") or {}
        if not has_chart and weekly:
            x = list(weekly.keys())
            y = [float(weekly[k]) for k in x]
            spec["blocks"].append({
                "type": "chart", "title": "Haftalık Talep Deseni", "chart_type": "bar",
                "x": x, "y": y, "caption": "Günlere göre toplam adet"
            })

        return spec

    # -------------------- RENDER --------------------
    def render(self, store_id: str, spec: Dict[str, Any]) -> str:
        blocks_out: List[Dict[str, Any]] = []
        for b in spec.get("blocks", []):
            if b.get("type") == "chart":
                img_path = self._render_chart(b)
                img_src = self._img_to_data_uri(img_path) if img_path else None
                blocks_out.append({
                    "type": "chart",
                    "title": b.get("title", "Grafik"),
                    "image_path": img_src,
                    "caption": b.get("caption", "")
                })
            elif b.get("type") == "table":
                blocks_out.append({
                    "type": "table",
                    "title": b.get("title", "Tablo"),
                    "headers": b.get("headers", []),
                    "rows": b.get("rows", [])
                })
            elif b.get("type") == "text":
                blocks_out.append({
                    "type": "text",
                    "title": b.get("title", "Bilgi"),
                    "text": b.get("text", "")
                })

        tmpl = self.env.from_string(self._BASE_TEMPLATE)
        html = tmpl.render(
            title=spec.get("title", "Rapor"),
            store_id=store_id,
            report_dt=datetime.now(tz=IST_TZ).strftime("%d.%m.%Y %H:%M"),
            kpis=spec.get("kpis", []),
            blocks=blocks_out
        )
        return html

    def _render_chart(self, block: Dict[str, Any]) -> Optional[str]:
        chart_type = (block.get("chart_type") or "line").lower()
        x = block.get("x") or []
        y = block.get("y") or []
        if not x or not y or len(x) != len(y):
            return None

        fname = f"chart_{uuid4().hex}.png"
        path = os.path.join(self.output_dir, fname)

        plt.figure()
        try:
            if chart_type == "bar":
                plt.bar(x, y)
            elif chart_type == "pie":
                plt.pie(y, labels=x, autopct="%1.1f%%")
            else:
                plt.plot(x, y, marker="o")

            plt.title(block.get("title", "Grafik"))
            if chart_type != "pie":
                plt.xticks(rotation=45, ha="right")
                plt.tight_layout()
            plt.savefig(path, dpi=140)
        finally:
            plt.close()
        return path

    def _img_to_data_uri(self, path: str) -> Optional[str]:
        if not path or not os.path.exists(path):
            return None
        mime = mimetypes.guess_type(path)[0] or "image/png"
        with open(path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("ascii")
        return f"data:{mime};base64,{b64}"

    # -------------------- OUTPUT --------------------
    def to_pdf_or_html(self, html: str, prefer_pdf: bool = True) -> Tuple[str, str, Optional[str], Optional[str]]:
        base = os.path.join(self.output_dir, f"llm_report_{uuid4().hex}")
        pdf_path = f"{base}.pdf"
        html_path = f"{base}.html"

        # Önce her zaman HTML kaydet (önizleme için)
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html)

        if prefer_pdf:
            # 1) WeasyPrint
            if _WEASY_OK:
                try:
                    HTML(string=html, base_url=self.output_dir).write_pdf(pdf_path)  # type: ignore
                    return "pdf", pdf_path, html_path, pdf_path
                except Exception:
                    pass
            # 2) pdfkit + wkhtmltopdf
            if _PDFKIT_OK:
                try:
                    wkhtml = os.getenv("WKHTMLTOPDF_PATH")
                    config = pdfkit.configuration(wkhtmltopdf=wkhtml) if wkhtml else None  # type: ignore
                    options = {"enable-local-file-access": ""}  # yerel img erişimi için
                    pdfkit.from_string(html, pdf_path, options=options, configuration=config)  # type: ignore
                    return "pdf", pdf_path, html_path, pdf_path
                except Exception:
                    pass

        # 3) Fallback: HTML
        return "html", html_path, html_path, None

    # -------------------- Yardımcı --------------------
    def _strip_code_fence(self, raw: Optional[str]) -> str:
        s = (raw or "").strip()
        if s.startswith("```"):
            parts = s.split("```")
            if len(parts) >= 3:
                s = parts[1]
            else:
                s = s.strip("`")
        s = s.strip()
        if s.lower().startswith("json"):
            s = s[4:].lstrip(": \n")
        return s
