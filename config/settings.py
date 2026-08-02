from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # Database
    database_url: str = Field(..., env="DATABASE_URL")
    # Redis
    redis_url: str = Field(..., env="REDIS_URL")
    # LLM / embedding model
    embedding_model: str = Field(default="sentence-transformers/all-MiniLM-L6-v2")
    # License server public key (for JWT verification)
    license_public_key_path: str = Field(default="license_server/public_key.pem")
    # Other settings can be added as needed

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
