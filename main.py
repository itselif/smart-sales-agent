from fastapi import FastAPI
from api.routes import router

app = FastAPI(
    title="Smart Sales AI",
    description="Multi-agent AI system for sales intelligence",
    version="0.1.0"
)

app.include_router(router)
