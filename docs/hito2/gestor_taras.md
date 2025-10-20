# Comparación de Task Managers disponibles

Un gestor de tareas es una herramienta que permite automatizar comandos repetitivos del proyecto y gestionar el flujo del trabajo, como la ejecución de pruebas, analizar el código, etc. 

Podemos contar con algunos ejemplos como: 

## Make 
Make es una herramienta de Unix utilizado originalmente para compilar proyectos en C y C++, pero hoy en día se usa también como gestor de tareas. Utiliza un archivo (Mkaefile) en el que se define las reglas y comandos.

### Ventajas
- Simple, rápido y versátil. 
- Experiencia en usarlo en el grado . 
- Se integra facilmente con proyectos. 

### Inconvenientes
- Poco portable a Windows
- No está basado en Python

[Link de referencia](https://www.gnu.org/software/make/)

## Invoke 
Es un gestor de tareas escrito en Python que permite definir funciones como tareas mediante CLI. 

### Ventajas
- Sintaxis identica a la que se usa en Python.
- Aprovecha el ecositema Python (entornos virtuales, dependencias, etc).
- Linea de comandos intuitiva. 

### Inconvenientes
- Más lento que el Make.

[Link de referencia](https://www.pyinvoke.org/)

## Poetry
Es una herramienta para la gestión de dependencias y empaquetado en Python, que tambien permite definir y ejecutar scripts como tareas. 

### Ventajas
- Permite gestionar las dependencias, entornos virtuales en una sola herramienta.
- Integración sencilla con sistemas CI.

### Inconvenientes
- Más orientado a la gestión de dependencias.
- Menos flexible que Invoke o Make.

[Link de referencia](https://python-poetry.org/)

## Conclusión 
En definitiva, se va a usar Invoke debido a que se puede integrar bien con el entorno Python del proyecto, dado su facilidad de uso por su sintaxis y también por poder automatizar tareas comunes directamente desde las funciones.

## Documentación adicional
- [Hito 2](../hito2.md)
- [Biblioteca de aserciones](./biblioteca_aser.md)
- [Marco de pruebas](./marco_pruebas.md)
- [Gestor de integración continua](./gestor_ic.md)