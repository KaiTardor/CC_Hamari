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

o mediante el fichero deploy.bash para configurar directamente el entorno. Más información en el fichero de requisitos.rd enlazado en documentación adicional. 

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
    ...
```

Ejecutar alguna tarea concreta:
```
inv (nombre_tarea)
```
 
## Marco de pruebas y Librería de Aserciones

Tal como se ha indicado, la librería empleada en el marco de pruebas y en la librería de aserciones el **PyTest**, 

## Gestor de integración continua

## Documentación adicional
- [Gestor de tareas](./hito2/gestor_taras.md)
- [Biblioteca de aserciones](./hito2/biblioteca_aser.md)
- [Marco de pruebas](./hito2/marco_pruebas.md)
- [Gestor de integración continua](./gestor_ic.md)
- [Requisitos y uso del repositorio](./requisitos.md)
