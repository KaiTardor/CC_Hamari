from flask import Blueprint, request, jsonify
from bson import ObjectId
from .. import mongo
from ..utils.utils import *
from ..utils.dates import *

offers_bp = Blueprint('offers', __name__)


@offers_bp.route('/', methods=['GET'])
def list_offers():
    """
    Lista de ofertas disponibles accesibles mediante filtros:
    - q: texto 
    - city: ciudad 
    - category: categoria
    - min_price, max_price: rango de precios
    - date: DD-MM-AAAA
    """
    q = request.args.get('q')
    city = request.args.get('city')
    cat = request.args.get('category')
    min_price = to_float_or_none(request.args.get('min_price'))
    max_price = to_float_or_none(request.args.get('max_price'))
    date_str = request.args.get('date')

    base_filter = {"is_active": True}

    if q:
        base_filter["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}}
        ]
    if city:
        base_filter["location.city"] = city
    if cat:
        base_filter["category"] = cat
    if min_price is not None or max_price is not None:
        base_filter["price"] = {}
        if min_price is not None:
            base_filter["price"]["$gte"] = min_price
        if max_price is not None:
            base_filter["price"]["$lte"] = max_price

    # Sin fecha -> lista normal
    if not date_str:
        docs = list(mongo.db.offers.find(base_filter))
        for doc in docs:
            doc["_id"] = str(doc["_id"])
        return jsonify(docs)
    
    # con fecha -> mostear con fechas disponibles
    inv_cursor = mongo.db.inventories.find({
        "date": date_str, 
        "$expr": {"$lt": ["$booked", "$capacity"]}
        }, {"offer_id": 1})
    offer_ids = [it["offer_id"] for it in inv_cursor]
                 
    if not offer_ids:
        return jsonify([])
    
    base_filter["_id"] = {"$in": offer_ids}
    docs = list(mongo.db.offers.find(base_filter))
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return jsonify(docs)

@offers_bp.route('/<offer_id>', methods=['GET'])
def offer_detail(offer_id):
    """
    Detalle de una oferta concreta
    """
    try: 
        _id = ObjectId(offer_id)
    except:
        return jsonify({"error": "ID de oferta invalida"}), 400

    doc = mongo.db.offers.find_one({"_id": _id})
    if not doc:
        return jsonify({"error": "Oferta no encontrada"}), 404

    doc["_id"] = str(doc["_id"])
    return jsonify(doc)

@offers_bp.route("/", methods=['POST'])
def create_offer():
    """
    Crear una nueva oferta
    Campos obligatorios:
    - provider_dni
    - title
    - description
    - price
    - people_included
    - available_from
    - available_to
    - daily_capacity
    """
    data = request.get_json(force=True)
    of, msg = validate_offer_data(data)
    if not of:
        return jsonify({"error": msg}), 400
    
    doc = {
        "provider_dni": data["provider_dni"].strip().upper(),
        "title": data["title"],
        "description": data["description"],
        "category": data.get("category"),
        "price": float(data["price"]),
        "people_included": int(data["people_included"]),
        "location": data.get("location", {}),
        "images": data.get("images", []),
        "available_from": data["available_from"],
        "available_to": data["available_to"],
        "daily_capacity": int(data["daily_capacity"]),
        "is_active": data.get("is_active", True)
    }

    res = mongo.db.offers.insert_one(doc)
    offer_id = res.inserted_id

    # Crear inventario diario
    bulk = []
    for d in daterange(data["available_from"], data["available_to"]):
        bulk.append({
            "offer_id": offer_id,
            "date": d,                 # "DD/MM/AAAA"
            "capacity": int(data["daily_capacity"]),
            "booked": 0
        })

    if bulk:
        mongo.db.offer_inventory.insert_many(bulk)

    return jsonify({"message": "Oferta creada", "offer_id": str(offer_id)}), 201

@offers_bp.route("/<offer_id>", methods=['PUT', 'PATCH'])
def update_offer(offer_id):
    """
    Actualizar una oferta existente
    """
    try:
        _id = ObjectId(offer_id)
    except:
        return jsonify({"error": "ID de oferta invalida"}), 400

    data = request.get_json(force=True)
    allowed = {
        "title", 
        "description", 
        "category", 
        "price", 
        "people_included",
        "location", 
        "images", 
        "available_from", 
        "available_to",
        "daily_capacity"
        }
    update = {k: data[k] for k in data.keys() & allowed}
    if "price" in update:
        try:
            update["price"] = float(update["price"])
        except:
            return jsonify({"error": "Precio invalido"}), 400
    if "people_included" in update:
        try:
            update["people_included"] = int(update["people_included"])
        except:
            return jsonify({"error": "Numero de personas invalido"}), 400
    if "daily_capacity" in update:
        try:
            update["daily_capacity"] = int(update["daily_capacity"])
        except:
            return jsonify({"error": "Capacidad diaria invalida"}), 400
        
    if not update:
        return jsonify({"error": "No hay campos validos para actualizar"}), 400
    
    res = mongo.db.offers.update_one({"_id": _id}, {"$set": update})
    if res.matched_count == 0:
        return jsonify({"error": "Oferta no encontrada"}), 404
    return jsonify({"message": "Oferta actualizada"}), 200

@offers_bp.route("/<offer_id>", methods=['DELETE'])
def delete_offer(offer_id):
    """
    Eliminar una oferta existente
    """
    try:
        _id = ObjectId(offer_id)
    except:
        return jsonify({"error": "ID de oferta invalida"}), 400

    res = mongo.db.offers.delete_one({"_id": _id})
    if res.deleted_count == 0:
        return jsonify({"error": "Oferta no encontrada"}), 404
    
    mongo.db.offer_inventory.delete_many({"offer_id": _id})
    mongo.db.bookings.delete_many({"offer_id": _id})
    return jsonify({"message": "Oferta eliminada"}), 200

@offers_bp.route("/<offer_id>/availability", methods=['GET'])
def offer_availability(offer_id):
    """
    Comprobar disponibilidad de una oferta en un rango de fechas
    Parámetros:
    - from: DD-MM-AAAA
    - to: DD-MM-AAAA
    """
    try:
        _id = ObjectId(offer_id)
    except:
        return jsonify({"error": "ID de oferta invalida"}), 400

    date_str = request.args.get("date")
    if not date_str:
        return jsonify({"error": "Falta el parametro 'date' - (DD/MM/AAAA)"}), 400

    inv = mongo.db.offer_inventory.find_one({"offer_id": _id, "date": date_str})
    if not inv:
        return jsonify({"error": "No hay existencias para dicha fecha"}), 404
    
    remaining = max(inv["capacity"] - inv["booked"], 0)
    return jsonify({
        "offer_id": offer_id,
        "date": date_str,
        "capacity": inv["capacity"],
        "booked": inv["booked"],
        "remaining": remaining,
        "available": remaining > 0
    }), 200