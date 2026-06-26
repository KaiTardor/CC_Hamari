import os
import time
from typing import Dict, Optional

import jwt


def _jwt_secret() -> str:
    return os.getenv("JWT_SECRET", "dev-secret-change-me")


def _jwt_alg() -> str:
    return os.getenv("JWT_ALGORITHM", "HS256")


def _jwt_ttl_seconds() -> int:
    try:
        return int(os.getenv("JWT_TTL_SECONDS", str(24 * 3600)))
    except ValueError:
        return 24 * 3600


def create_jwt(payload: Dict) -> str:
    """
    Crear un JWT firmado con un payload personalizado.
    """
    now = int(time.time())
    to_encode = {
        "iat": now,
        "exp": now + _jwt_ttl_seconds(),
        **payload,
    }
    return jwt.encode(to_encode, _jwt_secret(), algorithm=_jwt_alg())


def decode_jwt(token: str) -> Optional[Dict]:
    """Decodifica y verifica un token JWT.

    Retorna el payload (dict) si el token es válido, o None en caso de error
    """
    try:
        return jwt.decode(token, _jwt_secret(), algorithms=[_jwt_alg()])
    except jwt.PyJWTError:
        return None
