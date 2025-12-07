# Comparativa de PaaS para el proyecto

Este documento describe las alternativas consideradas para desplegar el proyecto en una plataforma PaaS, evaluando facilidad de despliegue, soporte de contenedores, coste y mantenimiento.

## Render

### Ventajas

* Permite desplegar aplicaciones completas (backend, frontend, workers, cron, bases de datos, etc.).
* Soporte nativo para contenedores Docker.
* Despliegues automáticos desde Git con SSL y dominios gestionados.
* Ofrece un plan gratuito suficiente para entornos pequeños o prototipos.
* Entorno sencillo y bien adaptado a proyectos con estructura multi-servicio.

### Inconvenientes

* El free tier es limitado en uso y rendimiento.
* Menos ecosistema de “add-ons” que plataformas más antiguas.
* Puede requerir subir a plan de pago si el proyecto escala.

[Link de referencia](https://render.com)


## Railway

### Ventajas

* Extremadamente sencillo para desplegar desde Git.
* Buena experiencia para proyectos pequeños o en desarrollo.
* Integración rápida con bases de datos y servicios adicionales.

### Inconvenientes

* El plan gratuito es basado en créditos y se agota.
* No es ideal si buscas un entorno gratuito permanente.
* Menos control en configuraciones avanzadas.

[Link de referencia](https://railway.app)


## Fly.io

### Ventajas

* Infraestructura distribuida globalmente para baja latencia.
* Soporte completo para Docker y despliegues geolocalizados.
* Permite despliegues más avanzados sin gestionar IaaS completo.

### Inconvenientes

* Mayor complejidad que otros PaaS más “plug-and-play”.
* Requiere configurar algunos aspectos de red o distribución.
* Puede ser excesivo si no se necesita despliegue global.

[Link de referencia](https://fly.io)


## DigitalOcean App Platform

### Ventajas

* Permite desplegar contenedores, servicios, backend y frontend.
* Mejor control de recursos y red respecto a PaaS estrictamente simplificadas.
* Escalado vertical y horizontal gestionado.

### Inconvenientes

* No cuenta con un free tier fuerte para producción.
* Puede ser excesivo para proyectos pequeños iniciales.
* Supone algo más de mantenimiento que plataformas más automáticas.

[Link de referencia](https://www.digitalocean.com/products/app-platform)

## Google App Engine

### Ventajas

* Plataforma madura con infraestructura de Google Cloud.
* Escalado automático, logging, métricas y seguridad integrados.
* Permite despliegues basados en código o contenedor.
* Compatibilidad con múltiples lenguajes y servicios gestionados de GCP.
* Existe un "always-free tier" limitado para pequeños servicios.

### Inconvenientes

* Mayor complejidad de configuración inicial comparado con Render o Railway.
* Entorno más rígido en algunas configuraciones.
* Costes pueden aumentar rápido en escenarios de tráfico sostenido.
* Curva de aprendizaje más alta al integrarse en el ecosistema GCP.

[Link de referencia](https://cloud.google.com/appengine)

# Conclusión

En definitiva, se ha elegido Render porque ofrece el mejor equilibrio entre simplicidad, soporte para contenedores, despliegue automatizado y un free tier real que permite desarrollar y probar sin coste. Resulta especialmente adecuado para un proyecto modular como este, evitando complejidad innecesaria y garantizando un despliegue limpio, ágil y mantenible.
