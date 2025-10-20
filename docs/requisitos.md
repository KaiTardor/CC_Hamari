# Requisitos del proyecto

Este documento describe los requisitos y la preparación del entorno para desarrollar y ejecutar el proyecto: uso de entorno virtual de Python (venv), ejecución con Docker/Docker Compose, dependencias y variables de entorno.

## 1) Requisitos previos
- Python 3.12+
- pip 
- Docker 24+ y Docker Compose v2
- Node.js 20+ y npm

## 2) Desarrollo local en entorno virtual
En caso de querer probar solo el backend fuera de Docker, se puede crear un entorno virtual facilmente con el script deploy.bash. Este fichero permite automatizar la creación del entorno virtual venv y descargar las dependencias asociadas. 

### 2.1) Comandos utiles:
- Activar el entorno virtual
```
source venv/bin/activate
```

- Desactivar el entorno
``` 
deactivate
```

- Uso del script
```
bash deploy.bash
```

- Instalar o actualizar las dependencias
```
pip install -r requirements.txt
```

## 3) Ejecución con Docker Compose
Este proyecto define tres servicios en docker-compose.yml:
- mongodb
- backend (Flask + Gunicorn)
- fronted (React, Vite)

### 3.1) Comandos útiles:
- Build de imágenes
```
docker compose -build
```

- Levantar el servicio
```
docker compose up -d
```

- Parar el contenedor:
```
docker compose down
```

- Parar el contenedor y limpiar los datos persistidos
```
docker compose down -v
```

- Ver el estado
``` 
docker ps
```

### 3.2) Puertos y URLs
- MongoDB -> mongodb://localhost:27018/HamariDB
- Backend -> http://localhost:5000
- Frontend -> http://localhost:8081

## 4) Variables de entorno
- MONGO_URI (requerida): URI de conexión a MongoDB.
- FLASK_HOST (por defecto 0.0.0.0 en contenedor).
- FLASK_PORT (por defecto 5000).
- VITE_API_BASE (se pasa como argumento en el Dockerfile)

