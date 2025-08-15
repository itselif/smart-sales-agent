# api/plugin_loader.py
from __future__ import annotations
import importlib.util
import inspect
from pathlib import Path
from typing import Iterable, Optional, List, Tuple
from fastapi import FastAPI, Depends
from fastapi.routing import APIRouter

def _iter_python_files(root: Path) -> Iterable[Path]:
    for p in root.rglob("*.py"):
        # __pycache__ / migrations / tests vb. gerekirse filtrelenebilir
        if any(part in {"__pycache__", "tests", "migrations"} for part in p.parts):
            continue
        yield p

def _import_module_from_path(module_name: str, file_path: Path):
    spec = importlib.util.spec_from_file_location(module_name, str(file_path))
    if spec and spec.loader:
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)  # type: ignore
        return mod
    return None

def mount_service_routers(
    app: FastAPI,
    *,
    base_dir: str = "modules",
    url_prefix: str = "/ms",
    dependencies: Optional[List] = None,
) -> List[Tuple[str, str]]:
    """
    modules/<service>/**.py içinden APIRouter örneklerini bulur ve
    app'e /ms/<service> prefix'i ile mount eder.
    dependencies param'ı verilirse tüm plugin router'lara eklenir.
    return: [(service_name, file_relpath)]
    """
    mounted: List[Tuple[str, str]] = []
    base = Path(base_dir)
    if not base.exists():
        return mounted

    for service_dir in sorted([d for d in base.iterdir() if d.is_dir()]):
        service = service_dir.name
        src = (service_dir / "src")
        if not src.exists():
            # bazılarında src yoksa direkt servis kökünden tara
            src = service_dir

        for i, pyfile in enumerate(_iter_python_files(src)):
            module_name = f"vendor_{service}_{i}"
            try:
                mod = _import_module_from_path(module_name, pyfile)
                if not mod:
                    continue
                # mod içindeki APIRouter örneklerini ara (değişken ya da fonksiyon döndürüyor olabilir)
                for name, val in vars(mod).items():
                    if isinstance(val, APIRouter):
                        prefix = f"{url_prefix}/{service}"
                        app.include_router(
                            val,
                            prefix=prefix,
                            dependencies=dependencies or [],
                        )
                        mounted.append((service, str(pyfile.relative_to(service_dir))))
                        # aynı dosyada birden fazla router varsa hepsini mount etmeye devam et
                # router üretici fonksiyonlar için (get_router(), build_router() vs.)
                for name, fun in inspect.getmembers(mod, inspect.isfunction):
                    if name in {"get_router", "build_router", "create_router"}:
                        try:
                            r = fun()
                            if isinstance(r, APIRouter):
                                prefix = f"{url_prefix}/{service}"
                                app.include_router(r, prefix=prefix, dependencies=dependencies or [])
                                mounted.append((service, str(pyfile.relative_to(service_dir))))
                        except Exception:
                            continue
            except Exception:
                # import başarısızsa sessiz geç; loglamak istersen burada yap
                continue
    return mounted
