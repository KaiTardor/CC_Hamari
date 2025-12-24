# Descripción de la Configuración para el despliegue automático desde GitHub

Para el proyecto Hamari, el despliegue automático al PaaS Render se ha diseñado siguiendo una separación clara entre Integración Continua (CI) y Despliegue Continuo (CD).
La validación del código se realiza mediante GitHub Actions, mientras que el despliegue automático es gestionado directamente por Render a través de Render Blueprints y el archivo render.yaml.

Este enfoque permite simplificar la arquitectura del pipeline, reducir la complejidad operativa y mantener un flujo de despliegue reproducible y controlado.

## Integración Continua con Github actions

La pipeline de CI está compuesta por varios workflows independientes que cubren las siguientes tareas:

1. Pruebas del Backend
  - Ejecución de tests automáticos con pytest.
  - Uso de MongoDB como servicio dentro del workflow para replicar el entorno de ejecución real.
  - Verificación de la correcta integración entre la API y la base de datos.

2. Pruebas del Frontend
  - Instalación de dependencias mediante npm ci.
  - Ejecución de tests y análisis estático del código.
  - Generación de informes de cobertura.

3. Análisis estático y calidad del código
  - Uso de herramientas de linting y formateo.
  - Generación de métricas de cobertura para evaluar la calidad del código.

## Integración Continua con Github actions
Render está conectado al repositorio GitHub y utiliza Render Blueprints, definidos en el archivo render.yaml, para desplegar automáticamente la aplicación. Cada vez que se detecta un cambio en la rama configurada:
  1. Render clona el repositorio.
  2. Interpreta el archivo render.yaml.
  3. Reconstruye los servicios definidos (backend y frontend).
  4. Despliega la nueva versión de la aplicación.

## Servicios Desplegados

El despliegue automático gestionado por Render incluye los siguientes servicios:

1. Backend (API)
  - Servicio: hamari-backend
  - Tipp: Web Service (Docker)
  - Proceso de despliegue:
    - Construcción de la imagen Docker a partir del Dockerfile.
    - Arranque del servicio mediante Gunicorn.
    - Exposición del endpoint /health para verificación del estado del servicio.

2. Frontend (Web)
  - Servicio: hamari-frontend
  - Tipo: Static Site
  - Proceso de despliegue:
    - Ejecución del proceso de construcción (npm ci && npm run build).
    - Publicación del contenido estático generado mediante CDN.


## Conclusión
La combinación de GitHub Actions para la Integración Continua y Render Blueprints para el Despliegue Continuo proporciona un flujo de trabajo automatizado, coherente y alineado con las buenas prácticas modernas de CI/CD. Esta solución garantiza que la aplicación Hamari se despliegue de forma automática, segura y reproducible, manteniendo una arquitectura sencilla y fácil de mantener.

## Documentación adicional
- [Hito 5](../hito5.md)
- [Comparativa iaas o paas](./comparativa.md.md)
- [Descripción de la elección de paas](./paas.md)
- [Descripción del deployment](./deploy.md)
