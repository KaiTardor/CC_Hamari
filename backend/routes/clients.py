from flask import Blueprint, request, jsonify
from backend import mongo
from ..utils.utils import * 

clients_bp = Blueprint('clients', __name__)

@clients_bp.route("/", methods=["POST"])
def create_client():
    data = request.get_json(force=True)
    required = ["dni", "name", "surname", "phone", "email"]
    if any(k not in data for k in required):
        return jsonify({"error": "Faltan campos obligatorios. Los campos requeridos son: " + ", ".join(required)}), 400
    
    if "email" not in data and data["email"] and not is_valid_email(data["email"]):
        return jsonify({"error": "Email no válido"}), 400
    if "phone" in data and data["phone"] and not is_valid_phone(data["phone"]):
        return jsonify({"error": "Teléfono no válido"}), 400
    
    doc = {
        "dni": normalize_dni(data["dni"]),
        "name": data["name"],
        "surname": data["surname"],
        "sex": data.get("sex", ""),
        "birth_date": data.get("birth_date", ""),
        "email": data["email"],
        "phone": data["phone"]
    }

    if mongo.db.clients.find_one({"dni": doc["dni"]}):
        return jsonify({"error": "El cliente ya existe"}), 400
    mongo.db.clients.insert_one(doc)
    return jsonify({"message": "Cliente con dni " + doc["dni"] + " creado"}), 201

@clients_bp.route("/", methods=["GET"])
def list_clients():
    clients = list(mongo.db.clients.find({}, {"_id": 0}))
    return jsonify(clients), 200

@clients_bp.route("/<dni>", methods=["GET"])
def client_detail(dni):
    doc = mongo.db.clients.find_one({"dni": normalize_dni(dni)}, {"_id": 0})
    if not doc:
        return jsonify({"error": "Cliente no encontrado"}), 404
    return jsonify(doc), 200

@clients_bp.route("/<dni>", methods=["PUT", "PATCH"])
def update_client(dni):
    data = request.get_json(force=True)
    if "email" in data and not is_valid_email(data["email"]):
        return jsonify({"error": "Email no válido"}), 400
    if "phone" in data and not is_valid_phone(data["phone"]):
        return jsonify({"error": "Teléfono no válido"}), 400

    allowed = ["name", "surname", "sex", "birth_date", "email", "phone"]
    update = {k: v for k, v in data.items() if k in allowed}
    if not update:
        return jsonify({"error": "No hay campos para actualizar"}), 400
    res = mongo.db.clients.update_one(
        {"dni": normalize_dni(dni)},
        {"$set": update}
    )
    if res.modified_count == 0:
        return jsonify({"error": "No se pudo actualizar el cliente"}), 400
    return jsonify({"message": "Cliente actualizado"}), 200


@clients_bp.route("/<dni>", methods=["DELETE"])
def delete_client(dni):
    res = mongo.db.clients.delete_one({"dni": normalize_dni(dni)})
    if res.deleted_count == 0:
        return jsonify({"error": "Cliente no encontrado"}), 404
    
    mongo.db.bookings.delete_many({"client_dni": normalize_dni(dni)})
    return jsonify({"message": "Cliente eliminado"}), 200