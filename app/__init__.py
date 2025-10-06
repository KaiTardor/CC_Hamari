from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from app.config import Config

mongo = PyMongo()

def create_app():
    # inicializa Flask
    app = Flask(__name__)    
    app.config.from_object(Config)

    # Inicializar extensiones
    mongo.init_app(app)
    CORS(app)  # Permitir peticiones desde el frontend

    # Blueprints
    from .routes.health import health_bp
    app.register_blueprint(health_bp, url_prefix="/api/health")

    from .routes.offers import offers_bp
    app.register_blueprint(offers_bp, url_prefix="/api/offers")

    from .routes.providers import providers_bp
    app.register_blueprint(providers_bp, url_prefix="/api/providers")

    from .routes.bookings import bookings_bp
    app.register_blueprint(bookings_bp, url_prefix="/api/bookings")

    return app
