from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List
from pydantic import Field, field_validator
from typing import List, Any

class Settings(BaseSettings):
    supabase_url: str = Field(alias="SUPABASE_URL")
    supabase_service_role_key: str = Field(alias="SUPABASE_SERVICE_ROLE_KEY")
    cors_origins: Any = Field(default=["*"], alias="CORS_ORIGINS", validation_alias="ALLOWED_ORIGINS")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if v.strip() == "*":
                return ["*"]
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    max_upload_size_mb: int = Field(default=5, alias="MAX_UPLOAD_SIZE_MB")
    rate_limit_per_minute: int = Field(default=20, alias="RATE_LIMIT_PER_MINUTE")
    sentry_dsn: str = Field(default="", alias="SENTRY_DSN")

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
