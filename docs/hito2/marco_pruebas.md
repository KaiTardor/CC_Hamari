# Comparación de Marcos de pruebas disponibles

Un marco de pruebas es una herramienta que permite automatizar la ejecución de tests para verificar que el código funciona correctamente y detectar errores de forma temprana.

Se va a nombrar los mismos que la biblioteca de aserciones, ya que en muchas ocasiones el propio framework incluye su propio sistema de aserciones.

## Pytest

Pytest es el marco de pruebas más popular en Python y proporciona su propio sistema de aserciones mejorado a partir de las aserciones nativas de Python.

### Ventajas
- Sintaxis sencilla y legible, usa la palabra clave assert nativa. 
- Alta compatibilidad de plugins para extender las funcionalidades. 
- Comunidad muy activa y amplia documentación.

### Inconvenientes
- Su potencia puede ser excesiva para proyectos muy pequeños o pruebas demasidados simples.

[Link de referencia](https://docs.pytest.org/en/stable/)

##  Unittest

Unittest es la biblioteca de pruebas incluida en la librería estándar de Python.

### Ventajas
- Viene integrada con Python, sin necesidad de dependencias externas.
- Compatible con la mayoría de los entornos de desarrollo de CI.

### Inconvenientes
- Sintaxis más verbosa y menos legible que pytest.
- Requiere estructurar las pruebas en clases, lo que puede ser más rígido.

[Link de referencia](https://docs.python.org/3/library/unittest.html)

## Conclusión 
En definitiva, se va a usar Pytest porque ofrece una sintaxis sencilla, mensajes de error claros y una gran integración con el resto del ecosistema de pruebas. Además, su sistema de aserciones basado en assert hace que las pruebas sean más legibles y fáciles de mantener, lo que resulta ideal para el desarrollo con Flask y MongoDB.

## Documentación adicional
- [Hito 2](../hito2.md)
- [Gestor de tareas](./gestor_taras.md)
- [Biblioteca de aserciones](./biblioteca_aser.md)
- [Gestor de integración continua](./gestor_ic.md)