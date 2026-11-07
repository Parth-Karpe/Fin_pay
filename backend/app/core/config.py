import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "FinPay - Student Digital Wallet"
    API_V1_STR: str = "/api/v1"
    
    # Simple DB: SQLite by default, configurable to PostgreSQL via DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./finpay.db")
    
    # JWT Authentication
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "finpay-secure-jwt-secret-key-student-wallet-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours
    
    # Unresolved Business Policies (Handled Safely as Configurable Policies)
    # Q3: Negative Wallet Balance Policy (Default True: balance cannot drop below zero)
    ENFORCE_NON_NEGATIVE_BALANCE: bool = os.getenv("ENFORCE_NON_NEGATIVE_BALANCE", "true").lower() in ("true", "1", "yes")
    
    # Q1: Cashback Policy (Pending approval - disabled by default to avoid arbitrary values)
    CASHBACK_ENABLED: bool = os.getenv("CASHBACK_ENABLED", "false").lower() in ("true", "1", "yes")
    
    # Server configuration
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

settings = Settings()
