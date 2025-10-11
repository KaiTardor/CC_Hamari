from flask import Blueprint, request, jsonify
from bson import ObjectId
from pymongo import ReturnDocument
from backend import mongo
from backend.utils.utils import *


bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route("/", methods=["GET"])
def list_bookings():
    """
    Listar las reservas disponibles 
    """
    client_dni = request.args.get("dni")
    offer_id = request.args.get("offer_id")
    q = {}
    if client_dni:
        q["client_dni"] = normalize_dni(client_dni)
    if offer_id:
        try:
            q["offer_id"] = ObjectId(offer_id)
        except Exception:
            return jsonify({"error": "offer_id invalido"}), 400
    docs = list(mongo.db.bookings.find(q))
    for d in docs:
        d["_id"] = str(d["_id"])
        d["offer_id"] = str(d["offer_id"])
    return jsonify(docs)

@bookings_bp.route('/', methods=['POST'])
def create_booking():
    """
    Crear una nueva reserva partiendo de una oferta disponible 
    """
    data = request.get_json(force=True)
    offer_id = data.get('offer_id')
    client_dni = normalize_dni(data.get('client_dni'))
    date_str = data.get('date')  # Espera formato 'YYYY-MM-DD'

    if not offer_id or not client_dni or not date_str:
        return jsonify({"error": "offer_id, client_dni y date son obligatorios"}), 400
    
    try: 
        _offer_id = ObjectId(offer_id)
    except Exception:
        return jsonify({"error": "offer_id inválido"}), 400
    
    if not mongo.db.clients.find_one({"dni": client_dni}):
        return jsonify({"error": "El cliente con el DNI proporcionado no existe"}), 404
    
    if not mongo.db.offers.find_one({"_id": _offer_id, "is_active": True}):
        return jsonify({"error": "La oferta no existe o no está disponible"}), 404


    inv = mongo.db.offer_inventory.find_one_and_update(
        {"offer_id": _offer_id, "date": date_str,
         "$expr": {"$lt": ["$booked", "$capacity"]}},
        {"$inc": {"booked": 1}},
        return_document=ReturnDocument.AFTER
    )
    if not inv:
        return jsonify({"error": "No hay disponibilidad para la fecha seleccionada"}), 409
    
    res_doc = {
        "offer_id": _offer_id,
        "client_dni": client_dni,
        "date": date_str,
        "status": "PENDING"
    }

    ins = mongo.db.bookings.insert_one(res_doc)
    res_doc["_id"] = str(ins.inserted_id)
    res_doc["offer_id"] = offer_id
    return jsonify(res_doc), 201

@bookings_bp.route("/lookup", methods=["GET"])
def lookup_booking():
    """
    Buscar una reserva por su ID o por el DNI del cliente
    """
    offer_id = request.args.get("offer_id")
    client_dni = normalize_dni(request.args.get("client_dni"))

    try:
        _id = ObjectId(offer_id)
    except Exception:
        return jsonify({"error": "offer_id inválido"}), 400

    booking = mongo.db.bookings.find_one({"offer_id": _id, "client_dni": client_dni})
    if not booking:
        return jsonify({"error": "Reserva no encontrada"}), 404

    offer = mongo.db.offers.find_one({"_id": _id}, {"_id": 0})
    booking["_id"] = str(booking["_id"])
    booking["offer_id"] = str(booking["offer_id"])

    return jsonify({"booking": booking, "offer": offer})


@bookings_bp.route("/cancel", methods=["POST"])
def delete_booking(booking_id):
    """
    Cancelar una reserva existente
    """
    try: 
        _bid = ObjectId(booking_id)
    except Exception:
        return jsonify({"error": "booking_id inválido"}), 400
    
    bk = mongo.db.bookings.find_one({"_id": _bid})
    if not bk:
        return jsonify({"error": "Reserva no encontrada"}), 404
    mongo.db.offer_inventory.update_one(
        {"offer_id": bk["offer_id"], "date": bk["date"]},
        {"$inc": {"booked": -1}}
    )
    res = mongo.db.bookings.delete_one({"_id": _bid})
    if res.deleted_count == 0:
        return jsonify({"error": "No se pudo cancelar la reserva"}), 400
    return jsonify({"message": "Reserva cancelada"}), 200

@bookings_bp.route("<booking_id>/status", methods=["PUT", "PATCH"])
def update_booking_status(booking_id):
    """
    Actualizar el estado de una reserva reservada
    """
    data = request.get_json(force=True)
    new_status = data.get("status")
    if new_status not in ["PENDING", "CONFIRMED", "CANCELLED"]:
        return jsonify({"error": "Estado inválido"}), 400
    
    try: 
        _bid = ObjectId(booking_id)
    except Exception:
        return jsonify({"error": "booking_id inválido"}), 400
    
    if new_status == "CANCELLED":
        bk = mongo.db.bookings.find_one({"_id": _bid})
        if not bk:
            return jsonify({"error": "Reserva no encontrada"}), 404
        mongo.db.offer_inventory.update_one(
            {"offer_id": bk["offer_id"], "date": bk["date"]},
            {"$inc": {"booked": -1}}
        )

    res = mongo.db.bookings.update_one(
        {"_id": _bid},
        {"$set": {"status": new_status}}
    )
    if res.modified_count == 0:
        return jsonify({"error": "No se pudo actualizar el estado de la reserva"}), 404

    return jsonify({"ok": True})
