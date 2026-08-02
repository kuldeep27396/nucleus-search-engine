from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App General Settings
    APP_NAME: str = "Nucleus Enterprise AI Search Engine"
    ENV: str = "production"
    DEBUG: bool = False

    # Database & Vector DB
    DATABASE_URL: str = "postgresql+asyncpg://nucleus:nucleus_secret@localhost:5432/nucleus_db"

    # Redis Queue
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_STREAM_NAME: str = "nucleus:ingest_stream"

    # BYO-LLM Settings (Customer's OpenAI Key / LiteLLM Proxy Endpoint)
    LLM_BASE_URL: str = "https://api.openai.com/v1"
    LLM_API_KEY: str = "sk-demo-key-change-me"
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_TEMPERATURE: float = 0.0

    # Pluggable Embedding Pipeline
    EMBEDDING_PROVIDER: str = "local"  # local | openai
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384

    # Control Plane Ed25519 Verification Key (Public Key PEM string)
    ED25519_PUBLIC_KEY_PEM: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
