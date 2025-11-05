 # Comparación de framework disponibles

Un framework es una estructura o conjunto de herramientas y reglas que facilitan y estandarizan la creación de aplicaciones o software.

## 1) Frontend

### Angular
Angular es un framework de JavaScript desarrollado por Google que sirve para crear aplicaciones web dinámicas y de una sola página (SPA).

#### Ventajas
- Facilita la organización del código con una estructura clara.
- Usa TypeScript.
- Gran variedad de herramientras integradas.

#### Inconvenientes
- Curva de aprendizaje alta.
- Pesado para proyectos pequeños.

[Link de referencia](https://angular.dev/)

### Streamlit 
Es un framework en Python que permite crear aplicaciones web interactivas de forma rápida y sencilla, especialmente útil para proyectos de análisis de datos y machine learning.

#### Ventajas
- Bastante facil de usar.
- Permite crear interfaces web sin necesidad de HTML, CSS ni JavaScript.
- Integración sencilla con librerias soportadas por Python.

#### Inconvenientes
- Menos personalizable.
- No está diseñada para aplicaciones complejas.

[Link de referencia](https://streamlit.io/)


### React 
Es una biblioteca de JavaScript desarrollada por Meta (Facebook) que se usa para crear interfaces de usuario interactivas, especialmente en aplicaciones web de una sola página (SPA).

#### Ventajas:
- Alta eficiencia gracias al Virtual DOM.
- Compatible con otros frameworks y librerías.
- Tipado con TypeScript reduce errores y mejora refactors.

#### Inconvenientes
- Curva inicial con TypeScript y configuración de tipos.

[Link de referencia](https://es.react.dev/)

### Conclusión
En definitiva, se va a usar react para el desarrollo del frontend.

React ofrece una interfaz moderna, reactiva y modular, ideal para construir aplicaciones de una sola página (SPA) con una excelente experiencia de usuario. Además, lo vamos a integrar con Vite para mejorar significativamente los tiempos de desarrollo y compilación gracias a su servidor ultrarrápido y configuración ligera.

## 2) Backend
### Flask
Es un microframework en Python orientado al desarrollo de aplicaciones web y APIs ligeras. Destaca por su sencillez, flexibilidad y facilidad para empezar rápidamente sin configuraciones complejas.

#### Ventajas
- Muy ligero y fácil de aprender.
- Gran flexibilidad.
- Amplia comunidad y buena documentación.
- Experiencia ya en otros proyectos. 

#### Inconvenientes
- Requiere configurar manualmente algunos componentes.
- Menos adecuado para proyectos muy grandes.

[Link de referencia](https://flask.palletsprojects.com/en/stable/)

### Django
Framework completo en Python diseñado para el desarrollo rápido de aplicaciones web, con una arquitectura MVC (Model-View-Controller) muy estructurada.

#### Ventajas
- Incluye muchas herramientas integradas.
- Fomenta el desarrollo rápido y seguro.

#### Inconvenientes
- Pesado para proyectos pequeños o APIs simples.
- Menos flexible: sigue una estructura rígida.
- Mayor curva de aprendizaje.

[Link de referencia](https://www.djangoproject.com/)

### FastAPI
Framework moderno y asíncrono en Python diseñado para crear APIs rápidas y eficientes, con soporte nativo para tipado y generación automática de documentación.

#### Ventajas
- Altas prestaciones gracias a su diseño asíncrono.
- Integración sencilla con tipos de Python.
- Ideal para microservicios y proyectos orientados a rendimiento.

#### Inconvenientes
- Requiere conocer programación asíncrona.
- Ecosistema algo más nuevo que Flask o Django.

[Link de referencia](https://fastapi.tiangolo.com/)

### Conclusión
En definitiva, se va a usar Flask para el desarrollo del backend ya que ofrece un enfoque simple, flexible y ligero, ideal para crear una API REST. Además, permite definir las rutas y manejar las peticiones fácilmente sin imponer una estructura rígida. Sin contar que se usó este framework en proyectos anteriores, lo cual facilita la implementación y la curva de aprenzaje es casi nula. 

## 3) Base de datos

### MongoDB
Es una base de datos NoSQL orientada a documentos, donde la información se almacena en formato JSON (o BSON internamente). Está diseñada para ser flexible, escalable y de alto rendimiento

#### Ventajas
- Modelo flexible: no requiere esquemas fijos.
- Alta escalabilidad horizontal mediante sharding.
- Integración sencilla con Python a través de librerías como PyMongo.

#### Inconvenientes
- Menor consistencia estricta frente a bases SQL.

[Link de referencia](https://www.mongodb.com/)

### PostgreSQL
Es una base de datos relacional (SQL) de código abierto, muy potente y fiable.

#### Ventajas
- Cumple con el estándar ACID.
- Soporta funciones avanzadas, vistas, triggers y JSONB.
- Es consistente, robusto y soporta transacciones complejas.

#### Inconvenientes
- Requiere definir esquemas de datos fijos.
- Menor flexibilidad frente a bases NoSQL.
- Configuración inicial algo más compleja.

[Link de referencia](https://www.postgresql.org/)

### MySQL / MariaDB
Base de datos relacional muy popular, conocida por su rapidez y facilidad de uso.

#### Ventajas
- Buen rendimiento en consultas simples.
- Amplio soporte en servicios de hosting.
- Gran comunidad y documentación.

#### Inconvenientes
- Menos potente que PostgreSQL para consultas avanzadas o integridad de datos.
- Menos flexible para modelos de datos no estructurados.

[Link de referencia](https://www.mysql.com/)

### Conclusión

En definitiva, se ha optado por MongoDB como sistema de base de datos principal. Su naturaleza NoSQL y su modelo basado en documentos JSON ofrecen una gran flexibilidad a la hora de definir y modificar la estructura de los datos, lo que facilita el desarrollo ágil del proyecto y la integración con Flask en el backend.

## Integración 

- Prefijo API: el backend expone rutas bajo `/api/*`; el frontend debe apuntar a ese prefijo para mantener separación clara entre UI y API.

- CORS: `backend/__init__.py` habilita CORS para permitir peticiones desde el origen del frontend en desarrollo.

## Documentación adicional
- [Hito 3](../hito3.md)
- [Elección sistema de Logs](./log.md)