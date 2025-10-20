# Comparación de Gestor de Integración continua disponibles

Un gestor de IC es una herramienta que automatiza la ejecución de tareas cada vez que se realiza un cambio en el código, como la instalación de dependencias, la ejecución de pruebas, el análisis de calidad o el despliegue. Su objetivo principal es detectar errores lo antes posible e integrar de forma continua el trabajo de todos los miembros del equipo, garantizando que el código en el repositorio sea siempre estable.

Podemos contar con algunos ejemplos como: 

## GitHub Actions

GitHub Actions es la plataforma de CI/CD integrada directamente en GitHub. Permite definir flujos de trabajo mediante archivos YAML dentro del repositorio, que se ejecutan automáticamente ante eventos como push, pull request o release.

### Ventajas
- Total integración con los repositorios de GitHub.
- Amplio catálogo de actions ya preparadas por la comunidad.
- Fácil integración con Python.

### Inconvenientes
- Depende de GitHub. 
- Los flujos YAML pueden crecer en complejidad con proyectos grandes.

[Link de referencia](https://github.com/features/actions)

## GitLab CI/CD
GitLab CI/CD forma parte nativa de GitLab e incluye funciones de integración y despliegue continuo. Define sus pipelines mediante un archivo .gitlab-ci.yml en el repositorio.

### Ventajas
- Totalmente integrado con GitLab (repositorios, issues, deploys).
- Ofrece entornos de ejecución personalizados.

### Inconvenientes
- Requiere configurar runners.
- Menos conocido fuera del ecosistema GitLab.

[Link de referencia](https://docs.gitlab.com/ci/)

## Jenkins
Jenkins es una de las herramientas de CI más veteranas y potentes, de código abierto y altamente configurable mediante plugins.

### Ventajas
- Altamente personalizable mediante su amplio ecosistema de plugins.
- Permite control total sobre el entorno de ejecución.

### Inconvenientes
- Requiere instalación y mantenimiento del servidor Jenkins.
- Interfaz menos moderna y configuración más compleja.
- Menor integración directa con plataformas como GitHub.

[Link de referencia](https://www.jenkins.io/)

## Conclusión 
Sin lugar a dudas, se va a utilizar GitHub Actions como gestor de integración continua, ya que el proyecto se encuentra alojado en GitHub y esta herramienta ofrece una integración directa, configuración sencilla y soporte completo para los lenguajes y tecnologías utilizados.

## Documentación adicional
- [Hito 2](../hito2.md)
- [Gestor de tareas](./gestor_taras.md)
- [Biblioteca de aserciones](./biblioteca_aser.md)
- [Marco de pruebas](./marco_pruebas.md)