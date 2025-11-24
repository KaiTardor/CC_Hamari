from functools import wraps

from flask import jsonify, request

from .jwt import decode_jwt


def current_user():
    """Extrae el usuario actual del header Authorization.

    Espera el header 'Authorization: Bearer <token>'. Devuelve un dict con
    username, role y ref_dni si el token es válido, o None si no hay token/ inválido.
    """
    auth = request.headers.get("Authorization", "")
    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        payload = decode_jwt(parts[1])
        if payload:
            # Normalizar la forma en que representamos al usuario en la app
            return {
                "username": payload.get("username"),
                "role": payload.get("role"),
                "ref_dni": payload.get("ref_dni"),
            }
    return None


def require_roles(*roles):
    """Decorador de rutas para exigir roles.

    Uso: @require_roles("client", "staff") — permite esos roles + admin.
    """

    def deco(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = current_user()
            if not user:
                return jsonify({"error": "No autenticado"}), 401
            # admin tiene acceso global
            if user["role"] != "admin" and roles and user["role"] not in roles:
                return jsonify({"error": "No autorizado"}), 403
            request.user = user
            return fn(*args, **kwargs)

        return wrapper

    return deco
