# infrastructure/external/mindbricks.py
from __future__ import annotations
import os
import httpx
from typing import Any, Dict, Optional

DEFAULT_SUFFIX = "-api-salesai1.prw.mindbricks.com"


class MindbricksClient:
    """
    Örnek:
      client = MindbricksClient()
      data = await client.get_json(
          "inventorymanagement", "/inventoryitems",
          params={"storeId": "...", "limit": 200}
      )
    URL = https://inventorymanagement-api-salesai1.prw.mindbricks.com/inventoryitems?storeId=...
    """

    def __init__(
        self,
        *,
        api_suffix: Optional[str] = None,
        timeout: float = 15.0,
        verify: Optional[bool] = None,
        retries: int = 2,
    ) -> None:
        suffix_env = (os.getenv("MINDBRICKS_SUFFIX", DEFAULT_SUFFIX) or "").strip()
        # env'e yanlışlıkla başı '-'sız yazıldıysa koru:
        if suffix_env and not suffix_env.startswith("-"):
            suffix_env = "-" + suffix_env

        self.api_suffix = api_suffix or (suffix_env or DEFAULT_SUFFIX)

        # Token → env değişkeninden (service token > api key)
        self.token = (
            os.getenv("MINDBRICKS_SERVICE_TOKEN")
            or os.getenv("MINDBRICKS_API_KEY")
            or ""
        )

        self.timeout = timeout
        self.verify = verify
        self.retries = max(0, int(retries))
        self.debug = os.getenv("MB_DEBUG", "0") == "1"

    # -------------------- iç yardımcılar --------------------

    def _build_url(self, service: str, path: str) -> str:
        if not path.startswith("/"):
            path = "/" + path
        base = f"https://{service}{self.api_suffix}"
        return base + path

    def _headers(self) -> Dict[str, str]:
        headers: Dict[str, str] = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    # -------------------- public API --------------------

    async def get_json(
        self,
        service: str,
        path: str,
        *,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Basit GET shortcut (retry + parsing)"""
        url = self._build_url(service, path)
        last_exc: Optional[Exception] = None
        params = params or {}
        headers = self._headers()

        for attempt in range(self.retries + 1):
            try:
                if self.debug:
                    print(f"[MB] → GET {url} params={params} headers={{'Authorization':'Bearer ****'}} try={attempt+1}")

                async with httpx.AsyncClient(timeout=self.timeout, verify=self.verify) as cli:
                    r = await cli.get(url, params=params, headers=headers)

                if self.debug:
                    print(f"[MB] ← {r.status_code} from {url}")

                if r.status_code in (401, 403):
                    snippet = r.text[:400]
                    raise RuntimeError(f"Mindbricks auth error ({r.status_code}) on {url}: {snippet}")

                # 5xx ise retry uygula
                if r.status_code >= 500 and attempt < self.retries:
                    continue

                r.raise_for_status()

                try:
                    return r.json()
                except Exception:
                    text = r.text[:500]
                    raise RuntimeError(f"Mindbricks JSON parse failed ({r.status_code}) on {url}: {text}")

            except Exception as e:
                last_exc = e

        raise RuntimeError(f"Mindbricks request failed: {url} ({last_exc})")

    async def request_json(
        self,
        service: str,
        path: str,
        *,
        method: str = "GET",
        params: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Genel amaçlı istek. JSON body gerekiyorsa `json=` kullan.
        Form-encoded gerekiyorsa `data=` kullan.
        """
        url = self._build_url(service, path)
        headers = self._headers()
        params = params or {}

        if self.debug:
            dbg_body = json if json is not None else data
            print(f"[MB] → {method.upper()} {url} params={params} body={dbg_body} headers={{'Authorization':'Bearer ****'}}")

        async with httpx.AsyncClient(timeout=self.timeout, verify=self.verify) as cli:
            m = method.upper()
            if m == "POST":
                r = await cli.post(url, params=params, json=json, data=data, headers=headers)
            elif m == "PUT":
                r = await cli.put(url, params=params, json=json, data=data, headers=headers)
            elif m == "PATCH":
                r = await cli.patch(url, params=params, json=json, data=data, headers=headers)
            elif m == "DELETE":
                r = await cli.delete(url, params=params, headers=headers)
            else:
                r = await cli.get(url, params=params, headers=headers)

        if self.debug:
            print(f"[MB] ← {r.status_code} from {url}")

        if r.status_code in (401, 403):
            raise RuntimeError(f"Mindbricks auth error ({r.status_code}) on {url}: {r.text[:400]}")

        r.raise_for_status()
        try:
            return r.json()
        except Exception:
            return {"status": r.status_code, "text": r.text}
