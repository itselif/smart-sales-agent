# core/orchestrator.py
from __future__ import annotations
import os, json, asyncio
from typing import Any, Dict, Optional, List, Callable
from dotenv import load_dotenv
load_dotenv()

# ---- Mindbricks client (opsiyonel)
try:
    from infrastructure.external.mindbricks import MindbricksClient  # type: ignore
except Exception:
    MindbricksClient = None  # type: ignore

# ---- Repositories (InMemory ↔ Mindbricks)
try:
    from core.repositories.memory import InMemorySalesRepository, InMemoryStockRepository  # type: ignore
except Exception:
    InMemorySalesRepository = None  # type: ignore
    InMemoryStockRepository = None  # type: ignore

try:
    from core.repositories.mindbricks import MindbricksSalesRepository, MindbricksStockRepository  # type: ignore
except Exception:
    MindbricksSalesRepository = None  # type: ignore
    MindbricksStockRepository = None  # type: ignore

# ---- Agents
from core.agents.sales_agent import SalesAgent
from core.agents.stock_agent  import StockAgent
from core.agents.report_agent import ReportAgent

# ---- Services
from core.services.sales_service  import SalesService
from core.services.stock_service  import StockService
from core.services.report_service import ReportService

# ---- Cache
from infrastructure.caching.cache import make_cache

MB_DEBUG = (os.getenv("MB_DEBUG", "0") == "1")
CACHE_TTL = int(os.getenv("CACHE_TTL_SECONDS", "600"))

# =========================
# Gemini (function-calling)
# =========================
class _Gemini:
    def __init__(self, model: str = "gemini-1.5-pro"):
        import httpx  # type: ignore
        self._api_key = (
            os.getenv("GOOGLE_API_KEY")
            or os.getenv("VITE_GEMINI_API_KEY")
            or os.getenv("GEMINI_API_KEY")
        )
        if not self._api_key:
            print("[WARNING] Gemini API key missing. Using mock responses.")
            self._api_key = "mock_key"
        self._model = os.getenv("GEMINI_MODEL", model)
        self._base  = os.getenv("GEMINI_API_BASE", "https://generativelanguage.googleapis.com/v1")
        self._http  = httpx.AsyncClient(timeout=40.0)
        self._temperature = float(os.getenv("LLM_TEMPERATURE", "0.2"))

    def _tool_declarations(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "sales_analyze",
                "description": "Mağaza satış analizi (ciro, trend, en çok/az satan).",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "store_id": {"type":"STRING"},
                        "days": {"type":"INTEGER", "minimum":1, "maximum":365}
                    },
                    "required": ["store_id"]
                }
            },
            {
                "name": "stock_analysis",
                "description": "Mağaza stok analizi (kritik ürünler, tahmini bitiş).",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "store_id": {"type":"STRING"},
                        "product_id": {"type":"STRING"}
                    },
                    "required": ["store_id"]
                }
            },
            {
                "name": "report_build",
                "description": "Satış + stok verilerinden rapor oluştur.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "store_id": {"type":"STRING"},
                        "format": {"type":"STRING", "enum":["pdf","html"]},
                        "request": {"type":"STRING"}
                    },
                    "required": ["store_id"]
                }
            }
        ]

    def _system_preamble(self) -> str:
        return (
            "Sen perakende analitiği için akıllı bir asistansın. "
            "Kullanıcının doğal dil isteğini anla; gerekiyorsa uygun aracı (fonksiyonu) çağır. "
            "Fonksiyon çağrısı gerekiyorsa yalnızca functionCall üret; gerekmiyorsa doğal dil cevap ver. "
            "Argümanları kullanıcı niyetinden mantıklı şekilde türet. Bağlam eksikse kısa bir soru sorabilirsin."
        )

    async def chat(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        messages: sadece 'user' / 'model' / 'tool' rollerini içersin.
        Dönüş:
          - {"functionCall": {"name":..., "args":{...}}} ya da {"text": "..."}
        """
        # Mock key ise mock response döndür
        if self._api_key == "mock_key":
            user_text = ""
            for msg in messages:
                if msg.get("role") == "user" and msg.get("parts"):
                    for part in msg["parts"]:
                        if "text" in part:
                            user_text += part["text"] + " "
            
            user_text = user_text.lower().strip()
            
            # Basit keyword matching ile function call döndür
            if any(word in user_text for word in ["satış", "ciro", "analiz", "sales"]):
                return {
                    "functionCall": {
                        "name": "sales_analyze",
                        "args": {"store_id": "S1", "days": 7}
                    }
                }
            elif any(word in user_text for word in ["stok", "kritik", "stock", "inventory"]):
                return {
                    "functionCall": {
                        "name": "stock_analysis", 
                        "args": {"store_id": "S1"}
                    }
                }
            elif any(word in user_text for word in ["rapor", "pdf", "report"]):
                return {
                    "functionCall": {
                        "name": "report_build",
                        "args": {"store_id": "S1", "format": "pdf"}
                    }
                }
            else:
                return {"text": "Merhaba! Size nasıl yardımcı olabilirim? Satış analizi, stok durumu veya rapor oluşturma konularında yardımcı olabilirim."}
        
        # Gerçek API çağrısı
        url = f"{self._base}/models/{self._model}:generateContent?key={self._api_key}"
        # System instruction'ı ilk user mesajına ekle (flash model için)
        if messages and messages[0].get("role") == "user":
            system_text = self._system_preamble() + "\n\n"
            messages[0]["parts"][0]["text"] = system_text + messages[0]["parts"][0]["text"]
        
        payload = {
            "contents": messages,
            "generationConfig": {"temperature": self._temperature, "topP": 0.95, "topK": 40, "maxOutputTokens": 512},
        }
        r = await self._http.post(url, json=payload)
        try:
            r.raise_for_status()
        except Exception:
            if MB_DEBUG:
                print("[gemini][chat][status]", r.status_code)
                print("[gemini][chat][resp]", r.text)
            raise
        data = r.json()
        cand  = (data.get("candidates") or [None])[0] or {}
        parts = cand.get("content", {}).get("parts", []) or []
        for p in parts:
            if "functionCall" in p:
                return {"functionCall": p["functionCall"]}
            if "text" in p:
                return {"text": (p["text"] or "").strip()}
        return {"text": ""}

    async def continue_with_function_result(
        self,
        prior_messages: List[Dict[str, Any]],
        function_name: str,
        result: Dict[str, Any]
    ) -> str:
        """
        Function sonucunu modele functionResponse olarak ver ve final doğal dil yanıt al.
        """
        # Mock key ise mock response döndür
        if self._api_key == "mock_key":
            if function_name == "sales_analyze":
                return "Satış analizi tamamlandı. Son 7 günlük veriler analiz edildi ve rapor hazırlandı."
            elif function_name == "stock_analysis":
                return "Stok analizi tamamlandı. Kritik ürünler tespit edildi ve sipariş önerileri hazırlandı."
            elif function_name == "report_build":
                return "Rapor oluşturuldu. PDF formatında rapor hazırlandı ve indirilebilir durumda."
            else:
                return "İşlem başarıyla tamamlandı."
        
        # Gerçek API çağrısı
        url = f"{self._base}/models/{self._model}:generateContent?key={self._api_key}"
        tool_msg = {
            "role": "tool",
            "parts": [{
                "functionResponse": {
                    "name": function_name,
                    "response": {"name": function_name, "content": result}
                }
            }]
        }
        msgs = prior_messages + [tool_msg]
        # System instruction'ı ilk user mesajına ekle (flash model için)
        if msgs and msgs[0].get("role") == "user":
            system_text = self._system_preamble() + "\n\n"
            msgs[0]["parts"][0]["text"] = system_text + msgs[0]["parts"][0]["text"]
        
        payload = {
            "contents": msgs,
            "generationConfig": {"temperature": self._temperature, "topP": 0.95, "topK": 40, "maxOutputTokens": 512},
        }
        r = await self._http.post(url, json=payload)
        try:
            r.raise_for_status()
        except Exception:
            if MB_DEBUG:
                print("[gemini][continue][status]", r.status_code)
                print("[gemini][continue][resp]", r.text)
            raise
        data = r.json()
        cand  = (data.get("candidates") or [None])[0] or {}
        parts = cand.get("content", {}).get("parts", []) or []
        for p in parts:
            if "text" in p:
                return (p["text"] or "").strip()
        return ""

# =========================
# Orchestrator (chatbot-first)
# =========================
class Orchestrator:
    """
    Akış:
      1) LLM'e (function calling) user mesajı + kısa geçmiş verilir
      2) Model functionCall dönerse uygun servisi çalıştır
      3) Sonucu functionResponse ile modele ver, doğal dil final yanıtını al
      4) Aksi halde model text'i olduğu gibi döndür (smalltalk vb)
    """
    def __init__(self) -> None:
        # Cache (opsiyonel)
        try:
            self.cache = make_cache()
        except Exception as e:
            if MB_DEBUG: print(f"[orch] Cache disabled: {e}")
            self.cache = None

        # Data source selection
        use_mb = os.getenv("USE_MINDBRICKS_DATA", "0") == "1"
        self.mb_client = None
        if use_mb and MindbricksClient:
            try:
                self.mb_client = MindbricksClient()
            except Exception as e:
                if MB_DEBUG: print(f"[orch] Mindbricks init failed, fallback InMemory: {e!r}")
                self.mb_client = None
                use_mb = False

        # Repos
        if use_mb and self.mb_client and MindbricksSalesRepository:
            sales_repo = MindbricksSalesRepository(self.mb_client)  # type: ignore
        else:
            sales_repo = InMemorySalesRepository(os.getenv("SALES_JSON_PATH", "data/sales.json")) if InMemorySalesRepository else None  # type: ignore

        if use_mb and self.mb_client and MindbricksStockRepository:
            stock_repo = MindbricksStockRepository(self.mb_client)  # type: ignore
        else:
            stock_repo = InMemoryStockRepository(os.getenv("STOCK_JSON_PATH", "data/stock.json")) if InMemoryStockRepository else None  # type: ignore

        # Agents & Services
        self.sales_agent = SalesAgent(sales_repo=sales_repo)
        self.stock_agent = StockAgent(sales_agent=self.sales_agent, stock_repo=stock_repo)
        self.report_agent = ReportAgent()

        self.sales_svc  = SalesService(self.sales_agent, mb=self.mb_client if use_mb else None)
        self.stock_svc  = StockService(self.stock_agent,   mb=self.mb_client if use_mb else None)
        self.report_svc = ReportService(self.report_agent, mb=self.mb_client if use_mb else None)

        # LLM
        self.llm = _Gemini(model=os.getenv("GEMINI_MODEL", "gemini-1.5-pro"))

        # Chat history (kısa)
        self.history: List[Dict[str, Any]] = []

        # Tool map
        self.tools: Dict[str, Callable[..., Any]] = {
            "sales_analyze": self._exec_sales_analyze,
            "stock_analysis": self._exec_stock_analysis,
            "report_build":   self._exec_report_build,
        }

    # -------------------------
    # Tool impl (cache + soft errors)
    async def _exec_sales_analyze(self, store_id: str, days: Optional[int] = None, **_kwargs) -> Dict[str, Any]:
        key = f"sales:{store_id}:{days or 'all'}"
        if self.cache:
            try:
                cached = await self.cache.get_json(key)
                if cached: return {"cached": True, **cached}
            except Exception as e:
                if MB_DEBUG: print(f"[orch] cache get sales failed: {e!r}")

        try:
            data = await self.sales_svc.analyze(store_id, days=days)
        except Exception as e:
            if MB_DEBUG: print(f"[orch] sales.analyze failed: {e!r}")
            return {"status": "no_data", "products": [], "error_detail": str(e)}

        if self.cache:
            try: await self.cache.set_json(key, data, CACHE_TTL)
            except Exception as e:
                if MB_DEBUG: print(f"[orch] cache set sales failed: {e!r}")
        return {"cached": False, **data}

    async def _exec_stock_analysis(self, store_id: str, product_id: Optional[str] = None, **_kwargs) -> Dict[str, Any]:
        key = f"stock:{store_id}"
        if self.cache:
            try:
                cached = await self.cache.get_json(key)
                if cached: return {"cached": True, **cached}
            except Exception as e:
                if MB_DEBUG: print(f"[orch] cache get stock failed: {e!r}")

        try:
            data = await self.stock_svc.analysis(store_id)
        except Exception as e:
            if MB_DEBUG: print(f"[orch] stock.analysis failed: {e!r}")
            return {"status":"no_data", "products":[], "error_detail": str(e)}

        if product_id and data.get("products"):
            pid = str(product_id).strip().upper()
            for p in data["products"]:
                if str(p.get("product_id","")).upper() == pid:
                    return {"cached": False, "products":[p], "count":1}

        if self.cache:
            try: await self.cache.set_json(key, data, CACHE_TTL)
            except Exception as e:
                if MB_DEBUG: print(f"[orch] cache set stock failed: {e!r}")
        return {"cached": False, **data}

    async def _exec_report_build(self, store_id: str, format: Optional[str] = None, request: Optional[str] = None, **_kwargs) -> Dict[str, Any]:
        try:
            await asyncio.gather(
                self._exec_sales_analyze(store_id),
                self._exec_stock_analysis(store_id)
            )
            rep = await self.report_svc.build(store_id, request or "standart rapor")
            return {
                "format": rep.get("format"),
                "public_url": rep.get("public_url") or rep.get("url"),
                "path": rep.get("path"),
                "spec": rep.get("spec"),
            }
        except Exception as e:
            if MB_DEBUG: print(f"[orch] report.build failed: {e!r}")
            return {"format": None, "public_url": None, "path": None, "spec": None, "status": "error", "error_detail": str(e)}

    # -------------------------
    # Main
    async def run(self, user_query: str, store_id: str, user_request: Optional[str] = None) -> Dict[str, Any]:
        """
        user_request: FE'den rapor için serbest metin talebi gelirse modele değil, doğrudan araca iletiriz (function args'a ekleriz).
        """
        # 1) Gemini ile ilk tur
        msgs: List[Dict[str, Any]] = []
        # kısa geçmiş (yalnızca 'user'/'model' rolleri)
        msgs += [m for m in self.history[-8:] if m.get("role") in ("user","model")]
        # bağlam + kullanıcı mesajı
        msgs.append({"role":"user","parts":[{"text": f"Mağaza: {store_id}"}]})
        msgs.append({"role":"user","parts":[{"text": user_query}]})

        first = await self.llm.chat(msgs)

        # 2) functionCall varsa çalıştır
        if "functionCall" in first:
            fc = first["functionCall"]
            name = fc.get("name")
            args = fc.get("args") or {}
            # Bazı sürümlerde args string döner; güvenli parse
            if isinstance(args, str):
                try:
                    args = json.loads(args)
                except Exception:
                    args = {}
            # store_id yoksa inject
            args.setdefault("store_id", store_id)
            # FE'den rapor özelleştirme geldiyse args'a ekle
            if name == "report_build" and user_request and not args.get("request"):
                args["request"] = user_request

            if MB_DEBUG:
                print("[router][call]", name, "args=", args)

            if name not in self.tools:
                reply = "İsteğini anladım; işlem adı tanınmadı. Tekrar dener misin?"
                intent = "none"
                data = {}
                # geçmişe yaz
                self.history.append({"role":"user","parts":[{"text": user_query}]})
                self.history.append({"role":"model","parts":[{"text": reply}]})
                return {"intent": intent, "data": data, "reply": reply, "meta": {"planner":"gemini-tools","cached": False}}

            # aracı çalıştır
            result = await self.tools[name](**args)

            # 3) functionResponse ile devam → final doğal dil yanıt
            msgs.append({"role":"model","parts":[{"functionCall": {"name": name, "args": args}}]})
            final_text = await self.llm.continue_with_function_result(msgs, name, result)
            reply = final_text or "İşlem tamamlandı."
            intent = name
            data = result

        else:
            # 3) Doğal dil (smalltalk vs.)
            reply = first.get("text") or "Nasıl yardımcı olabilirim?"
            intent = "none"
            data = {}

        # 4) geçmişi güncelle
        self.history.append({"role":"user","parts":[{"text": user_query}]})
        self.history.append({"role":"model","parts":[{"text": reply}]})

        return {
            "intent": intent,
            "data": data,
            "artifacts": {},
            "reply": reply,
            "meta": {"planner":"gemini-tools","cached": bool(data.get("cached")) if isinstance(data, dict) else False},
        }

# FE entry point
async def run_orchestrator(user_query: str, store_id: str, user_request: Optional[str] = None) -> Dict[str, Any]:
    orch = Orchestrator()
    return await orch.run(user_query, store_id, user_request)


# CLI quick demo
if __name__ == "__main__":
    async def _demo():
        out = await run_orchestrator("son 7 gün ciroyu özetler misin?", "S4")
        print(json.dumps(out, ensure_ascii=False, indent=2))
    asyncio.run(_demo())
