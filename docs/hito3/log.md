# Comparación de registros (logs)

Logging es el proceso de registrar eventos o mensajes que ocurren durante la ejecución de un programa, con el objetivo de supervisar, depurar y analizar su comportamiento. Estos registros (logs) permiten detectar errores, medir rendimiento y entender el flujo de la aplicación tanto en desarrollo como en producción, que para ello se han considerado las siguientes opciones: 

## Módulo estándar logging
El módulo logging es la librería estándar de Python para la gestión de registros (logs). Permite registrar eventos del sistema con diferentes niveles de severidad (DEBUG, INFO, WARNING, ERROR, CRITICAL).

### Ventajas
- Integrado en la librería estándar de Python
- Altamente configurable mediante handlers, formatters y filters.

### Inconvenientes
- Sintaxis verbosa y configuración manual extensa.
- Difícil de mantener en proyectos grandes si no se estructura correctamente.
- Menor legibilidad del código frente a librerías más modernas.

[Link de referencia](https://docs.python.org/3/library/logging.html)


## Loguru
Loguru es una librería de logging moderna para Python que busca simplificar el proceso de registro con una configuración mínima y una sintaxis más limpia

### Ventajas
- Fácil de usar: configuración simple, sin necesidad de definir loggers, handlers ni formatters manualmente.
- Permite rotación automática de archivos, compresión y eliminación de logs antiguos.
- Mensajes coloreados y legibles en consola.
- Soporta interceptación del logging estándar y formateo personalizable.

### Inconvenientes
- Añade una dependencia externa.
- Menos control detallado que el módulo estándar en configuraciones muy específicas.

[Link de referencia](https://loguru.readthedocs.io/en/stable/)

## structlog

Structlog es una librería enfocada en el logging estructurado, es decir, en representar los logs en formato JSON u objetos, lo que facilita su análisis y envío a sistemas de monitorización (como ELK, Datadog o Grafana).

### Ventajas
- Ideal para entornos distribuidos o microservicios.
- Compatible con el módulo logging estándar.
- Facilita la integración con herramientas de observabilidad.

### Inconvenientes
- Configuración más compleja para proyectos pequeños.
- Requiere un formato de salida estructurado (JSON), lo que puede ser innecesario en fases iniciales.
- Sobrecoste si no se usa junto con sistemas de análisis de logs externos.

[Link de referencia](https://www.structlog.org/en/stable/)

## Conclusión

En definitiva, se ha optado por Loguru para la gestión de los logs de la aplicación ya que proporciona una solución simple y potente. Además, su integración con Flask es directa y permite registrar fácilmente los eventos del servidor, errores y peticiones, manteniendo un código limpio y legible.

## Documentación adicional
- [Hito 3](../hito3.md)
- [Elección de framwwork](./framework.md)
