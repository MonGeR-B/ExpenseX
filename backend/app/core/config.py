import os
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "ExpenseX API"
    API_V1_PREFIX: str = "/api"

    # Secrets (Explicitly using os.environ.get as requested, though BaseSettings also reads env)
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "")
    DIRECT_URL: str | None = os.environ.get("DIRECT_URL")
    API_KEY: str | None = os.environ.get("API_KEY")
    
    JWT_SECRET_KEY: str = os.environ.get("JWT_SECRET_KEY", "changeme") # Fallback for dev, but should be env
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 1 day

    # Email
    MAIL_USERNAME: str = os.environ.get("EMAIL_USER") or os.environ.get("MAIL_USERNAME") or "baibhabghosh2003@gmail.com"
    MAIL_PASSWORD: str = os.environ.get("EMAIL_PASS") or os.environ.get("MAIL_PASSWORD") or "aucx tmla yizu ubhm"
    MAIL_FROM: str = os.environ.get("MAIL_FROM", "baibhabghosh2003@gmail.com")
    MAIL_PORT: int = int(os.environ.get("MAIL_PORT", 587))
    MAIL_SERVER: str = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()