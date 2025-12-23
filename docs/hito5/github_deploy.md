# Descripción de la Configuración para el despliegue automático desde GitHub

Para automatizar el despliegue de la aplicación Hamari al PaaS Render, se ha implementado un flujo de trabajo de CI/CD utilizando GitHub Actions. Esta configuración permite que la aplicación se despliegue automáticamente tras la validación del código, garantizando que únicamente versiones verificadas lleguen al entorno de producción.

El despliegue se realiza mediante Deploy Hooks de Render, integrados de forma segura con GitHub Actions, evitando la exposición de credenciales sensibles y manteniendo una separación clara entre las fases de validación y despliegue.

## Evento que Dispara el Flujo de Trabajo

El flujo de trabajo de despliegue se activa de forma automática cuando se cumplen las siguientes condiciones:

* **Finalización correcta del workflow Docker Images**:
  El despliegue solo se ejecuta si el workflow encargado de construir y publicar las imágenes Docker finaliza con éxito.
* **Rama Test**:
  El despliegue automático se restringe a dicha rama, utilizada como rama de integración y experimentación, evitando despliegues accidentales desde ramas no controladas.

Este enfoque asegura que el despliegue se realice únicamente tras haber superado las fases previas de pruebas y construcción.

## Instalación y Autenticación

### 1. Acceso al Código del Repositorio

El despliegue no requiere acceder directamente al código fuente durante esta fase, ya que Render reconstruye los servicios a partir del repositorio configurado mediante Blueprints. Por tanto, el flujo de trabajo se limita a lanzar el evento de despliegue.

### 2. Autenticación con Render

* Se utilizan **Deploy Hooks** proporcionados por Render para cada servicio (`backend` y `frontend`).
* Cada Deploy Hook consiste en una URL única que, al recibir una petición HTTP `POST`, inicia automáticamente un nuevo despliegue del servicio asociado.
* Las URLs de los Deploy Hooks se almacenan como GitHub Secrets:
  * `RENDER_BACKEND_DEPLOY_HOOK`
  * `RENDER_FRONTEND_DEPLOY_HOOK`

Este mecanismo elimina la necesidad de utilizar claves de API de Render en el pipeline, mejorando la seguridad y reduciendo la complejidad de la configuración.

## Servicios Desplegados

El flujo de trabajo automatiza el despliegue de los siguientes servicios definidos en Render:

### 1. Backend (API)

* **Servicio:** `hamari-backend`
* **Tipo:** Web Service (Docker)
* **Acción de despliegue:**
  Se lanza una petición `POST` al Deploy Hook correspondiente, provocando que Render:
  * clone el repositorio,
  * construya la imagen Docker del backend,
  * y despliegue la nueva versión del servicio.

### 2. Frontend (Web)

* **Servicio:** `hamari-frontend`
* **Tipo:** Static Site
* **Acción de despliegue:**
  Mediante su Deploy Hook, Render ejecuta automáticamente el proceso de construcción del frontend (`npm ci && npm run build`) y publica el contenido estático generado.

La separación entre backend y frontend permite una gestión modular del despliegue y facilita el mantenimiento de cada componente de forma independiente.

## Ventajas de la Configuración

* **Automatización completa del despliegue:**
  El proceso se ejecuta sin intervención manual una vez superadas las fases de validación.
* **Despliegue controlado:**
  Solo se despliegan versiones que han pasado correctamente los tests y la construcción de imágenes.
* **Arquitectura modular:**
  Backend y frontend se despliegan como servicios independientes.
* **Seguridad:**
  Las URLs sensibles de despliegue se almacenan como secretos de GitHub, evitando su exposición en el repositorio.
* **Trazabilidad:**
  Cada despliegue queda registrado en GitHub Actions y en el panel de Render.


## 5. Ejemplo del Flujo de Trabajo

A continuación se muestra el flujo de trabajo completo utilizado para automatizar el despliegue de la aplicación Hamari en Render:

```
name: Deploy en Render

on:
  workflow_run:
    workflows: ["Docker Images"]
    types: [completed]
    branches: ["Test"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}

    steps:
      - name: Trigger backend deploy
        run: curl -fsS -X POST "${{ secrets.RENDER_BACKEND_DEPLOY_HOOK }}"

      - name: Trigger frontend deploy
        run: curl -fsS -X POST "${{ secrets.RENDER_FRONTEND_DEPLOY_HOOK }}"
```

Este flujo garantiza que el despliegue solo se ejecute cuando todas las fases previas han finalizado correctamente.

## Conclusión

La integración de GitHub Actions con Render mediante Deploy Hooks proporciona un mecanismo de **despliegue automático, seguro y reproducible**, alineado con las buenas prácticas de CI/CD. Esta solución permite desacoplar la validación del código del proceso de despliegue, facilitando el mantenimiento del sistema y reduciendo el riesgo de errores en producción.

## Documentación adicional
- [Hito 5](../hito5.md)
- [Comparativa iaas o paas](./comparativa.md.md)
- [Descripción de la elección de paas](./paas.md)
- [Descripción del deployment](./deploy.md)
