from flask import Blueprint, request, jsonify
from backend import mongo
from ..utils.utils import *

providers_bp = Blueprint('providers', __name__)

@providers_bp.route('/', methods=['POST'])
def create_provider():
    """ 
    Crea un nuevo proveedor
    Informacion esperada: dni, company_name, email, phone
    Campos opcionales: contact_name, contact_surname
    """
    data = request.get_json(force=True)
    if "dni" not in data or "company_name" not in data or "email" not in data or "phone" not in data:
        return jsonify({"error": "DNI, nombre de empresa, email y teléfono son obligatorios"}), 400

    if "email" not in data and data["email"] and not is_valid_email(data["email"]):
        return jsonify({"error": "Email no válido"}), 400
    if "phone" in data and data["phone"] and not is_valid_phone(data["phone"]):
        return jsonify({"error": "Teléfono no válido"}), 400

    data["dni"] = normalize_dni(data["dni"])
    if mongo.db.providers.find_one({"dni": data["dni"]}):
        return jsonify({"error": "El proveedor ya existe"}), 400
    
    doc = {
        "dni": data["dni"],
        "contact_name": data.get("contact_name"),
        "contact_surname": data.get("contact_surname"),
        "company_name": data["company_name"],
        "email": data.get("email"),
        "phone": data.get("phone")
    }

    if mongo.db.providers.find_one({"dni": doc["dni"]}):
        return jsonify({"error": "El proveedor ya existe"}), 400

    mongo.db.providers.insert_one(doc)
    return jsonify({"message": "Proveedor creado", "dni": data["dni"]}), 201

@providers_bp.route('/', methods=['GET'])
def list_providers():
    """ 
    Listar todos los proveedores
    """
    docs = list(mongo.db.providers.find(), {"_id": 0})
    return jsonify(docs)

@providers_bp.route('/<dni>', methods=['GET'])
def provider_details(dni):
    """ 
    Devuelve los ofertas de un proveedor dado su dni
    """
    dni = normalize_dni(dni)
    prov = mongo.db.providers.find_one({"dni": dni})
    if not prov:
        return jsonify({"error": "Proveedor no encontrado"}), 404
    
    offers = list (mongo.db.offers.find({"provider_dni": dni}))
    offer_ids = [o["_id"] for o in offers]
    sales_count = mongo.db.bookings.count_documents({"offer_id": {"$in": offer_ids}})

    for o in offers:
        o["_id"] = str(o["_id"])
    prov["_id"] = str(prov["_id"])

    return jsonify({
        "provider": prov,
        "offers": offers,
        "sales_count": sales_count
    })

@providers_bp.route("/<dni>", methods=["PUT", "PATCH"])
def update_provider(dni):
    """ 
    Actualiza los datos de un proveedor
    """
    data = request.get_json(force=True)

    if "email" in data and not is_valid_email(data["email"]):
        return jsonify({"error": "Email no válido"}), 400
    if "phone" in data and not is_valid_phone(data["phone"]):
        return jsonify({"error": "Teléfono no válido"}), 400
    
    allowed = {"company_name", "contact_name", "contact_surname", "email", "phone"}
    update = {k: v for k, v in data.items() if k in allowed}
    if not update:
        return jsonify({"error": "No hay campos para actualizar"}), 400
    
    res = mongo.db.providers.update_one(
        {"dni": normalize_dni(dni)},
        {"$set": update}
    )
    
    if res.matched_count == 0:
        return jsonify({"error": "Proveedor no encontrado"}), 404
    return jsonify({"message": "Proveedor actualizado"}), 200

@providers_bp.route("/<dni>", methods=["DELETE"])
def delete_provider(dni):
    """ 
    Elimina un proveedor
    """
    dni = normalize_dni(dni)
    res = mongo.db.providers.delete_one({"dni": dni})
    if res.deleted_count == 0:
        return jsonify({"error": "Proveedor no encontrado"}), 404
    
    # También eliminamos sus ofertas y las reservas asociadas a esas ofertas
    offers = list(mongo.db.offers.find({"provider_dni": dni}, {"_id": 1}))
    offer_ids = [o["_id"] for o in offers]
    if offer_ids:
        mongo.db.offers.delete_many({"_id": {"$in": offer_ids}})
        mongo.db.offer_inventory.delete_many({"offer_id": {"$in": offer_ids}})
        mongo.db.bookings.delete_many({"offer_id": {"$in": offer_ids}})
    return jsonify({"message": "Proveedor y sus ofertas eliminados"}), 200