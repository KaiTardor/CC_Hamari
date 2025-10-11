from flask import Flask, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from .config import Config
from .utils.index import *

# Inicializamos PyMongo global
mongo = PyMongo()


def create_app():
    """Crea e inicializa la app Flask principal"""
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS para permitir peticiones desde frontend React
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Inicializar MongoDB
    mongo.init_app(app)
    index(mongo)

    # Importar y registrar Blueprints
    from .routes.offers import offers_bp
    from .routes.bookings import bookings_bp
    from .routes.clients import clients_bp
    from .routes.providers import providers_bp
    from .routes.staff import staff_bp

    app.register_blueprint(offers_bp, url_prefix="/api/offers")
    app.register_blueprint(bookings_bp, url_prefix="/api/bookings")
    app.register_blueprint(clients_bp, url_prefix="/api/clients")
    app.register_blueprint(providers_bp, url_prefix="/api/providers")
    app.register_blueprint(staff_bp, url_prefix="/api/staff")

    # Ruta raíz para verificar que el backend funciona
    @app.route("/")
    def home():
        return jsonify({"message": "API de Turismo activa y conectada"}), 200

    return app
