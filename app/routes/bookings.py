from flask import Blueprint, request, jsonify
from bson import ObjectId
from pymongo import ReturnDocument
from .. import mongo
from app.utils.utils import *


bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/', methods=['POST'])
def create_booking():
    """
    Crear una nueva reserva cuando hay ofertas disponibles
    """

    data = request.get_json(force=True)
    offer_id = data.get('offer_id')
    client_dni = normalize_dni(data.get('client_dni'))
    date_str = data.get('date')  # Espera formato 'YYYY-MM-DD'
    people = data.get('people', 1)

    if not offer_id or not client_dni or not date_str:
        return jsonify({"error": "offer_id, client_dni y date son obligatorios"}), 400

    if people < 1:
        return jsonify({"error": "Las personas reservadas deben ser al menos 1"}), 400
    
    try: 
        _offer_id = ObjectId(offer_id)
    except Exception:
        return jsonify({"error": "offer_id inválido"}), 400
    
    if not mongo.db.clients.find_one({"dni": client_dni}):
        return jsonify({"error": "El cliente con el DNI proporcionado no existe"}), 404
    
    if not mongo.db.offers.find_one({"_id": _offer_id, "is_active": True}):
        return jsonify({"error": "La oferta no existe o no está disponible"}), 404


    inv = mongo.db.inventories.find_one_and_update(
        {"offer_id": _offer_id, 
         "date": date_str, 
         "$expr": {"$lte": [{"$add": ["$booked", people]}, "$capacity"]}
        },
        {"$inc": {"booked": people}},
        return_document=ReturnDocument.AFTER
    )

    if not inv:
        return jsonify({"error": "No hay disponibilidad para la fecha seleccionada"}), 409
    
    res_doc = {
        "offer_id": _offer_id,
        "client_dni": client_dni,
        "date": date_str,
        "people": people,
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
def cancel_booking():
    """
    Cancelar una reserva existente
    """
    data = request.get_json(force=True)
    booking_id = data.get("booking_id")
    if not booking_id:
        return jsonify({"error": "booking_id es obligatorio"}), 400

    try:
        _bid = ObjectId(booking_id)
    except Exception:
        return jsonify({"error": "booking_id inválido"}), 400

    booking = mongo.db.bookings.find_one({"_id": _bid})
    if not booking:
        return jsonify({"error": "Reserva no encontrada"}), 404

    # Liberar cupos en inventario
    mongo.db.offer_inventory.update_one(
        {"offer_id": booking["offer_id"], "date": booking["date"]},
        {"$inc": {"booked": -int(booking.get("people", 1))}}
    )
    # Cambiar estado
    mongo.db.bookings.update_one({"_id": _bid}, {"$set": {"status": "CANCELLED"}})

    return jsonify({"ok": True})