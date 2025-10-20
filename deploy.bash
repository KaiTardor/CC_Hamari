#!/bin/bash

VENV_DIR="venv"
REQUIREMENTS_FILE="requirements.txt"

if [ -d "$VENV_DIR" ]; then
    echo "Entorno virtual encontrado: $VENV_DIR"
else
    echo "Creando el entorno virtual..."    
    python3 -m venv "$VENV_DIR"
    if [ $? -ne 0 ]; then
        echo "Error al crear el entorno virtual. Saliendo..."
        exit 1
    fi
    echo "Entorno virtual creado."
fi

echo "Activando el entorno virtual..."
source "$VENV_DIR/bin/activate"

if [ -f "$REQUIREMENTS_FILE" ]; then
    echo "Instalando dependencias desde $REQUIREMENTS_FILE..."
    pip install -r "$REQUIREMENTS_FILE"
    if [ $? -ne 0 ]; then
        echo "Error al instalar las dependencias. Saliendo..."
        exit 1
    fi
else
    echo "No se encontró el archivo $REQUIREMENTS_FILE. No se pueden instalar las dependencias."
fi

echo "¡Setup completado!"