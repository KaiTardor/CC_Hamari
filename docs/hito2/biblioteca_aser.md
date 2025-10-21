# Comparación de Bibliotecas de Aserciones disponibles

Una biblioteca de aserciones es un conjunto de herramientas que permiten verificar si el comportamiento del código cumple con lo esperado durante la ejecución de las pruebas. Las aserciones son expresiones que deben evaluarse como verdaderas, pues si no lo hacen la prueba fallaría y señalizaría el error. 

Podemos contar con algunos ejemplos como: 

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

## Hamcrest
Hamcrest es una biblioteca que permite escribir aserciones más expresivas mediante el uso de matchers (comparadores), siguiendo un estilo declarativo (“matcher-based”).

### Ventajas
- Permite escribir aserciones legibles y descriptiva
- Se puede combinar con otros frameworks de pruebas.

### Inconvenientes
- Requiere aprender una nueva sintaxis de matchers.
- Más habitual en entornos con Java que en Python. 

[Link de referencia](https://github.com/hamcrest/PyHamcrest)

## Conclusión 
En definitiva, se va a usar Pytest porque ofrece una sintaxis sencilla, mensajes de error claros y una gran integración con el resto del ecosistema de pruebas. Además, su sistema de aserciones basado en assert hace que las pruebas sean más legibles y fáciles de mantener, lo que resulta ideal para el desarrollo con Flask y MongoDB.

## Documentación adicional
- [Hito 2](../hito2.md)
- [Gestor de tareas](./gestor_taras.md)
- [Marco de pruebas](./marco_pruebas.md)
- [Gestor de integración continua](./gestor_ic.md)