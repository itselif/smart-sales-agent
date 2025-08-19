# core/services/report_service.py
from __future__ import annotations
import os, os.path
from typing import Dict
from core.agents.report_agent import ReportAgent
from infrastructure.external.mindbricks import MindbricksClient

class ReportService:
    def __init__(self, agent: ReportAgent, mb: MindbricksClient | None = None, *, public_mount_prefix="/reports", report_dir: str = ""):
        self.agent = agent
        self.mb = mb
        self.use_mb = os.getenv("USE_MINDBRICKS_REPORTING", "1") == "1"
        self.mb_path = os.getenv("MINDBRICKS_REPORT_BUILD_PATH", "/report/build")
        # 🔧 Doğru subdomain
        self.mb_service = os.getenv("MINDBRICKS_REPORT_SERVICE", "reporting")

        self.public_mount_prefix = public_mount_prefix
        self.report_dir = report_dir

    async def build(self, store_id: str, request: str) -> Dict:
        if self.use_mb and self.mb:
            try:
                res = await self.mb.get_json(self.mb_service, self.mb_path, params={"store_id": store_id, "request": request})
                if "public_url" in res or "url" in res:
                    if "url" in res and "public_url" not in res:
                        res["public_url"] = res["url"]
                    return res
                if "path" in res:
                    fname = os.path.basename(res["path"])
                    res["public_url"] = f"{self.public_mount_prefix}/{fname}"
                    res["download_url"] = f"/report/download?name={fname}"
                return res
            except Exception:
                # 🔁 Fallback: Mindbricks başarısızsa lokal üret
                pass

        result = await self.agent.build_report(store_id, request, None, None, prefer_pdf=True)
        fname = os.path.basename(result["path"])
        result["public_url"] = f"{self.public_mount_prefix}/{fname}"
        result["download_url"] = f"/report/download?name={fname}"
        return result
