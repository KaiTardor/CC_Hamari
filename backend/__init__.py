from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_pymongo import PyMongo

from .config import Config
from .logging import setup_logging
from .utils.index import *

# Inicializamos PyMongo global
mongo = PyMongo()


def _normalize_api_path(path: str) -> tuple[str, bool]:
    """Remueve prefijos /api duplicados para soportar proxies que lo repiten."""
    prefix = "/api"
    if not path.startswith(prefix):
        return path, False

    remainder = path[len(prefix) :]
    changed = False
    while remainder.startswith(prefix):
        remainder = remainder[len(prefix) :]
        changed = True

    return prefix + remainder, changed


def create_app():
    """
    Crea e inicializa la app Flask principal
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializar logging (loguru)
    setup_logging(app)

    # CORS para permitir peticiones desde frontend React
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Inicializar MongoDB
    mongo.init_app(app)
    app.mongo = mongo
    index(mongo)

    @app.before_request
    def _dedupe_api_prefix():
        path = request.environ.get("PATH_INFO", "")
        new_path, changed = _normalize_api_path(path)
        if changed:
            request.environ["PATH_INFO"] = new_path
            app.logger.warning(
                "Ruta con prefijo duplicado detectada: %s -> %s", path, new_path
            )

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

    return app
