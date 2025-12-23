from functools import wraps

from flask import jsonify, request, g

from .jwt import decode_jwt


def current_user():
    """Extrae el usuario actual del header Authorization.

    Espera 'Authorization: Bearer <token>'.
    Devuelve dict {username, role, ref_dni} si es válido, o None.
    """
    auth = request.headers.get("Authorization", "")
    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        payload = decode_jwt(parts[1])
        if payload:
            return {
                "username": payload.get("username"),
                "role": payload.get("role"),
                "ref_dni": payload.get("ref_dni"),
            }
    return None


def require_auth(fn):
    """Requiere estar autenticado (cualquier rol)."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = current_user()
        if not user:
            return jsonify({"error": "No autenticado"}), 401
        # Guardar en g (estándar en Flask)
        g.user = user
        # Mantengo compatibilidad si ya usas request.user en algún sitio
        request.user = user
        return fn(*args, **kwargs)
    return wrapper


def require_roles(*roles):
    """Exige roles concretos (admin siempre pasa).
    Uso: @require_roles("client","staff") => permite esos roles + admin.
    Si no pasas roles, equivale a require_auth.
    """
    def deco(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = current_user()
            if not user:
                return jsonify({"error": "No autenticado"}), 401

            if roles and user["role"] != "admin" and user["role"] not in roles:
                return jsonify({"error": "No autorizado"}), 403

            g.user = user
            request.user = user
            return fn(*args, **kwargs)
        return wrapper
    return deco


def require_self_or_admin(dni_arg_name: str = "dni"):
    """
    Permite acceso si:
    - el usuario es admin, o
    - el usuario está editando su propio recurso (ref_dni == dni de la URL)

    dni_arg_name: nombre del parámetro de la ruta (por defecto 'dni')
    Ej: @route("/<dni>") => dni_arg_name="dni"
    """
    def deco(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = current_user()
            if not user:
                return jsonify({"error": "No autenticado"}), 401

            g.user = user
            request.user = user

            # Admin puede todo
            if user["role"] == "admin":
                return fn(*args, **kwargs)

            target_dni = kwargs.get(dni_arg_name)
            if not target_dni:
                return jsonify({"error": "DNI de destino no especificado"}), 400

            if user.get("ref_dni") != target_dni:
                return jsonify({"error": "No autorizado"}), 403

            return fn(*args, **kwargs)
        return wrapper
    return deco
