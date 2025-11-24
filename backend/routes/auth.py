from flask import Blueprint, current_app, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from ..utils.jwt import *
from ..utils.utils import is_valid_email, is_valid_phone, normalize_dni

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
    token = create_jwt(
        {
            "sub": str(user["_id"]),
            "username": user["username"],
            "role": user["role"],
            "ref_dni": user.get("ref_dni"),
        }
    )

    return jsonify(
        {
            "token": token,
            "user": {
                "username": user["username"],
                "role": user["role"],
                "ref_dni": user.get("ref_dni"),
                "display_name": user.get("display_name", user["username"]),
            },
        }
    )


@auth_bp.get("/me")
def me():
    """Devuelve el usuario y rol si el token es válido."""
    auth = request.headers.get("Authorization", "")
    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        payload = decode_jwt(parts[1])
        if payload:
            return jsonify(
                {
                    "user": {
                        "username": payload.get("username"),
                        "role": payload.get("role"),
                        "ref_dni": payload.get("ref_dni"),
                    }
                }
            )
    return jsonify({"error": "No autorizado"}), 401


@auth_bp.post("/register")
def register():
    """Registra un nuevo cliente (usuario + entrada en clients).
    Espera: username, password, dni, name, surname, email, phone
    Opcionalmente: sex, birth_date
    """
    data = request.get_json(silent=True) or {}

    # Validar campos obligatorios
    required = ["username", "password", "dni", "name", "surname", "email", "phone"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify(
            {"error": f"Faltan campos obligatorios: {', '.join(missing)}"}
        ), 400

    username = data["username"].strip()
    password = data["password"]
    dni = normalize_dni(data["dni"])
    name = data["name"].strip()
    surname = data["surname"].strip()
    email = data["email"].strip()
    phone = data["phone"].strip()
    sex = data.get("sex", "")
    birth_date = data.get("birth_date", "")

    # Validaciones
    if not is_valid_email(email):
        return jsonify({"error": "Email no válido"}), 400
    if not is_valid_phone(phone):
        return jsonify({"error": "Teléfono no válido"}), 400
    if len(password) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400

    db = current_app.mongo.db

    # Verificar si el username ya existe
    if db.users.find_one({"username": username}):
        return jsonify({"error": "El nombre de usuario ya está en uso"}), 409

    # Verificar si el DNI ya está registrado como cliente
    if db.clients.find_one({"dni": dni}):
        return jsonify({"error": "El DNI ya está registrado"}), 409

    # Crear cliente
    client_doc = {
        "dni": dni,
        "name": name,
        "surname": surname,
        "sex": sex,
        "birth_date": birth_date,
        "email": email,
        "phone": phone,
    }
    db.clients.insert_one(client_doc)

    # Crear usuario
    user_doc = {
        "username": username,
        "password_hash": generate_password_hash(password),
        "role": "client",
        "ref_dni": dni,
    }
    db.users.insert_one(user_doc)

    # Generar token
    token = create_jwt(
        {
            "sub": str(user_doc["_id"]),
            "username": username,
            "role": "client",
            "ref_dni": dni,
        }
    )

    return jsonify(
        {
            "message": "Usuario registrado exitosamente",
            "token": token,
            "user": {"username": username, "role": "client", "ref_dni": dni},
        }
    ), 201


@auth_bp.post("/users/create")
def create_user():
    """Crea un usuario de sistema (admin, provider, staff).
    Solo accesible por administradores.
    Espera: username, password, role, ref_dni (opcional)
    """
    # Aquí deberías verificar que el usuario actual es admin
    # Por ahora lo dejamos abierto para que el admin pueda crear usuarios

    data = request.get_json(silent=True) or {}

    required = ["username", "password", "role"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify(
            {"error": f"Faltan campos obligatorios: {', '.join(missing)}"}
        ), 400

    username = data["username"].strip()
    password = data["password"]
    role = data["role"]
    ref_dni = data.get("ref_dni")

    if role not in ["admin", "provider", "staff", "client"]:
        return jsonify({"error": "Rol no válido"}), 400

    if len(password) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400

    db = current_app.mongo.db

    # Verificar si el username ya existe
    if db.users.find_one({"username": username}):
        return jsonify({"error": "El nombre de usuario ya está en uso"}), 409

    # Crear usuario
    user_doc = {
        "username": username,
        "password_hash": generate_password_hash(password),
        "role": role,
        "ref_dni": ref_dni,
    }
    result = db.users.insert_one(user_doc)

    return jsonify(
        {"message": "Usuario creado exitosamente", "username": username, "role": role}
    ), 201
