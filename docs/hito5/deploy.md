# Descripción del Despliegue en Render utilizando Blueprints

El archivo render.yaml centraliza la configuración de todos los servicios necesarios para el despliegue de mi aplicación Hamari, incluyendo el frontend, el backend y la base de datos. Esta aproximación sigue el paradigma de Infrastructure as Code (IaC), permitiendo definir de forma declarativa y reproducible la infraestructura de la aplicación.

## Servicio Web (Frontend)

### Configuración

* Servicio de tipo web con runtime: static, denominado `hamari-frontend`.
* Despliegue como Static Site, construido mediante el comando:

  ```
  npm ci && npm run build
  ```
* Publicación del contenido generado en el directorio dist.
* Variables de entorno:
  * `VITE_API_BASE`, que define la URL del backend desplegado.
* Integración directa con el repositorio GitHub del proyecto mediante Blueprints.

### Justificación

El frontend de la aplicación está desarrollado como una Single Page Application (SPA), por lo que no requiere un servidor propio en ejecución. El uso de un Static Site en Render permite servir los archivos generados mediante CDN, ofreciendo una mayor rapidez, simplicidad y fiabilidad.

Esta decisión reduce el consumo de recursos, evita tiempos de arranque en frío y simplifica la arquitectura, al no ser necesario mantener un contenedor activo para el frontend. El uso de variables de entorno en tiempo de construcción permite desacoplar la configuración del código fuente, facilitando la reutilización del mismo frontend en distintos entornos.

## Servicio API (Backend)

### Configuración

* Servicio de tipo web denominado `hamari-backend`.
* Implementación mediante Docker, utilizando una imagen personalizada basada en Python y Gunicorn.
* Archivo Dockerfile ubicado en backend/Dockerfile.
* Región de despliegue: frankfurt (Europa).
* Health check configurado en la ruta `/health`.
* Variables de entorno:
  * `MONGO_URI`, utilizada para la conexión con MongoDB Atlas.

### Justificación

El backend se despliega como un servicio independiente, siguiendo una arquitectura desacoplada que mejora la escalabilidad y el mantenimiento del sistema. El uso de Docker garantiza un entorno de ejecución consistente y reproducible, independientemente del entorno físico o del proveedor de infraestructura.

Gunicorn se utiliza como servidor WSGI para asegurar un comportamiento estable en producción. La configuración del puerto dinámico mediante la variable PORT permite la compatibilidad con el entorno gestionado de Render.

La elección de la región frankfurt optimiza la latencia para usuarios europeos y facilita el cumplimiento de normativas de protección de datos dentro del ámbito de la Unión Europea.

## Base de Datos (MongoDB Atlas)

### Configuración

* Base de datos MongoDB gestionada mediante MongoDB Atlas.
* Cluster gratuito (plan M0).
* Base de datos: `HamariDB`.
* Acceso controlado mediante usuario y contraseña gestionados por Atlas.
* Lista de IPs permitidas configurada como `0.0.0.0/0`.
* Conexión mediante URI segura (`mongodb+srv://`) definida como variable de entorno.

### Justificación

MongoDB Atlas proporciona una solución de base de datos gestionada en la nube, eliminando la necesidad de administrar servidores, copias de seguridad o alta disponibilidad manualmente. Esta elección resulta especialmente adecuada en entornos PaaS como Render, donde no existe persistencia de volúmenes en el plan gratuito.

La separación entre los usuarios de acceso al clúster y los usuarios de la aplicación mejora la seguridad del sistema. La configuración de la base de datos mediante variables de entorno permite desacoplar completamente la infraestructura del código fuente.

La región europea del clúster garantiza una latencia reducida y el cumplimiento de la normativa europea de protección de datos.

## Conclusión

La implementación del despliegue de la aplicación Hamari mediante Render Blueprints y el archivo `render.yaml` permite definir la infraestructura de forma declarativa, reproducible y versionada junto al código fuente. Esta aproximación mejora la consistencia entre entornos, facilita el mantenimiento y simplifica el proceso de despliegue continuo.

La separación de responsabilidades entre frontend, backend y base de datos, junto con el uso de Docker y servicios gestionados en la nube, proporciona una arquitectura robusta, escalable y alineada con las buenas prácticas modernas de despliegue en plataformas PaaS.


## Documentación adicional
- [Hito 5](../hito5.md)
- [Comparativa iaas o paas](./comparativa.md.md)
- [Descripción de la elección de paas](./paas.md)
- [Descripción de la integración con github Actions](./github_deploy.md)

