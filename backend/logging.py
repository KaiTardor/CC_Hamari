import sys
import uuid
import logging
from pathlib import Path

# Try to import loguru; if not available, provide a lightweight shim that
# exposes the small subset of the loguru API that this project uses
try:
    from loguru import logger
    _LOGURU_AVAILABLE = True
except Exception:
    _LOGURU_AVAILABLE = False

from flask import g, request


if not _LOGURU_AVAILABLE:
    # Simple shim around the standard logging.Logger to provide add/remove/bind/log/info
    std_logger = logging.getLogger("app")
    std_logger.setLevel(logging.INFO)

    class _LoggerShim:
        def __init__(self, logger):
            self._logger = logger

        def remove(self):
            # noop for stdlib
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
    # Remove default handlers
    logger.remove()

    # Console (stdout) handler with request_id in extra
    logger.add(
        sys.stdout,
        level=level,
        colorize=True,
        format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | {extra[request_id]} | {message}",
    )

    # Ensure logs directory exists
    Path("logs").mkdir(parents=True, exist_ok=True)

    # File handler with rotation
    logger.add(
        "logs/app_{time:YYYY-MM-DD}.log",
        rotation="1 day",
        retention="7 days",
        level=level,
        encoding="utf-8",
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {message} | {extra}",
    )

    # Intercept standard logging
    class InterceptHandler(logging.Handler):
        def emit(self, record):
            # Use record.levelno (int) to log via loguru; include exception info if present
            try:
                logger.log(record.levelno, record.getMessage())
            except Exception:
                # Fallback to info if something unexpected happens
                logger.info(record.getMessage())

    logging.basicConfig(handlers=[InterceptHandler()], level=getattr(logging, level))

    # Flask integration: bind request_id and provide request logger
    if app is not None:
        @app.before_request
        def _bind_request_id():
            rid = request.headers.get("X-Request-ID") or str(uuid.uuid4())
            g.request_id = rid
            # store a bound logger for request use
            g.logger = logger.bind(request_id=rid)

        @app.after_request
        def _log_request(response):
            try:
                # prefer bound logger
                lg = getattr(g, "logger", logger)
                lg.info(f"{request.method} {request.path} {response.status_code}")
            except Exception:
                logger.info(f"{request.method} {request.path} {response.status_code}")
            return response


def get_logger():
    """Devuelve el logger ligado al request si existe, o el logger global."""
    try:
        from flask import has_request_context

        if has_request_context():
            return getattr(g, "logger", logger)
    except Exception:
        pass
    return logger
