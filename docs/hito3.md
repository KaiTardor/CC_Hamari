# Hito 3

*Version 0.1*

## Diseño de microservicios

El diseño implementado para el desarrollo del proyecto se basa en una arquitectura compuesta por dos grandes componentes:

1. **La aplicación web (Frontend)**
2. **La API REST (Backend)**

Ambos módulos se comunican a través de peticiones HTTP, y el sistema en su conjunto utiliza una base de datos MongoDB para la persistencia de la información.

---

## Aplicación Web (Frontend)

El frontend está desarrollado como una **Single Page Application (SPA)** utilizando **React** y **Vite**, ubicada en el directorio `frontend/`.
Este componente implementa las vistas principales y consume la API a través de funciones definidas en `frontend/src/api.ts`.

Las páginas principales disponibles en la aplicación son:

* `/` — Página principal (Home)
* `/login` — Inicio de sesión
* `/register` — Registro de nuevos usuarios
* `/offers`, `/offers/:id`, `/offers/create` — Gestión y visualización de ofertas
* `/bookings`, `/bookings/lookup` — Consulta y administración de reservas
* `/providers`, `/staff`, `/admin/users` — Secciones administrativas y de gestión interna

---

## API REST (Backend)

El backend está implementado en **Flask** y organizado mediante **Blueprints** (uno por dominio funcional).
Cada dominio se apoya en una capa de servicios ubicada en `backend/services/`, encargada de la lógica de negocio y las validaciones.

La API se expone bajo el prefijo `/api/*`, e incluye además una ruta raíz (`GET /`) que actúa como **comprobación básica de estado (healthcheck)**.
La base de datos utilizada es **MongoDB**, gestionada mediante contenedores definidos en `docker-compose.yml`.

---

### Dominios y Responsabilidades

* **Auth (`/api/auth`)**
  Gestiona el inicio de sesión, el registro y la emisión/validación de tokens JWT.
  Incluye la creación administrativa de usuarios.

* **Offers (`/api/offers`)**
  Administra las ofertas publicadas por los proveedores, sus precios e inventario por fecha.
  Permite realizar búsquedas y verificar la disponibilidad de ofertas.

* **Bookings (`/api/bookings`)**
  Controla el ciclo de vida de las reservas: creación, actualización de inventario, cambio de estado (`PENDING`, `CONFIRMED`, `CANCELLED`) y consultas administrativas.

* **Clients (`/api/clients`)**
  Almacena y gestiona la información de los clientes, junto con su historial de reservas.

* **Providers (`/api/providers`)**
  Registra los datos de los proveedores (empresa y contacto) y coordina las operaciones relacionadas con sus ofertas.
  Aplica operaciones en cascada en casos de actualización o eliminación.

* **Staff (`/api/staff`)**
  Proporciona herramientas internas de administración y soporte, incluyendo confirmaciones, anulaciones y consultas avanzadas.

---

### Convenciones y Estructura de la API

* **Prefijo general:** `/api/<domain>` (por ejemplo: `/api/offers`, `/api/bookings`)

* **Convenciones CRUD por recurso:**

  * `GET /api/<resource>` — Listado (con filtros por *querystring*)
  * `POST /api/<resource>` — Creación de nuevo recurso
  * `GET /api/<resource>/{id}` — Consulta detallada
  * `PUT` o `PATCH /api/<resource>/{id}` — Actualización
  * `DELETE /api/<resource>/{id}` — Eliminación

* **Endpoints especiales destacados:**

  * `/lookup` — Búsquedas administrativas (ej.: `/api/offers/lookup`)
  * `/api/offers/{id}/availability?date=DD/MM/AAAA` — Consulta de inventario por fecha
  * `/api/bookings/{id}/status` — Cambio de estado de una reserva
  * `/api/auth`:

    * `POST /login` — Autenticación de usuarios
    * `POST /register` — Registro de nuevos usuarios
    * `POST /users/create` — Creación administrativa
    * `GET /me` — Información del usuario autenticado

* **Seguridad y gestión de errores:**

  * Autenticación mediante **JWT**, usando el encabezado `Authorization: Bearer <token>`
  * Control de acceso por roles mediante el decorador `require_roles`
  * Códigos de error comunes:

    * `400` — Error de validación
    * `401` — No autorizado
    * `403` — Acceso prohibido
    * `404` — No encontrado
    * `409` — Conflicto o duplicado

---

### Ejemplos de Uso

**Autenticación (Login):**

```
POST /api/auth/login
Body: { "username": "user", "password": "pw" }
```

**Consultar disponibilidad de una oferta:**

```
GET /api/offers/{offer_id}/availability?date=10/12/2025
Header: Authorization: Bearer <token>
```

**Crear una reserva (cliente):**

```
POST /api/bookings
Header: Authorization: Bearer <token>
Body: { "offer_id": "...", "client_dni": "12345678A", "date": "10/12/2025" }
```

## Sistema de logs
