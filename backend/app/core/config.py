from __future__ import annotations

from dotenv import load_dotenv
from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Settings(BaseSettings):
    """Configuración centralizada de la aplicación."""

    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_", extra="ignore")

    env: str = Field(default="development", validation_alias=AliasChoices("APP_ENV", "ENV"))

    database_url: str = Field(
        default="postgresql+psycopg://postgres:1234@localhost:5432/universidad",
        validation_alias=AliasChoices("APP_DATABASE_URL", "DATABASE_URL"),
    )

    @field_validator("database_url", mode="after")
    @classmethod
    def _normalize_postgres_driver(cls, value: str) -> str:
        """Usa el driver psycopg3 si la URL viene como postgres:// o postgresql:// (p. ej. Render)."""

        if value.startswith("postgresql+psycopg://"):
            return value
        if value.startswith("postgres://"):
            return "postgresql+psycopg://" + value.removeprefix("postgres://")
        if value.startswith("postgresql://"):
            return "postgresql+psycopg://" + value.removeprefix("postgresql://")
        return value
    api_title: str = "Universidad Digital API"
    api_version: str = "1.0.0"

    jwt_secret: str | None = Field(default=None, validation_alias="APP_JWT_SECRET")
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = Field(default=60, validation_alias="APP_JWT_EXPIRATION")
    cookie_name: str = "access_token"
    cookie_secure: bool = Field(default=False, validation_alias="APP_COOKIE_SECURE")
    cookie_samesite: str = Field(default="lax", validation_alias="APP_COOKIE_SAMESITE")

    cors_origins: list[str] = Field(default_factory=list, validation_alias="APP_CORS_ORIGINS")

    auto_create_tables: bool = True

    # Cloud SQL / Postgres remoto: suele requerir TLS (libpq: sslmode=require).
    database_ssl_mode: str | None = Field(default=None, validation_alias="APP_DATABASE_SSL_MODE")

    @property
    def is_production(self) -> bool:
        return self.env.lower() == "production"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_cors_origins(cls, value: object) -> list[str]:
        if isinstance(value, str):
            items = [item.strip() for item in value.split(",") if item.strip()]
            return items
        if isinstance(value, list):
            return value
        return []


settings = Settings()
