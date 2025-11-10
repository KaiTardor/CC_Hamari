# Documentación de los Dockerfiles

## Dockerfile para el Backend

### Propósito:

El Dockerfile del backend define el entorno necesario para ejecutar la aplicación Hamari desarrollada en Flask, sirviéndola en producción mediante Gunicorn. Está orientado a ser una imagen ligera, reproducible y adecuada para entornos productivos.

### Componentes Clave:

1. Imagen Base:
   * Se utiliza `python:3.12-slim`, una imagen oficial y ligera de Python.

2. Configuración de Entorno:
   * `PYTHONDONTWRITEBYTECODE=1`: evita la generación de archivos `*.pyc`, reduciendo ruido en el sistema de archivos.
   * `PYTHONUNBUFFERED=1`: asegura que la salida de logs se muestre en tiempo real, útil para observabilidad en contenedores.

3. Instalación de Dependencias:
   * Se copia `requirements.txt` y se instalan las dependencias con:
     ```
     pip install --no-cache-dir -r requirements.txt
     ```

   * El uso de `--no-cache-dir` evita almacenar caché de `pip`, reduciendo el tamaño final de la imagen.

4. Copia del Código:
   * Se copia el código del backend desde `backend/` y el archivo `app.py` a `/app`, dejando únicamente lo necesario para la ejecución.

5. Variables de Entorno de Ejecución:
   * `FLASK_HOST=0.0.0.0` y `FLASK_PORT=5000` definen el host y puerto de la aplicación dentro del contenedor.

6. Exposición de Puertos:
   * Se expone el puerto `5000`, que será el utilizado por Gunicorn para servir la aplicación.

7. Ejecución:

   * La aplicación se ejecuta con:
     ```
     gunicorn -w 2 -b 0.0.0.0:5000 app:app
     ```

   * Uso de **Gunicorn** con 2 workers como solución sencilla y apropiada para entornos productivos básicos.

### **Uso**:

- Construcción:

   ```
   docker build -t backend-app -f backend/Dockerfile .
   ```
- Ejecución:

   ```
   docker run -p 5000:5000 backend-app
   ```

## Dockerfile para el Frontend

### Propósito:

El Dockerfile del frontend define un flujo multi-stage para compilar una aplicación frontend y servir los artefactos resultantes mediante Nginx, optimizando tamaño, rendimiento y separación de responsabilidades.

### Componentes Clave:

#### Fase 1: Build con `node:22-alpine`

1. Imagen Base:
   * `node:22-alpine`, imagen ligera basada en Alpine con Node.js 22, ideal para procesos de compilación.

2. Directorio de Trabajo:
   * `WORKDIR /app` para centralizar la construcción del proyecto.

3. Ajustes de Red y npm:
   * Instalación de certificados:
     ```
     apk add --no-cache ca-certificates && update-ca-certificates
     ```

   * Configuración de variables `npm_config_*` para:
     * Usar el registro oficial.
     * Aumentar reintentos y timeouts.
     * Enforzar `strict_ssl=true`.

   * Soporte opcional para `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY` mediante `ARG` y `ENV`, facilitando builds en entornos corporativos o con restricciones de red.

4. Instalación de Dependencias:
   * Copia de `package*.json` y ejecución de:
     ```
     npm ping && npm ci
     ```

   * `npm ci` garantiza instalaciones reproducibles basadas en `package-lock.json`.

5. Copia del Código y Configuración de Build:
   * Se copia el código fuente desde `frontend/`.
   * Uso de `VITE_API_BASE` como `ARG`/`ENV` para configurar dinámicamente la URL base de la API (por defecto `/api`).

6. Build del Frontend:
   * Ejecución de:
     ```
     npm run build
     ```

   * Generando los estáticos de producción en `/app/dist`.

#### Fase 2: Runtime con `nginx:1.27-alpine`

1. Imagen Base:
   * `nginx:1.27-alpine`, imagen ligera y estable, diseñada para servir contenido estático con alto rendimiento.

2. Configuración de Nginx:
   * Se copia `frontend/nginx.conf` a:
     ```
     /etc/nginx/conf.d/default.conf
     ```

   * Esta configuración permite servir el frontend y gestionar el proxy hacia `/api` cuando sea necesario.

3. Copia de Artefactos de Build:
   * Se copian los archivos generados en la etapa anterior:

     ```
     COPY --from=build /app/dist /usr/share/nginx/html
     ```

4. Exposición de Puertos:
   * Por defecto, Nginx sirve en el puerto `80`, que será el que se mapeará desde el host.

### Uso:

- Construcción:
   ```
   docker build -t frontend-app -f frontend/Dockerfile .
   ```

- Ejecución:

   ```
    docker network create cc-hamari

    docker run -d --name back --network cc-hamari backend-app

    docker run -d --name front --network cc-hamari -p 80:80 frontend-app

   ```

## Consideraciones adicional
* Reproducibilidad:
  * Uso de ficheros de dependencias (`requirements.txt`, `package-lock.json`) y configuración controlada de entorno.


## Documentación Adicional
- [Hito 4](../hito4.md)
- [Descripción de la imagen base](./base_img.md)
- [Descripción del Compose](./compose.md)
- [Descripción del github packages](./github_pack.md)
