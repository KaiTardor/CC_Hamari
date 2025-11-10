# Documentación del compose.yml

El archivo `compose.yml` define el clúster de contenedores para la aplicación **Hamari**, compuesto por tres servicios principales: `hamari-frontend`, `hamari-backend` y `hamari-mongo`. Este entorno orquesta el frontend, el backend y la base de datos en una misma red Docker interna.

## Servicios

### hamari-mongo

Servicio que proporciona la base de datos para la aplicación:
* Imagen: `mongo:7`
* Nombre del contenedor: `hamari-mongo`
* Puertos:
  * Expuesto en el contenedor: `27017`
  * Mapeado en el host: `27018`
* Volúmenes:
  * `mongo_data:/data/db` para la persistencia de los datos de MongoDB.
* Política de reinicio:
  * `unless-stopped`, garantizando que el servicio se mantenga activo salvo parada explícita.

### hamari-backend

Servicio que gestiona la lógica de negocio y expone la API de la aplicación.
* Build:
  * Contexto: `.` (raíz del proyecto)
  * Dockerfile: `backend/Dockerfile`
* Nombre del contenedor: `hamari-backend`
* Puertos:
  * Expuesto en el contenedor: `5000`
  * Mapeado en el host: `5000`
* Variables de entorno:
  * `MONGO_URI=mongodb://mongodb:27017/HamariDB`
    * El backend se conecta al servicio `mongodb` (resuelto por Docker en la red interna) usando la base de datos `HamariDB`.
  * `FLASK_HOST=0.0.0.0`
  * `FLASK_PORT=5000`
* Dependencias:
  * Depende de `mongodb`, asegurando que la base de datos esté disponible antes de levantar el backend.
* Volúmenes:
  * `./logs:/app/logs` para almacenar logs de la aplicación en el host.
* Política de reinicio:
  * `unless-stopped`, garantizando que el servicio se mantenga activo salvo parada explícita.

### hamari-frontend

Servicio que expone la interfaz web de la aplicación y actúa como punto de entrada para el usuario.
* Build:
  * Contexto: `.` (raíz del proyecto)
  * Dockerfile: `frontend/Dockerfile`
  * Args de build:
    * `VITE_API_BASE=`
      * Permite configurar la ruta base de la API consumida por el frontend.
      * En combinación con Nginx, puede utilizarse para enrutar hacia el backend (por ejemplo `/api` o dominio interno).
* Nombre del contenedor: `hamari-frontend`
* Puertos:
  * Expuesto en el contenedor: `80`
  * Mapeado en el host: `8081`
* Dependencias:
  * Depende de `back` (el servicio `hamari-backend`), garantizando que la API esté disponible antes de servir el frontend.
* Política de reinicio:
  * `unless-stopped`, garantizando que el servicio se mantenga activo salvo parada explícita.
* La configuración de Nginx en el contenedor frontend permite redirigir las peticiones hacia el backend utilizando la red interna de Docker, manteniendo una arquitectura limpia y desacoplada.

## Volúmenes

* `mongo_data`
  Volumen nombrado para la persistencia de los datos de MongoDB, evitando la pérdida de información entre reinicios de contenedores.

## Dependencias entre Servicios

* `hamari-backend` depende de:
  * `hamari-mongo`
* `hamari-frontend` depende de:
  * `hamari-backend`

Esto asegura el siguiente orden lógico:
1. Primero la base de datos.
2. Luego el backend.
3. Finalmente el frontend.

## Uso

1. Construir las imágenes:
   ```
   docker-compose build
   ```

2. Iniciar el clúster:
   ```
   docker-compose up
   ```

3. Iniciar en segundo plano:
   ```bash
   docker-compose up -d
   ```

4. Detener el clúster:
   ```
   docker-compose down
   ```

## Documentación Adicional
- [Hito 4](../hito4.md)
- [Descripción de la imagen base](./base_img.md)
- [Descripción de los Dockerfiles](./dockerfiles.md)
- [Descripción del github packages](./github_pack.md)
