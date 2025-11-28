# Documentación para Actualización Automática y Subida a GitHub Packages

En este documento se describe el flujo de trabajo configurado en GitHub Actions para construir y publicar automáticamente las imágenes Docker del proyecto **Hamari** en GitHub Container Registry (GHCR). El objetivo es garantizar que las imágenes del backend y del frontend estén siempre actualizadas tras pasar por el flujo de test correctamente.


## Eventos que Activan el Workflow

Dicho workflow se ejecuta cuando finaliza el workflow "Tests" solamente cuando haya sido exitoso:

```
on:
  workflow_run:
    workflows: ["Tests"]
    types: [completed]
```

Esto asegura que las imágenes Docker solo se publiquen cuando el pipeline de tests ha pasado con éxito, o cuando se realiza un push explícito sobre la rama de Test, o en otras palabras, una versión estable y funcional antes de la entrega en main.

## Permisos

Se declaran los permisos mínimos necesarios para operar sobre el repositorio y el registro de contenedores:

```
permissions:
  contents: read
  packages: write
```

* `contents: read` → Permite leer el contenido del repositorio.
* `packages: write` → Permite publicar imágenes en GitHub Container Registry (GHCR).

## Job Principal

### `publish` – Build y Push de Imágenes a GHCR

Este job se encarga de construir y subir las imágenes Docker del backend y frontend.

```
jobs:
  publish:
    name: Build and push images to GHCR
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
```

* Sistema Operativo: `ubuntu-latest`
* Condición (`if`):
  * Ejecuta el job unicamente cuando cumplan con las condiciones nombradas anteriormente

## Pasos del Job

### 1. Checkout del Repositorio
Obtiene el código fuente necesario para construir las imágenes:
```
- name: Checkout
  uses: actions/checkout@v4
  with:
    fetch-depth: 0
```
* `fetch-depth: 0` → Clona todo el historial, útil si se necesita información del repo más allá del último commit.

### 2. Debug de la Información del Evento (Opcional)
Muestra información del evento que ha activado el workflow, útil para diagnóstico:
```
- name: "Debug: print event info"
  run: |
    echo "GITHUB_EVENT_NAME=$GITHUB_EVENT_NAME"
    echo "GITHUB_REF=$GITHUB_REF"
    echo "EVENT PATH: $GITHUB_EVENT_PATH"
    echo "--- event payload ---"
    cat "$GITHUB_EVENT_PATH" || true
```

### 3. Configuración de QEMU
Permite builds multi-arquitectura si se requiere:
```
- name: Set up QEMU
  uses: docker/setup-qemu-action@v2
```

### 4. Configuración de Docker Buildx
Habilita el uso de `buildx` para la construcción avanzada de imágenes:
```
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v2
```

### 5. Login en GitHub Container Registry (GHCR)
Autenticación contra GHCR usando el `GITHUB_TOKEN` del propio repositorio:
```
- name: Login to GHCR
  uses: docker/login-action@v2
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```
Esto permite push de imágenes bajo la organización/usuario del repositorio.

### 6. Normalización del Owner en Minúsculas
GHCR requiere el namespace en minúsculas. Este paso transforma el `repository_owner`:
```
- name: Set lowercase owner
  id: owner
  env:
    REPO_OWNER: ${{ github.repository_owner }}
  run: |
    OWNER_LC=$(echo "$REPO_OWNER" | tr '[:upper:]' '[:lower:]')
    echo "owner=$OWNER_LC" >> "$GITHUB_OUTPUT"
```
El resultado (`steps.owner.outputs.owner`) se reutiliza en las etiquetas de las imágenes.

### 7. Build y Push de la Imagen del Backend
Construye la imagen del backend usando el Dockerfile ubicado en `./backend/Dockerfile` y la publica en GHCR:
```
- name: Build and push backend image
  uses: docker/build-push-action@v4
  with:
    context: .
    file: ./backend/Dockerfile
    push: true
    tags: |
      ghcr.io/${{ steps.owner.outputs.owner }}/cc-hamari-backend:latest
```

* Tag generado (de ejemplo):
  * `ghcr.io/<owner>/cc-hamari-backend:latest`

### 8. Build y Push de la Imagen del Frontend
Construye la imagen del frontend usando el Dockerfile en `./frontend/Dockerfile`:
```
- name: Build and push frontend image
  uses: docker/build-push-action@v4
  with:
    context: .
    file: ./frontend/Dockerfile
    push: true
    tags: |
      ghcr.io/${{ steps.owner.outputs.owner }}/cc-hamari-frontend:latest
```
* Tag generado (de ejemplo):
  * `ghcr.io/<owner>/cc-hamari-frontend:latest`

Ambas imágenes quedan disponibles en GHCR para su uso en despliegues posteriores.

## Documentación Adicional
- [Hito 4](../hito4.md)
- [Descripción de la imagen base](./base_img.md)
- [Descripción de los Dockerfiles](./dockerfiles.md)
- [Descripción del Compose](./compose.md)
