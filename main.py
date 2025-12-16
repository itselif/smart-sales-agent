from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router, inventory_router
from config.settings import database

app = FastAPI(
    title="Smart Sales AI",
    description="Multi-agent AI system for sales intelligence",
    version="0.1.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(inventory_router)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
