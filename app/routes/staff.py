from flask import Blueprint, request, jsonify
from .. import mongo
from ..utils.utils import *

staff_bp = Blueprint("staff", __name__)

@staff_bp.route("/", methods=["POST"])
def create_staff():
    """
    Añade un nuevo empleado
    """
    data = request.get_json(force=True)
    required = ["dni","name","surname","email","phone"]
    if any(k not in data for k in required):
        return jsonify({"error": f"Faltan campos: {required}"}), 400

    if not is_valid_email(data["email"]):
        return jsonify({"error": "email inválido"}), 400
    if not is_valid_phone(data["phone"]):
        return jsonify({"error": "phone inválido"}), 400

    dni = normalize_dni(data["dni"])
    if mongo.db.staff.find_one({"dni": dni}):
        return jsonify({"error": "Empleado ya existe"}), 409

    doc = {
        "dni": dni,
        "name": data["name"],
        "surname": data["surname"],
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
    Detalle los datos de un empleado concreto
    """
    doc = mongo.db.staff.find_one({"dni": normalize_dni(dni)}, {"_id": 0})
    if not doc:
        return jsonify({"error": "Empleado no encontrado"}), 404
    return jsonify(doc)

@staff_bp.route("/<dni>", methods=["PUT","PATCH"])
def update_staff(dni):
    """
    Actualiza los datos de un empleado concreto
    """
    data = request.get_json(force=True)
    if "email" in data and data["email"] and not is_valid_email(data["email"]):
        return jsonify({"error": "email inválido"}), 400
    if "phone" in data and data["phone"] and not is_valid_phone(data["phone"]):
        return jsonify({"error": "phone inválido"}), 400

    allowed = {"name","surname","email","phone"}
    update = {k: v for k, v in data.items() if k in allowed}
    if not update:
        return jsonify({"error": "Nada que actualizar"}), 400
    r = mongo.db.staff.update_one({"dni": normalize_dni(dni)}, {"$set": update})
    if r.matched_count == 0:
        return jsonify({"error": "Empleado no encontrado"}), 404
    return jsonify({"ok": True})

@staff_bp.route("/<dni>", methods=["DELETE"])
def delete_staff(dni):
    r = mongo.db.staff.delete_one({"dni": normalize_dni(dni)})
    if r.deleted_count == 0:
        return jsonify({"error": "Empleado no encontrado"}), 404
    return jsonify({"ok": True})
