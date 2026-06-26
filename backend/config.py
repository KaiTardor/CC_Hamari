import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/HamariDB")

    JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")

    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

    try:
        JWT_TTL_SECONDS = int(os.getenv("JWT_TTL_SECONDS", str(24 * 3600)))
    except ValueError:
        JWT_TTL_SECONDS = 24 * 3600

    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS", "https://hamari-frontend.onrender.com"
        ).split(",")
        if origin.strip()
    ]

    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

    FLASK_HOST = os.getenv("FLASK_HOST", "0.0.0.0")

    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "false").strip().lower() in {
        "1",
        "true",
        "yes",
    }

    # Puerto del flask
    try:
        FLASK_PORT = int(os.getenv("FLASK_PORT", "5000"))
    except ValueError:
        FLASK_PORT = 5000
