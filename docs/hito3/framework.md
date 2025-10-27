 # Elección de tecnologías (resumen claro)

Este documento resume y justifica las tecnologías elegidas para el proyecto, con una estructura clara por componente (frontend, backend, base de datos), ventajas y desventajas, alternativas relevantes, integración y buenas prácticas.

## Resumen rápido
- Frontend: React 19 + Vite + TypeScript
- Backend: Flask (Python) + PyMongo
- Base de datos: MongoDB

Los ficheros que confirman estas elecciones son `frontend/package.json` y `backend/__init__.py`.

---

## 1) Frontend

Elección: React + Vite + TypeScript

Por qué: combinación que acelera el desarrollo (Vite HMR), facilita la creación de UIs complejas (React) y añade seguridad y mantenibilidad (TypeScript).

Ventajas:
- Excelente ecosistema de componentes y librerías.
- Experiencia de desarrollo rápida con Vite.
- Tipado con TypeScript reduce errores y mejora refactors.

Desventajas:
- Curva inicial con TypeScript y configuración de tipos.
- Hay que controlar el tamaño del bundle en producción.

Alternativas relevantes (resumidas):
- Angular: framework completo y opinado; útil en equipos grandes que necesitan convenciones estrictas. Más verboso.
- Streamlit: permite crear UIs simples en Python sin JavaScript. Ideal para dashboards/prototipos, no para SPA completas.

Cuando habría sido preferible otra opción:
- Angular si se necesitara una solución muy estructurada desde el inicio.
- Streamlit para herramientas internas o prototipos en Python.

---

## 2) Backend

Elección: Flask (+ PyMongo)

Por qué: Flask permite levantar una API REST ligera y modular con Blueprints; se integra bien con `flask_pymongo` para MongoDB.

Ventajas:
- Ligero, fácil de aprender y rápido para prototipar APIs.
- Gran control sobre la estructura y middlewares.
- Ecosistema Python para autenticación, testing y utilidades.

Desventajas:
- Menos convenciones impuestas; el equipo debe acordar buenas prácticas.

Alternativas relevantes:
- Django: muy completo (ORM, admin), recomendable si se necesita un panel administrativo y un ORM robusto.
- FastAPI: alto rendimiento y validación/typing con Pydantic; genera OpenAPI automáticamente. Ideal si se prioriza rendimiento y tipado estricto.

Cuando habría sido preferible otra opción:
- Django si el proyecto necesitara muchas funcionalidades integradas y un admin listo para usar.
- FastAPI si se buscara rendimiento y documentación automática de la API.

---

## 3) Base de datos

Elección: MongoDB (NoSQL orientado a documentos)

Por qué: encaja con la naturaleza JSON-like de las APIs REST y facilita almacenar documentos con campos variables (ofertas, bookings, metadatos).

Ventajas:
- Esquema flexible que facilita iteraciones rápidas.
- Buena integración con Python (`pymongo`/`flask_pymongo`).
- Manejo natural de documentos anidados.

Desventajas:
- No relacional: consultas tipo JOIN son más limitadas o costosas.
- Para lógica transaccional compleja puede requerir estrategias adicionales.

Alternativas:
- PostgreSQL/MySQL: bases relacionales para integridad referencial y consultas complejas.
- SQLite: útil para prototipos o entornos con baja concurrencia.

Cuando habría sido preferible otra opción:
- PostgreSQL si el dominio necesitara integridad y consultas SQL complejas.

---

## Integración y buenas prácticas (puntos prácticos)
- Prefijo API: usar `/api/*` en backend y apuntar el frontend a ese prefijo.
- CORS: ya habilitado en `backend/__init__.py` para desarrollo; ajustar orígenes en producción.
- Tipado conjunto: documentar contratos JSON y mapearlos a tipos TypeScript en el frontend.
- Producción: aplicar code-splitting, compresión y eliminación de dependencias no usadas; en backend optimizar consultas y usar índices en MongoDB.

---

## Conclusión

La combinación seleccionada (React + Vite + TypeScript en frontend; Flask + MongoDB en backend) ofrece un buen equilibrio entre rapidez de desarrollo, flexibilidad y mantenibilidad para el alcance del proyecto. Angular o Streamlit (frontend) y Django o FastAPI (backend) son alternativas válidas en escenarios concretos, y PostgreSQL/MySQL son alternativas a considerar si el dominio requiere relaciones y transacciones complejas.

Si quieres, añado:
- Enlaces oficiales (React, Vite, TypeScript, Flask, FastAPI, Streamlit, MongoDB, PostgreSQL).
- Fragmentos de configuración: `vite.config.ts`, ejemplo de inicialización de Flask con `flask_pymongo`.
- Una tabla comparativa compacta para impresión o presentación.

## Referencias y archivos relevantes
- `frontend/package.json` — dependencias y scripts
- `frontend/vite.config.ts` — (si existe) configuración de Vite
- `backend/__init__.py` — creación de la app y registro de blueprints
- `docs/hito2/*` — estilo y ejemplos de redacción anteriores

# Comparación y elección del framework

En este documento se explican con más detalle las razones por las que se han elegido las tecnologías del frontend y del backend, y se comparan con las alternativas más relevantes (ventajas y desventajas). El objetivo es justificar la selección y ofrecer contexto para futuras decisiones.

## Resumen rápido de la elección

- Frontend: React 19 + Vite + TypeScript
- Backend: Flask (Python) + PyMongo

Ambas elecciones están reflejadas en los ficheros del repositorio: `frontend/package.json` y `backend/__init__.py`.

---

## Frontend: comparativa detallada

### Opción elegida: React + Vite + TypeScript

Ventajas principales:
- Muy buen soporte de componentes y ecosistema (bibliotecas para formularios, gestión de estado, rutas, testing).
- Vite proporciona arranque y recarga en caliente muy rápidos, mejorando la productividad durante el desarrollo.
- TypeScript añade seguridad de tipos y mejora el mantenimiento y refactorización del código.
- Integración directa con herramientas modernas usadas en el proyecto (Tailwind, ESLint, Vitest).

Inconvenientes:
- Curva inicial de TypeScript y necesidad de tipar las llamadas a la API.
- Requiere atención a la optimización del bundle en producción.

Por qué se eligió: el equipo prioriza rapidez de desarrollo y mantenibilidad. React es popular, bien documentado y facilita la colaboración. Vite mejora significativamente la experiencia de desarrollo respecto a bundlers tradicionales.

### Alternativa: Angular

Ventajas:
- Framework muy completo y opinado: incluye todo lo necesario (CLI, estructura, DI, testing integrado).

Inconvenientes:
- Mayor complejidad y verbosidad; sobrecarga para proyectos pequeños/medianos.

Cuando habría sido preferible: en equipos grandes que quieran una convención estricta y muchas funcionalidades listas para usar.

### Alternativa: Streamlit (opción Python para UIs simples)

Ventajas:
- Permite levantar interfaces web interactivas rápidas usando solo Python, sin necesidad de escribir JavaScript/TypeScript.
- Muy útil para prototipos, dashboards o herramientas internas donde la UI es sencilla y centrada en datos.

Inconvenientes:
- No está pensado para aplicaciones frontend complejas ni para una SPA con rutas y estado avanzado.
- Menos control sobre optimizaciones y bundle; la experiencia de usuario es más limitada comparada con React.

Cuando habría sido preferible: si se buscara una interface sencilla para visualización o herramientas internas y se quisiera desarrollar todo en Python.

---

## Herramientas de build y tipado (Frontend)

### Vite vs Webpack/CRA/Parcel

Vite se eligió por su velocidad en desarrollo (cold start y HMR). Webpack y CRA son opciones robustas, pero más lentas en grandes proyectos; Parcel es más sencillo pero con menos control avanzado. Para el flujo actual (desarrollo iterativo y pruebas con Vitest) Vite es la opción más equilibrada.

### TypeScript vs JavaScript

TypeScript aporta detección temprana de errores y documentación implícita mediante tipos. Para equipos que mantienen el código a medio/largo plazo y que interactúan con APIs (backend Flask), TypeScript reduce bugs por desajuste en contratos JSON.

---

## Backend: comparativa detallada

### Opción elegida: Flask (+ PyMongo)

Ventajas principales:
- Ligero y expresivo: permite crear APIs REST de forma rápida y clara.
- Flexibilidad para estructurar la aplicación con Blueprints y control fino de middlewares.
- Integración sencilla con librerías como `flask_pymongo`, `flask-jwt-extended`, y testing con `pytest`.

Inconvenientes:
- Menos “opinión” sobre la estructura global del proyecto, por lo que el equipo debe definir convenciones propias.

Por qué se eligió: ideal para el tamaño del proyecto y para iterar rápido sobre endpoints y lógica. Flask minimiza el “boilerplate” y facilita el aprendizaje y la incorporación de colaboradores con conocimientos básicos de Python.

### Alternativa: Django

Ventajas:
- Ofrece muchas funcionalidades integradas (ORM, admin, autenticación), ideal para aplicaciones con lógica de datos compleja.

Inconvenientes:
- Mayor peso y complejidad; para una API ligera puede ser excesivo.

Cuando habría sido preferible: si se necesitara un panel administrativo completo, ORM robusto y convenciones muy estrictas desde el inicio.

### Alternativa: FastAPI

Ventajas:
- Excelente rendimiento asíncrono, tipado explícito con Pydantic y generación automática de documentación OpenAPI.

Inconvenientes:
- Requiere pensar en asincronía y en la validación con Pydantic; curva ligeramente mayor si el equipo no ha trabajado con ASGI o async en Python.

Cuando habría sido preferible: si se priorizara rendimiento y una documentación OpenAPI automática y consistente.

---

## Integración frontend-backend y buenas prácticas

## Elección de la base de datos: MongoDB

NOTA: MongoDB no es un "framework" sino una base de datos NoSQL orientada a documentos. Se ha elegido como almacén principal en este proyecto; a continuación se justifica la elección y se comparan alternativas.

Ventajas de MongoDB:
- Modelo de documentos (JSON-like) que encaja naturalmente con APIs REST que envían/reciben JSON.
- Esquema flexible: permite iterar rápidamente sobre el modelo de datos sin migraciones estrictas.
- Buena integración con Python a través de `pymongo`/`flask_pymongo`, y con otros entornos mediante drivers oficiales.
- Facilita almacenar objetos anidados (por ejemplo: ofertas con metadatos, listas de imágenes, horarios) sin complejas relaciones.

Inconvenientes:
- No es relacional: consultas que requieren joins complejos pueden ser menos eficientes o más verbosas que en un RDBMS.
- Consistencia eventual en ciertos escenarios; si la aplicación requiere transacciones complejas muy estrictas, puede ser más complicado.

Alternativas consideradas:
- PostgreSQL / MySQL: bases de datos relacionales maduras, con soporte transaccional fuerte y consultas complejas. Preferibles si el dominio requiere integridad referencial y consultas SQL avanzadas.
- SQLite: buena para prototipos o entornos embebidos, pero no para producción con concurrencia alta.

Por qué se eligió MongoDB: la naturaleza de los datos del proyecto (documentos de ofertas, bookings con campos variables, datos de usuario con propiedades opcionales) beneficia de un esquema flexible. Además, la integración rápida en Flask usando `flask_pymongo` y la correspondencia con JSON/TypeScript en el frontend facilitan el desarrollo y reducen el impedance mismatch.


- Prefijo API: el backend expone rutas bajo `/api/*`; el frontend debe apuntar a ese prefijo para mantener separación clara entre UI y API.
- CORS: `backend/__init__.py` habilita CORS para permitir peticiones desde el origen del frontend en desarrollo.
- Tipado compartido: modelar los DTOs/respuestas en TypeScript ayuda a detectar desajustes con la API de Flask. Documentar los contratos JSON (por ejemplo con ejemplos en README o con OpenAPI/Swagger) es recomendable.
- Optimización de producción: hacer code-splitting, compresión y revisar dependencias no usadas para mantener bundles pequeños; en backend, controlar la serialización de datos y usar índices en MongoDB para consultas frecuentes.

---

## Conclusión

La elección de React + Vite + TypeScript para el frontend y Flask para el backend responde a un equilibrio entre rapidez de desarrollo, simplicidad y capacidad de mantenimiento. Las alternativas (Angular/Streamlit en frontend, Django/FastAPI en backend, y bases de datos relacionales como PostgreSQL como alternativa a MongoDB) son válidas y ofrecen ventajas puntuales, pero para los requisitos y el equipo actual la combinación seleccionada proporciona la mejor relación esfuerzo/beneficio.

Si quieres, puedo añadir al documento enlaces oficiales (React, Vite, Flask, FastAPI, Django) y ejemplos breves de configuración (`vite.config.ts`, fragmento de `Flask` app) o una tabla comparativa más compacta.

## Documentación adicional
- `frontend/package.json` (dependencias y scripts)
- `frontend/vite.config.ts` (configuración de Vite y plugins)
- `backend/__init__.py` (creación de la app y registro de blueprints)
- [Hito 2](../hito2.md)

