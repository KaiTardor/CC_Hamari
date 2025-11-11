
# Configuración de los contenedores

Este documento describe las alternativas consideradas para montar el stack en contenedores.

## Imagen base para la base de datos MongoDB 

### `mongo:latest`

#### Ventajas
- Apunta la versión más reciente.
- Permite probar nuevas funcionalidades y mejoras de MongoDB sin cambios manuales en el tag.

#### Inconvenientes
- Falta de control.
- No es recomendable en entornos productivos donde se necesita reproducibilidad y estabilidad.

[Link de referencia](https://hub.docker.com/_/mongo)


### `mongo:7` 

#### Ventajas
- Imagen oficial basada en una versión major moderna y estable de MongoDB.
- Mantiene compatibilidad sólida con la mayoría de drivers y clientes actuales.
- Evita la necesidad de configurar un servidor externo.

#### Inconvenientes
- Verificar compatibilidad debido a migraciones de versiones antiguas.


[Link de referencia](https://hub.docker.com/_/mongo)

### Conclusión
En definitiva, se ha elegido mongo:7 porque ofrece un equilibrio óptimo entre estabilidad, modernidad y control de versión.

## Imagen base para el backend (Python)

### `python:3.12-slim`

#### Ventajas
- Imagen oficial mantenido por el equipo de Python.
- Equilibrio entre tamaño y compatibilidad.
- Compatibles con la mayoria de librerias que requieren compilación.

#### Inconvenientes
- Pesa mas que la versión alpine
- Incluye más paquetes del sistema de los estrictamente necesarios. 

[Link de referencia](https://hub.docker.com/_/python/)

### `python:3.12-alpine`

#### Ventajas
- Imagen muy ligera.
- Esta basado en Alpine Linux, ideal en entornos pequeños.

#### Inconvenientes
- Problemas frecuentes al compilar librerias con dependencias nativas.
- Requiere instalar herramientas adicionales (gcc, musl-dev, etc)

[Link de referencia](https://hub.docker.com/_/python/)

### Conclusión

En definitiva, se ha elegido la slim debido a que ofrece el mejor equilibrio entre ligereza, compatibilidad y facilidad de mantenimiento. Permite construir e instalar dependencias sin complicaciones, garantiza estabilidad en producción y mantiene un tamaño razonablemente pequeño para despliegues eficientes.

## Imagen base para el frontend 

### `node:22-alpine (build) + nginx:1.27-alpine (runtime)`

#### Ventajas
- Multi-stage limpio.
- Combinación de imágenes ligeras y optimizadas.
- Separación clara de responsabilidades (etapa build para desarrollo/compilación y etapa para producción).
- Patrón ampliamente utilizado.

#### Inconvenientes
- Alpine usa musl en lugar de glibc.
- Requiere configuración extra.

[Link de referencia 1](https://hub.docker.com/_/node)

[Link de referencia 2](https://hub.docker.com/_/nginx)

### `node:22-alpine (build + runtime)` 

#### Ventajas
- Configuración muy sencilla.
- útil en entornos internos o demos.
- Evita la necesidad de configurar un servidor externo.

#### Inconvenientes
- Imagen final pesada.
- Servidores embebidos poco optimizados y menos robustos.
- Menor seguridad al exponer un entorno con herramientas de compilación.

[Link de referencia](https://hub.docker.com/_/node)

### Conclusión
En definitiva, se ha elegido la combinación node:22-alpine (build) + nginx:1.27-alpine (runtime) porque ofrece el mejor equilibrio entre rendimiento, ligereza, seguridad y buenas prácticas de despliegue. Permite generar un artefacto limpio y servirlo en un entorno optimizado, reduciendo el tamaño de la imagen final y eliminando dependencias innecesarias. Además, Nginx proporciona una capa de configuración flexible y robusta para manejar rutas y proxy hacia la API, garantizando un despliegue profesional y mantenible.

## Documentación adicional
- [Hito 4](../hito4.md)
- [Descripción de los Dockerfiles](./dockerfiles.md)
- [Descripción del Compose](./compose.md)
- [Descripción del github packages](./github_pack.md)
