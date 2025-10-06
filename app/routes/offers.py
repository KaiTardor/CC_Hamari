from flask import Blueprint, request, jsonify
from bson import ObjectId
from .. import mongo
from ..utils.utils import *

offers_bp = Blueprint('offers', __name__)


@offers_bp.route('/', methods=['GET'])
def list_offers():
    """
    Lista de ofertas disponibles accesibles mediante:
    - Filtros opciones ()
    - Ofertas disponibles dicho dia
    """
    q = request.args.get('q', None)
    city = request.args.get('city', None)
    cat = request.args.get('category', None)
    min_price = to_float_or_none(request.args.get('min_price', None))
    max_price = to_float_or_none(request.args.get('max_price', None))
    date_str = request.args.get('date', None)

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

@offers_bp.route("/<offer_id>/availability", methods=['GET'])
def offer_availability(offer_id):
    """
    Consultar la disponibilidad de una oferta concreta en un rango de fechas
    """
    date_str = request.args.get("date")
    if not date_str:
        return jsonify({"error": "Parámetro 'date' es obligatorio, formato DD-MM-AAAA"}), 400
    
    try:
        _id = ObjectId(offer_id)
    except Exception:
        return jsonify({"error": "ID de oferta invalida"}), 400
    
    inv = mongo.db.inventories.find_one({"offer_id": _id, "date": date_str})
    if not inv:
        return jsonify({"error": "No hay plazas disponibles para dicha fecha"}), 404
    
    remaining = max(inv["capacity"] - inv["booked"], 0)

    return jsonify({
        "offer_id": offer_id,
        "date": date_str,
        "capacity": inv["capacity"],
        "booked": inv["booked"],
        "remaining": remaining, 
        "available": remaining > 0
    })

