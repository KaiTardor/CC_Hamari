# Fichero generado por ChatGPT :)
import os
import time
from typing import Dict, Optional

import jwt

# Claves/algoritmo y tiempo de expiración por defecto
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALG = "HS256"
JWT_TTL_SECONDS = 24 * 3600  # 1 día


def create_jwt(payload: Dict) -> str:
    """
    Crear un JWT firmado con un payload personalizado.
    """
    now = int(time.time())
    to_encode = {
        "iat": now,
        "exp": now + JWT_TTL_SECONDS,
        **payload,
    }
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALG)


def decode_jwt(token: str) -> Optional[Dict]:
    """Decodifica y verifica un token JWT.

    Retorna el payload (dict) si el token es válido, o None en caso de error
    """
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        return None
