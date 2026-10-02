from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    GOOGLE_CLOUD_PROJECT: str = ""
    FIREBASE_PROJECT_ID: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GCS_BUCKET: str = ""
    PUBSUB_TOPIC: str = "moderation-requests"
    BIGQUERY_DATASET: str = "analytics"
    BIGQUERY_TABLE: str = "events"
    FOUNDER_UID: str = ""
    # Comma separated. The web app is served on 3000 by `next dev`, and on
    # 3001/3002 when the port is already taken, so all three are allowed.
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001,http://localhost:3002"
    MAX_AUDIO_MB: int = 10
    RATE_LIMIT_PER_MINUTE: int = 60

    # `class Config` is deprecated in Pydantic v2; ConfigDict is the replacement.
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
