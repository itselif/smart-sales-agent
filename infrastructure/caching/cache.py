# infrastructure/caching/cache.py
from __future__ import annotations
import os, json, time
from typing import Any, Optional

try:
    # pip install redis>=5
    from redis import asyncio as aioredis  # type: ignore
except Exception:
    aioredis = None


class BaseCache:
    async def get_json(self, key: str) -> Optional[dict]:
        raise NotImplementedError

    async def set_json(self, key: str, value: Any, ttl: int) -> None:
        raise NotImplementedError


class InMemoryCache(BaseCache):
    def __init__(self):
        # key -> (expire_ts | None, value)
        self._store: dict[str, tuple[Optional[float], Any]] = {}

    async def get_json(self, key: str) -> Optional[dict]:
        item = self._store.get(key)
        if not item:
            return None
        exp, val = item
        if exp and time.time() > exp:
            self._store.pop(key, None)
            return None
        return val

    async def set_json(self, key: str, value: Any, ttl: int) -> None:
        exp = time.time() + ttl if ttl else None
        self._store[key] = (exp, value)


class RedisCache(BaseCache):
    def __init__(self, url: str):
        if not aioredis:
            raise RuntimeError("redis-py missing. Run: pip install redis>=5")
        self.client = aioredis.from_url(url, decode_responses=True)

    async def get_json(self, key: str) -> Optional[dict]:
        s = await self.client.get(key)
        return json.loads(s) if s else None

    async def set_json(self, key: str, value: Any, ttl: int) -> None:
        s = json.dumps(value, ensure_ascii=False)
        await self.client.set(key, s, ex=ttl)


def make_cache() -> BaseCache:
    """
    REDIS_URL varsa RedisCache, yoksa InMemoryCache döndürür.
    Örn: REDIS_URL=redis://localhost:6379/0
    """
    url = os.getenv("REDIS_URL")
    if url and aioredis:
        return RedisCache(url)
    return InMemoryCache()
