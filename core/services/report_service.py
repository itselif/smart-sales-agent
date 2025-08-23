# core/services/report_service.py
from __future__ import annotations
import os
import os.path as osp
from typing import Optional, Dict, Any

from core.agents.report_agent import ReportAgent
from infrastructure.external.mindbricks import MindbricksClient


class ReportService:
    def __init__(
        self,
        agent: ReportAgent,
        *,
        mb: Optional[MindbricksClient] = None,
        public_mount_prefix: str = "/reports",
        report_dir: Optional[str] = None,
    ) -> None:
        self.agent = agent
        self.mb = mb
        self.public_mount_prefix = public_mount_prefix
        self.report_dir = report_dir

        # Env
        self.use_mb = (os.getenv("USE_MINDBRICKS_REPORTING", "1") == "1")
        self.svc = os.getenv("MINDBRICKS_REPORT_SERVICE", "reporting")
        self.path = os.getenv("MINDBRICKS_REPORT_BUILD_PATH", "/report/build")
        self.method = (os.getenv("MINDBRICKS_REPORT_METHOD", "GET") or "GET").upper()
        # Mindbricks tarafında çoğunlukla storeId bekleniyor:
        self.store_param = os.getenv("MINDBRICKS_STORE_PARAM", "storeId")

    async def build(self, store_id: str, request: str = "standart rapor") -> Dict[str, Any]:
        """
        1) Mindbricks aktifse oradan rapor üretimini dene
        2) Hata varsa veya MB kapalıysa local fallback üret
        """
        # ---- Mindbricks hattı
        if self.mb and self.use_mb:
            try:
                if self.method == "POST":
                    payload = {self.store_param: store_id, "request": request}
                    res = await self.mb.request_json(self.svc, self.path, method="POST", json=payload)
                else:
                    params = {self.store_param: store_id, "request": request}
                    res = await self.mb.request_json(self.svc, self.path, method="GET", params=params)

                public_url = res.get("public_url") or res.get("url") or res.get("downloadUrl")
                return {
                    "status": "success",
                    "source": "mindbricks",
                    "format": res.get("format", "html"),
                    "public_url": public_url,
                    "path": res.get("path"),
                    "spec": res.get("spec") or {},
                    "raw": res,
                }
            except Exception as e:
                # MB hata verirse local’e düş
                return await self._fallback_local(store_id, request, error=f"MB_ERR: {e}")

        # ---- Local fallback
        return await self._fallback_local(store_id, request)

    async def _fallback_local(self, store_id: str, request: str, error: Optional[str] = None) -> Dict[str, Any]:
        """
        ReportAgent üzerinden yerel rapor üret.
        Agent’ta hangi isim varsa sırasıyla dener:
          - generate()
          - build()
          - build_local()
        """
        out: Dict[str, Any] = {}

        # 1) generate()
        gen = getattr(self.agent, "generate", None)
        if callable(gen):
            out = await gen(store_id=store_id, request=request)
        else:
            # 2) build()
            bld = getattr(self.agent, "build", None)
            if callable(bld):
                out = await bld(store_id=store_id, request=request)
            else:
                # 3) build_local()
                bl = getattr(self.agent, "build_local", None)
                if callable(bl):
                    out = await bl(store_id=store_id, request=request)
                else:
                    # Son çare: minimal dummy çıktı
                    out = {"format": "html", "path": None, "spec": {"note": "no report agent impl"}}

        path = out.get("path") or out.get("file_path")
        fmt = out.get("format", "html")
        pub = None
        if path and self.public_mount_prefix:
            fname = osp.basename(path)
            pub = f"{self.public_mount_prefix}/{fname}"

        return {
            "status": "success",
            "source": "local",
            "format": fmt,
            "public_url": pub,
            "path": path,
            "spec": out.get("spec") or {},
            "error": error,
        }
