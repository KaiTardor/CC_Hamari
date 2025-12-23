from flask import Flask, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo

from .config import Config
from .logging import setup_logging
from .utils.index import *

# Inicializamos PyMongo global
mongo = PyMongo()


def create_app():
    """
    Crea e inicializa la app Flask principal
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializar logging (loguru)
    setup_logging(app)

    # CORS para permitir peticiones desde el frontend en Render
    CORS(
        app,
        resources={r"/api/*": {"origins": ["https://hamari-frontend.onrender.com"]}},
        supports_credentials=False
    )

    # Forzar cabeceras CORS en todas las respuestas (incluye OPTIONS)
    @app.after_request
    def add_cors_headers(response):
        response.headers.add(
            "Access-Control-Allow-Origin",
            "https://hamari-frontend.onrender.com"
        )
        response.headers.add(
            "Access-Control-Allow-Headers",
            "Content-Type,Authorization"
        )
        response.headers.add(
            "Access-Control-Allow-Methods",
            "GET,POST,PUT,DELETE,OPTIONS"
        )
        return response

    # Inicializar MongoDB
    mongo.init_app(app)
    app.mongo = mongo
    index(mongo)

    # Importar y registrar Blueprints
    from .routes.auth import auth_bp
    from .routes.bookings import bookings_bp
    from .routes.clients import clients_bp
    from .routes.offers import offers_bp
    from .routes.providers import providers_bp
    from .routes.staff import staff_bp

    app.register_blueprint(offers_bp, url_prefix="/api/offers")
    app.register_blueprint(bookings_bp, url_prefix="/api/bookings")
    app.register_blueprint(clients_bp, url_prefix="/api/clients")
    app.register_blueprint(providers_bp, url_prefix="/api/providers")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(staff_bp, url_prefix="/api/staff")

    # Ruta raíz para verificar que el backend funciona
    @app.route("/")
    def home():
        return jsonify({"message": "API de Turismo activa y conectada"}), 200

    # Health check para Render
    @app.get("/health")
    def health():
        return jsonify({"ok": True}), 200

    return app
