# core/agents/report_agent.py
from __future__ import annotations

import os, json
from typing import Dict, Any, Optional, Tuple, List
from datetime import datetime
from zoneinfo import ZoneInfo

from jinja2 import Environment, BaseLoader, select_autoescape

# Grafikler
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# Opsiyonel PDF
_WEASY_OK = True
try:
    from weasyprint import HTML  # type: ignore
except Exception:
    _WEASY_OK = False

# İstersen Google Gemini yerine OpenAI/başka LLM bağlayabilirsin:
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
IST_TZ = ZoneInfo("Europe/Istanbul")


class ReportAgent:
    """
    LLM tabanlı rapor tasarımcısı + deterministik renderer.
    Akış:
      1) design_spec(sales, stock, user_request) -> JSON şema (LLM)
      2) render(spec) -> grafik üret + HTML
      3) pdf(html) -> PDF (weasyprint varsa), yoksa HTML fallback
    """

    def __init__(self, output_dir: str = "/tmp"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

        # LLM (opsiyonel)
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")
        self.llm = None
        if api_key:
            genai.configure(api_key=api_key)
            # Model ismi ihtiyacına göre değişebilir
            self.llm = genai.GenerativeModel("gemini-1.5-pro")

        self.env = Environment(
            loader=BaseLoader(),
            autoescape=select_autoescape(["html", "xml"]),
            trim_blocks=True,
            lstrip_blocks=True,
        )

        # Minimal HTML iskeleti: İçeriği şemadan dolduracağız
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
    table { border-collapse: collapse; width: 100%; font-size: 0.95rem; }
    th, td { border: 1px solid #eee; padding: 8px; text-align: left; }
    th { background: #fafafa; }
    .kpi { font-size: 1.2rem; font-weight: 600; }
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
        <div class="img">
          <img src="file://{{ block.image_path }}" width="900" />
        </div>
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

    # -------------------- 1) LLM: DESIGN --------------------

    async def design_spec(self, user_request: str, store_id: str, sales: Optional[Dict], stock: Optional[Dict]) -> Dict[str, Any]:
        """
        LLM'den, rapor layout'unu ve içerik bloklarını JSON olarak ister.
        ŞEMA:
        {
          "title": str,
          "kpis": [{"label": str, "value": str}, ...],
          "blocks": [
            {"type":"chart","title": str, "chart_type":"line|bar|pie", "x": [...], "y": [...], "caption": str},
            {"type":"table","title": str, "headers":[...], "rows":[[...], ...]},
            {"type":"text","title": str, "text": str}
          ]
        }
        """
        # LLM yoksa basit default şema
        if not self.llm:
            return self._fallback_spec(user_request, store_id, sales, stock)

        sales_json = json.dumps(sales or {}, ensure_ascii=False)
        stock_json = json.dumps(stock or {}, ensure_ascii=False)

        system = (
            "You are a report layout designer for e-commerce analytics. "
            "Design a JSON report spec. Do NOT include markdown fences. "
            "Only return JSON."
        )
        prompt = f"""
Kullanıcı isteği: {user_request}
Mağaza: {store_id}

Satış verisi (JSON):
{sales_json}

Stok verisi (JSON):
{stock_json}

Kurallar:
- Sadece geçerli JSON döndür.
- Şema:
{{
  "title": "string",
  "kpis": [{{"label":"string","value":"string"}}],
  "blocks": [
    {{"type":"chart","title":"string","chart_type":"line|bar|pie","x":[...],"y":[...],"caption":"string"}},
    {{"type":"table","title":"string","headers":[...],"rows":[[...],...]}},
    {{"type":"text","title":"string","text":"string"}}
  ]
}}
- Grafiklerde 'x' ekseni kategoriler/tarihler olabilir, 'y' sayısal değerler.
- Veri yoksa blok oluşturma.
- KPI'ları kısa tut (ör. Toplam Ciro, Toplam Adet, Toplam Stok Değeri).
"""
        try:
            resp = await self.llm.generate_content_async([{"role":"system","parts":[system]},{"role":"user","parts":[prompt]}])
            raw = resp.text.strip()
            # bazen ```json blokları gelebilir
            if raw.startswith("```"):
                raw = raw.strip("`")
                if raw.lower().startswith("json"):
                    raw = raw[4:].strip()
            spec = json.loads(raw)
            return spec
        except Exception:
            # bozulursa fallback
            return self._fallback_spec(user_request, store_id, sales, stock)

    def _fallback_spec(self, user_request: str, store_id: str, sales: Optional[Dict], stock: Optional[Dict]) -> Dict[str, Any]:
        # Minimal güvenli şablon
        kpis = []
        if sales and sales.get("totalRevenue") is not None:
            kpis.append({"label":"Toplam Ciro","value": f"{sales['totalRevenue']}"})
        if sales and sales.get("totalUnits") is not None:
            kpis.append({"label":"Toplam Satış Adedi","value": f"{sales['totalUnits']}"})
        if stock and stock.get("total_value") is not None:
            kpis.append({"label":"Toplam Stok Değeri","value": f"{stock['total_value']}"})

        blocks: List[Dict[str, Any]] = []

        if sales and sales.get("trendByDay"):
            x = [d["date"] for d in sales["trendByDay"]]
            y = [float(d["revenue"]) for d in sales["trendByDay"]]
            blocks.append({
                "type":"chart","title":"Günlük Ciro","chart_type":"line",
                "x": x, "y": y, "caption":"Satış trendi"
            })
        if sales and sales.get("topSellers"):
            headers = ["Ürün","Adet","Ciro"]
            rows = [[p.get("name",p["productId"]), p["units"], p["revenue"]] for p in sales["topSellers"]]
            blocks.append({"type":"table","title":"Top 5 Ürün","headers":headers,"rows":rows})

        return {"title":"Satış & Stok Raporu","kpis":kpis,"blocks":blocks}

    # -------------------- 2) RENDER: charts + html --------------------

    def render(self, store_id: str, spec: Dict[str, Any]) -> str:
        """
        Spec'e göre grafik üret + HTML üret.
        Chart bloklarında image_path'leri doldurup HTML'e basar.
        """
        blocks_out: List[Dict[str, Any]] = []
        for b in spec.get("blocks", []):
            if b.get("type") == "chart":
                img = self._render_chart(b)
                blocks_out.append({
                    "type":"chart",
                    "title": b.get("title","Grafik"),
                    "image_path": img,
                    "caption": b.get("caption","")
                })
            elif b.get("type") == "table":
                blocks_out.append({
                    "type":"table",
                    "title": b.get("title","Tablo"),
                    "headers": b.get("headers",[]),
                    "rows": b.get("rows",[])
                })
            elif b.get("type") == "text":
                blocks_out.append({
                    "type": "text",
                    "title": b.get("title","Bilgi"),
                    "text": b.get("text","")
                })

        tmpl = self.env.from_string(self._BASE_TEMPLATE)
        html = tmpl.render(
            title=spec.get("title","Rapor"),
            store_id=store_id,
            report_dt=datetime.now(tz=IST_TZ).strftime("%d.%m.%Y %H:%M"),
            kpis=spec.get("kpis",[]),
            blocks=blocks_out
        )
        return html

    def _render_chart(self, block: Dict[str, Any]) -> Optional[str]:
        """
        chart_type: line|bar|pie
        x: kategori/tarih listesi
        y: sayısal liste
        """
        chart_type = (block.get("chart_type") or "line").lower()
        x = block.get("x") or []
        y = block.get("y") or []
        if not x or not y or len(x) != len(y):
            return None

        # dosya adı
        fname = f"chart_{abs(hash(json.dumps([x,y], ensure_ascii=False)))}.png"
        path = os.path.join(self.output_dir, fname)

        plt.figure()
        if chart_type == "bar":
            plt.bar(x, y)
        elif chart_type == "pie":
            # pie için x etiket, y değer
            plt.pie(y, labels=x, autopct="%1.1f%%")
        else:
            plt.plot(x, y, marker="o")

        plt.title(block.get("title","Grafik"))
        if chart_type != "pie":
            plt.xticks(rotation=45, ha="right")
            plt.tight_layout()
        plt.savefig(path, dpi=140)
        plt.close()
        return path

    # -------------------- 3) PDF/HTML çıktı --------------------


    def to_pdf_or_html(self, html: str, prefer_pdf: bool = True) -> Tuple[str, str]:
        import os
        base = os.path.join(self.output_dir, "llm_report")
        pdf_path = f"{base}.pdf"
        html_path = f"{base}.html"

        if prefer_pdf:
            # 1) WeasyPrint (varsa)
            try:
                from weasyprint import HTML  # type: ignore
                HTML(string=html).write_pdf(pdf_path)
                return "pdf", pdf_path
            except Exception:
                pass
            # 2) pdfkit + wkhtmltopdf
            try:
                import pdfkit  # type: ignore
                wkhtml = os.getenv("WKHTMLTOPDF_PATH")  # C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe
                if wkhtml:
                    config = pdfkit.configuration(wkhtmltopdf=wkhtml)
                    pdfkit.from_string(html, pdf_path, configuration=config)
                else:
                    pdfkit.from_string(html, pdf_path)  # PATH'teyse bu yeterli
                return "pdf", pdf_path
            except Exception:
                pass

        # 3) Fallback: HTML kaydet
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html)
        return "html", html_path
