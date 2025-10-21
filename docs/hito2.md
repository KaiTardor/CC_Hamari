# Hito 2

*Version 0.1*

## Configuración de la integración continua

Para desarrollar la integración continua del proyecto se ha realizado las siguientes configuraciones e implementaciones, que se pueden dividir en los siguientes apartados: 

## Gestor de tareas
Se utiliza Invoke como gestor de tareas para automatizar acciones comunes del proyecto (como levantar contenedores, gestionar la base de datos, ejecutar tests o construir el frontend).

### Instalación
Primero hay que instalarlo, que se puede hacer de forma manual con el comando: 

```
sudo apt uninstall python3-invoke
```

o mediante el fichero deploy.bash para configurar directamente el entorno. Más información en el fichero de [requisitos.md](requisitos.md). 

### Estructura de tareas
Las dististan tareas estan organizadas en la carpeta *tasks/*, agrupadas por servicio:

```
tasks/
├── __init__.py ├── app.py (backend) ├── db.py ├── docker.py └── front.py 

```

### Uso básico

Listar las tareas disponibles:
```
inv -l
```

Ejemplo simplificado de salida:

```
    app.fmt         Formatear el código del backend de la aplicación con ruff.
    app.logs        Ver los logs del backend de la aplicación.
    app.ping        Hacer ping al backend de la aplicación para comprobar si está activo.        
    app.restart     Reiniciar el backend de la aplicación.
    .
    .
    .
```

Ejecutar alguna tarea concreta:
```
inv (nombre_tarea)
```
 
## Marco de pruebas y Librería de Aserciones

Tal como se ha indicado, la librería empleada en el marco de pruebas y en la librería de aserciones el **PyTest**, que es una herramienta que permite verificar el comportamiento del código.

### Instalación 
Tal como el gestor de tareas, se puede instalar de forma manual mediante el comando:
```
sudo apt install python3-invoke
```

o mismamente, se configurar al ejecutar el fichero deploy.bash

### Estructura de tareas
Los distintos test estan dentro de la carpeta *backend/test/*:

```
backend/tests/
├── conftest.py                
├── test_auth.py               # Tests de autenticación y autorización
├── test_bookings_api.py       # Tests de gestión de reservas
├── test_offers_api.py         # Tests de gestión de ofertas
├── test_clients_api.py        # Tests de gestión de clientes
├── test_providers_api.py      # Tests de gestión de proveedores
└── test_staff_api.py          # Tests de gestión de personal
```

### Uso básico

Ejecutar los distintos tests:

```
python -m pytest -q
```

Ejecutar tests de un archivo específico:

```
python -m pytest backend/tests/test_auth.py -v
```

Ejecutar un test concreto:

```
python -m pytest backend/tests/test_auth.py::test_login_ok -v
```

*Algunos tests se han generado mediante el uso de Copilot, concretamente los de para verificar las operaciones CRUD de clientes, proveedores y personal*

## Gestor de integración continua

Como se ha indicado, se va a utilizar **GitHub Actions** como sistema de integración continua para ejecutar automáticamente los tests en cada push y pull request.

### Configuración

El workflow de CI está definido en `.github/workflows/tests.yml` y se ejecuta automáticamente cuando:
- Se hace push a las ramas `main` o `Test`
- Se crea un pull request hacia `main`

### Características del workflow

1. **Matriz de versiones Python**: Los tests se ejecutan en algunos versiones de Python para asegurar compatibilidad.

2. **Base de datos de test**: Se levanta un contenedor MongoDB 7 como servicio para los tests, con health checks automáticos.

3. **Pasos del pipeline**:
   - Checkout del código
   - Configuración de Python con caché de dependencias
   - Instalación de dependencias desde `requirements.txt`
   - Verificación de formato de código con `ruff`
   - Ejecución de tests con `pytest`
   - Generación de reporte de cobertura (solo en Python 3.11)

4. **Variables de entorno**: Se configuran automáticamente:
   ```
   MONGO_URI: mongodb://localhost:27017/HamariDB_test
   JWT_SECRET: test-secret-key-for-ci
   ```

### Visualización de resultados

Los resultados de cada ejecución se pueden ver en:
- La pestaña "Actions" del repositorio de GitHub
- Los checks automáticos en cada pull request

## Documentación adicional
- [Gestor de tareas](./hito2/gestor_taras.md)
- [Biblioteca de aserciones](./hito2/biblioteca_aser.md)
- [Marco de pruebas](./hito2/marco_pruebas.md)
- [Gestor de integración continua](./gestor_ic.md)
- [Requisitos y uso del repositorio](./requisitos.md)
