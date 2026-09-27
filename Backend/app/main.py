from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .core.config import settings
from .core.database import engine, Base
from .db.init_db import init_db
from .api.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables and seed data exist
    init_db()
    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Legal Metrology Compliance & Enforcement Intelligence System API (PCR 2011)",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# Set CORS middleware with credentials support for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads directory for packaging images
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include the centralized /api/v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health"])
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "OPERATIONAL",
        "framework": "Legal Metrology (Packaged Commodities) Rules, 2011",
        "apiDocs": f"{settings.API_V1_STR}/docs"
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "database": "connected"}

