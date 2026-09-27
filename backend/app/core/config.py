from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    TRIAL_DURATION_MINUTES: int = 45
    MENTOR_WORKING_HOURS_START: int = 10 # 10:00 AM
    MENTOR_WORKING_HOURS_END: int = 22 # 10:00 PM
    CORS_ORIGINS: str = "http://localhost:5173"

    SMTP_HOST: str | None = None
    SMTP_PORT: int | None = None
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAIL_FROM: str | None = None
    SMTP_USE_TLS: bool = True

    model_config = {"env_file": ".env"}

settings = Settings()
