import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/HamariDB")

    FLASK_HOST = os.getenv("FLASK_HOST", "0.0.0.0")

    # Puerto del flask
    try:
        FLASK_PORT = int(os.getenv("FLASK_PORT", "5000"))
    except ValueError:
        FLASK_PORT = 5000
