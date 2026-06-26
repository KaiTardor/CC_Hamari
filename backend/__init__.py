from flask import Flask, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
import os
from urllib.parse import urlsplit, urlunsplit

from .config import Config
from .logging import setup_logging
from .utils.errors import ApiError
from .utils.index import *

# Inicializamos PyMongo global
mongo = PyMongo()


def _mongo_uri_with_database(uri: str) -> str:
    parsed = urlsplit(uri)
    path = parsed.path if parsed.path and parsed.path != "/" else "/HamariDB"
    query = parsed.query
    if parsed.username and "authSource=" not in query:
        query = f"{query}&authSource=admin" if query else "authSource=admin"
    return urlunsplit((parsed.scheme, parsed.netloc, path, query, parsed.fragment))


def create_app():
    """
    Crea e inicializa la app Flask principal
    """
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config["MONGO_URI"] = _mongo_uri_with_database(
        os.getenv("MONGO_URI", Config.MONGO_URI)
    )

    # Inicializar logging (loguru)
    setup_logging(app, level=Config.LOG_LEVEL)

    # CORS para permitir peticiones desde el frontend en Render
    CORS(
        app,
        resources={r"/api/*": {"origins": Config.CORS_ORIGINS}},
        supports_credentials=False,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    # Inicializar MongoDB
    mongo.init_app(app)
    app.mongo = mongo
    index(mongo)

    @app.errorhandler(ApiError)
    def handle_api_error(error):
        return jsonify({"error": error.message}), error.status_code

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
