# Comparativa entre IaaS y PaaS para el despliegue del proyecto

Este documento describe las alternativas consideradas para ejecutar el proyecto en la nube, comparando los modelos Infrastructure as a Service (IaaS) y Platform as a Service (PaaS), y evaluando su impacto en mantenimiento, flexibilidad, despliegue y escabilidad.

## Infrastructure as a Service (IaaS)

### Ventajas

* Control total del entorno: posibilidad de elegir sistema operativo, versión, configuración, redes, seguridad, etc.
* Flexibilidad absoluta: permite ajustar cualquier parámetro del servidor, útil para arquitecturas muy personalizadas.
* Compatibilidad garantizada: cualquier stack o dependencia funcionará si puede instalarse en el servidor.

### Inconvenientes

* Sobrecarga de mantenimiento: actualizaciones del SO, parches de seguridad, supervisión, gestión de contenedores, etc.
* Despliegues más complejos: requiere configurar Docker, orquestación, logs, métricas, backup, etc.
* Escalabilidad manual o semiautomática: implica gestionar tamaños de instancias, autoescalado, balanceo, disponibilidad.
* Mayor riesgo operativo: un error de configuración puede comprometer el sistema completo.

## Platform as a Service (PaaS)

### Ventajas

* Despliegue sencillo: se sube el código o las imágenes y la plataforma gestiona la ejecución.
* Mantenimiento reducido: el proveedor se encarga de parches, seguridad, actualizaciones y sistema base.
* Escalabilidad automática y gestionada: la plataforma ajusta recursos bajo demanda sin intervención manual.
* Integraciones nativas: logging, métricas, monitorización, certificados HTTPS, balanceadores, CI/CD, etc.
* Entorno homogéneo y predecible: ideal para reducir errores entre desarrollo y producción.

### Inconvenientes

* Menor control sobre el entorno: no permite personalizar ciertos componentes del sistema base.
* Dependencia del proveedor: cada plataforma tiene su forma específica de configurar variables, logs y escalado.
* Limitaciones en casos muy específicos: proyectos que requieran configuraciones poco comunes pueden verse restringidos.

## Conclusión

En definitiva, se ha elegido PaaS porque ofrece el mejor equilibrio entre simplicidad operativa, rendimiento, estabilidad y velocidad de despliegue. Permite olvidarse de la administración de servidores, reduce drásticamente el mantenimiento y proporciona un entorno seguro y escalable sin esfuerzo adicional. Además, garantiza un flujo de trabajo limpio y profesional, liberando tiempo para centrarse en el desarrollo del producto en lugar de la infraestructura.

## Documentación adicional
- [Hito 5](../hito5.md)
- [Descripción de la elección de paas](./paas.md)
- [Descripción del deployment](./deploy.md)
- [Descripción de la integración con github Actions](./github_deploy.md)

