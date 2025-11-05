import sys
import uuid
import logging
import time
from pathlib import Path

# Try to import loguru; if not available, provide a lightweight shim that
try:
    from loguru import logger
    _LOGURU_AVAILABLE = True
except Exception:
    _LOGURU_AVAILABLE = False

from flask import g, request


# Helpers para construir un resumen legible de la petición
def _short_params(req):
    try:
        params = {}
        for k, v in req.args.items():
            lk = k.lower()
            if lk in ("password", "token", "authorization"):
                params[k] = "[REDACTED]"
            else:
                val = v if len(v) <= 40 else v[:37] + "..."
                params[k] = val
        if not params:
            return ""
        pairs = [f"{k}={v}" for k, v in list(params.items())[:4]]
        return "?" + "&".join(pairs)
    except Exception:
        return ""


def _short_body_summary(req):
    try:
        js = req.get_json(silent=True)
        if not isinstance(js, dict):
            return ""
        out = []
        for i, (k, v) in enumerate(js.items()):
            if i >= 3:
                break
            lk = k.lower()
            if lk in ("password", "token", "authorization"):
                out.append(f"{k}=[REDACTED]")
            else:
                sval = str(v)
                sval = sval if len(sval) <= 30 else sval[:27] + "..."
                out.append(f"{k}={sval}")
        return "(" + ", ".join(out) + ")" if out else ""
    except Exception:
        return ""


if not _LOGURU_AVAILABLE:
    std_logger = logging.getLogger("app")
    std_logger.setLevel(logging.INFO)

    class _LoggerShim:
        def __init__(self, logger):
            self._logger = logger

        def remove(self):
            return

        def add(self, *args, **kwargs):
            # emulate adding a handler; accept stdout (file-like) or filename
            stream_or_path = args[0] if args else None
            fmt = kwargs.get("format") if isinstance(kwargs, dict) else None
            if isinstance(stream_or_path, str):
                # treat as file path
                handler = logging.FileHandler(stream_or_path, encoding=kwargs.get("encoding", None))
            else:
                # treat as stream (None -> stdout)
                handler = logging.StreamHandler(stream_or_path if stream_or_path is not None else sys.stdout)
            if fmt:
                try:
                    handler.setFormatter(logging.Formatter("%(message)s"))
                except Exception:
                    pass
            self._logger.addHandler(handler)
            return handler

        def bind(self, **extra):
            # return self — no structured extra support in shim
            return self

        def log(self, level, message):
            try:
                self._logger.log(level, message)
            except Exception:
                self._logger.info(message)

        def info(self, message):
            self._logger.info(message)

    logger = _LoggerShim(std_logger)


def setup_logging(app=None, level="INFO"):
    """Configura loguru y redirige el logging estándar.

    Si se pasa una app Flask, configura hooks para añadir request_id y un log por petición.
    """
    logger.remove()

    # Console (stdout) handler with request_id in extra
    # Consola: usar exactamente el mismo formato que el fichero de logs (sin color)
    common_format = "{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {extra[request_summary]} | {message}"
    logger.add(
        sys.stdout,
        level=level,
        colorize=False,
        format=common_format,
    )

    Path("logs").mkdir(parents=True, exist_ok=True)

    # File handler with rotation
    logger.add(
        "logs/app_{time:YYYY-MM-DD}.log",
        rotation="1 day",
        retention="7 days",
        level=level,
        encoding="utf-8",
        # Evitar imprimir el diccionario 'extra' completo y el request_id al principio.
        format=common_format,
    )

    class InterceptHandler(logging.Handler):
        def emit(self, record):
            # Use record.levelno (int) to log via loguru; include exception info if present
            try:
                if record.exc_info:
                    logger.opt(exception=record.exc_info).log(record.levelno, record.getMessage())
                else:
                    logger.log(record.levelno, record.getMessage())
            except Exception:
                # Fallback to info if something unexpected happens
                logger.info(record.getMessage())

    logging.basicConfig(handlers=[InterceptHandler()], level=getattr(logging, level))

    # Flask integration: bind request_id and provide request logger
    if app is not None:
        @app.before_request
        def _bind_request_summary_and_id():
            # request id
            rid = request.headers.get("X-Request-ID") or str(uuid.uuid4())
            g.request_id = rid
            g._start_time = time.time()

            # build a short human-readable summary
            method = request.method
            path = request.path
            params = _short_params(request)
            body = _short_body_summary(request)

            # try to obtain user id if set previously by auth middleware
            user_id = getattr(g, "user_id", None)
            if not user_id:
                user = getattr(g, "user", None)
                try:
                    user_id = getattr(user, "id", None)
                except Exception:
                    user_id = None
            user_part = f" user_id={user_id}" if user_id else ""

            endpoint = request.endpoint or ""
            if endpoint:
                summary = f"{method} {endpoint} {params} {body}{user_part}".strip()
            else:
                summary = f"{method} {path}{params} {body}{user_part}".strip()

            summary = " ".join(summary.split())
            if len(summary) > 120:
                summary = summary[:117] + "..."

            g.request_summary = summary
            g.logger = logger.bind(request_id=rid, request_summary=summary)

        @app.after_request
        def _log_request(response):
            try:
                lg = getattr(g, "logger", logger)
                # Registrar solo un mensaje conciso en español: método, ruta y código.
                # No incluimos duración, remote_addr ni params para evitar duplicidad y exceso de datos.
                lg.info(f"Petición {request.method} {request.path} -> {response.status_code}")
            except Exception:
                logger.exception("Error registrando la petición")
            return response

        from werkzeug.exceptions import HTTPException

        @app.errorhandler(Exception)
        def _handle_exception(e):
            """
            Manejador global de excepciones.
            - Para HTTPException (404, 400, ...) registramos una entrada ligera (warning)
              sin traceback y devolvemos la excepción para que Flask genere la respuesta.
            - Para otras excepciones inesperadas, registramos la traza completa (error)
              para facilitar el debug y devolvemos la excepción (Flask retornará 500).
            """
            try:
                lg = getattr(g, "logger", logger)
                if isinstance(e, HTTPException):
                    # No registrar traceback completo para errores HTTP esperados
                    lg.warning(f"Excepción HTTP durante la petición: {e.code} {e.name} - {e.description}")
                    return e
                else:
                    lg.exception("Excepción no controlada durante la petición")
                    return e
            except Exception:
                logger.exception("Excepción no controlada (fallback)")
                return e


def get_logger():
    """Devuelve el logger ligado al request si existe, o el logger global."""
    try:
        from flask import has_request_context

        if has_request_context():
            return getattr(g, "logger", logger)
    except Exception:
        pass
    return logger
