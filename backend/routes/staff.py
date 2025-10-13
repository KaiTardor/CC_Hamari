from flask import Blueprint, request, jsonify
from backend import mongo
from ..utils.utils import *

staff_bp = Blueprint("staff", __name__)

@staff_bp.route("/", methods=["POST"])
def create_staff():
    """
    Crear un nuevo empleado.
    Informacion esperada: dni, name, surname, email, phone.
    Campos opcionales: sex, birth_date.
    """
    data = request.get_json(force=True)
    required = ["dni","name","surname","email","phone"]
    if any(k not in data for k in required):
        return jsonify({"error": "Faltan campos obligatorios. Los campos requeridos son: " + ", ".join(required)}), 400

    # Validaciones de formato
    if "email" not in data and data["email"] and not is_valid_email(data["email"]):
        return jsonify({"error": "Email no válido"}), 400
    if "phone" in data and data["phone"] and not is_valid_phone(data["phone"]):
        return jsonify({"error": "Teléfono no válido"}), 400

    dni = normalize_dni(data["dni"])
    if mongo.db.staff.find_one({"dni": dni}):
        return jsonify({"error": "Empleado ya existe"}), 409

    doc = {
        "dni": dni,
        "name": data["name"],
        "surname": data["surname"],
        "sex": data.get("sex",""),
        "birth_date": data.get("birth_date",""),
        "email": data["email"],
        "phone": data["phone"]
    }
    mongo.db.staff.insert_one(doc)
    return jsonify({"Message": "Empleado creado", "dni": dni}), 201

@staff_bp.route("/", methods=["GET"])
def list_staff():
    """
    Lista todos los empleados
    """
    docs = list(mongo.db.staff.find({}, {"_id": 0}))
    return jsonify(docs)

@staff_bp.route("/<dni>", methods=["GET"])
def staff_detail(dni):
    """
    Devolver detalles de un empleado por DNI identificado.
    """
    doc = mongo.db.staff.find_one({"dni": normalize_dni(dni)}, {"_id": 0})
    if not doc:
        return jsonify({"error": "Empleado no encontrado"}), 404
    return jsonify(doc)

@staff_bp.route("/<dni>", methods=["PUT","PATCH"])
def update_staff(dni):
    """
    Actualiza informacion de un empleado concreto
    """
    data = request.get_json(force=True)
    if "email" in data and data["email"] and not is_valid_email(data["email"]):
        return jsonify({"error": "Email no válido"}), 400
    if "phone" in data and data["phone"] and not is_valid_phone(data["phone"]):
        return jsonify({"error": "Teléfono no válido"}), 400

    allowed = ["name", "surname", "sex", "birth_date", "email", "phone"]
    update = {k: v for k, v in data.items() if k in allowed}
    if not update:
        return jsonify({"error": "No hay campos para actualizar"}), 400
    res = mongo.db.staff.update_one(
        {"dni": normalize_dni(dni)},
        {"$set": update}
    )
    if res.modified_count == 0:
        return jsonify({"error": "No se pudo actualizar el empleado"}), 400
    return jsonify({"message": "Empleado actualizado"}), 200

@staff_bp.route("/<dni>", methods=["DELETE"])
def delete_staff(dni):
    """
    Elimina un empleado por DNI
    """
    r = mongo.db.staff.delete_one({"dni": normalize_dni(dni)})
    if r.deleted_count == 0:
        return jsonify({"error": "Empleado no encontrado"}), 404
    return jsonify({"ok": True})
