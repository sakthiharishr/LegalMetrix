import os
from typing import List

class Settings:
    PROJECT_NAME: str = "LEGAL METRIX Enforcement Backend"
    API_V1_STR: str = "/api/v1"
    
    # Secret key for JWT encoding/decoding
    SECRET_KEY: str = os.getenv("SECRET_KEY", "legalmetrix-sih2026-super-secure-enforcement-key-9941")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS Origins - allows React Vite frontend on port 3000 and standard 5173
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    
    # SQLite default database path (zero setup required for local dev, switchable to MySQL/Postgres)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./legalmetrix.db")
    
    # Storage directory for uploaded images
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

