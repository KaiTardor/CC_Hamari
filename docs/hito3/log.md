# Registro (logs) — opciones y recomendación

Este documento describe tres opciones prácticas para manejar logs en el backend Python (Flask): el módulo estándar `logging`, `loguru` y `structlog`. Para cada opción se incluyen ventajas, inconvenientes y una recomendación final.

## 1) Módulo estándar `logging`

Descripción
- `logging` es el módulo incluido en la biblioteca estándar de Python. Permite configurar loggers, handlers y formatters, y tiene soporte para rotación (via `logging.handlers`).

Ventajas
- Sin dependencias externas.
- Muy configurable: handlers para ficheros, syslog, stream, rotación, filtros.
- Bien conocido y ampliamente compatible con bibliotecas.

Inconvenientes
- API algo más verbosa que alternativas de terceros.
- Formateo estructurado (JSON) requiere un formatter adicional (p. ej. `python-json-logger`).

Cuándo usarlo
- Proyectos pequeños o cuando se prefiera no añadir dependencias. También es la base para integrar librerías externas.

---

## 2) Loguru

Descripción
- `loguru` es una librería de logging muy cómoda y moderna que simplifica la configuración y añade funcionalidades por defecto (rotación, retención, backtrace, formato amigable).

Ventajas
- API muy sencilla (logger global), fácil de configurar.
- Rotación y retención integradas sin handlers manuales.
- Fácil de capturar logs del módulo estándar y redirigirlos a loguru.
- Buena experiencia de desarrollo (formato colorido en consola).

Inconvenientes
- Añade una dependencia externa (pero ligera y estable).
- Convención distinta al módulo `logging` estándar (aunque puede interceptar `logging`).

Cuándo usarlo
- Cuando se busca configuración rápida y clara, con rotación de ficheros y salida a stdout por defecto. Ideal para proyectos donde quieres resultados inmediatos sin mucha configuración.

---

## 3) structlog

Descripción
- `structlog` se centra en logs estructurados (p. ej. JSON) y composición: facilita añadir campos (request_id, user_id) y producir salidas listas para indexar (ELK, Loki).

Ventajas
- Excelente para logs estructurados y para enriquecer eventos con contexto (trazas, ids).
- Se integra con el módulo `logging` o con `python-json-logger`.

Inconvenientes
- Requiere más configuración inicial que `loguru`.
- Añade conceptos nuevos (processors, renderer) que tienen curva de aprendizaje.

Cuándo usarlo
- Proyectos que necesiten logs JSON listos para indexado y análisis, o cuando quieras un pipeline de processing más fino.

---

## Recomendación y elección

Para este proyecto se elige `loguru` por su sencillez de integración, rotación/retención incluidas y la mínima fricción para empezar a obtener logs útiles en desarrollo y producción.

Plan de integración:
- Añadir `loguru` como dependencia.
- Crear `backend/logging.py` que configure `loguru` (stdout + fichero con rotación diaria) y capture el módulo `logging` estándar.
- Añadir un `request_id` por petición en Flask y usar un logger ligado al request para facilitar correlación.

En los próximos pasos implementaré la integración en el repositorio (`backend/logging.py`) y la inicializaré desde `backend/__init__.py`.

---

Referencias rápidas
- loguru: https://github.com/Delgan/loguru
- structlog: https://www.structlog.org/
- logging (stdlib): https://docs.python.org/3/library/logging.html
