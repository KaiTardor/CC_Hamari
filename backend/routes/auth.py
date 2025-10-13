from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import check_password_hash
from ..utils.jwt import *

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/login")
def login():
    """Inicia sesión y devuelve un JWT.
    Espera un JSON en el body con `username` y `password`.
    """
    # Obtener los datos 
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"error": "Usuario y contraseña requeridos"}), 400

    db = current_app.mongo.db
    user = db.users.find_one({"username": username})
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 401

    if not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Contraseña incorrecta"}), 401

    # Construir el payload mínimo 
    token = create_jwt({
        "sub": str(user["_id"]),
        "username": user["username"],
        "role": user["role"],
        "ref_dni": user.get("ref_dni")
    })

    return jsonify({
        "token": token,
        "user": {
            "username": user["username"],
            "role": user["role"],
            "ref_dni": user.get("ref_dni"),
            "display_name": user.get("display_name", user["username"])
        }
    })

@auth_bp.get("/me")
def me():
    """Devuelve el usuario y rol si el token es válido."""
    auth = request.headers.get("Authorization", "")
    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        payload = decode_jwt(parts[1])
        if payload:
            return jsonify({
                "user": {
                    "username": payload.get("username"),
                    "role": payload.get("role"),
                    "ref_dni": payload.get("ref_dni"),
                }
            })
    return jsonify({"error": "No autorizado"}), 401
