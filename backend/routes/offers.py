from flask import Blueprint, request, jsonify
from bson import ObjectId
from backend import mongo

from ..utils.utils import to_float_or_none
from ..utils.dates import daterange
from ..utils.authz import require_roles, current_user

offers_bp = Blueprint('offers', __name__)

@offers_bp.route('/', methods=['GET'])
@require_roles("provider", "staff", "client")
def list_offers():
    """
    Lista de ofertas disponibles accesibles mediante filtros:
    - q: texto
    - city: ciudad
    - category: categoria
    - min_price, max_price: rango de precios
    - date: DD/MM/AAAA (filtra por disponibilidad ese día)
    - provider_dni: filtra por proveedor concreto
    """
    q = request.args.get('q')
    city = request.args.get('city')
    cat = request.args.get('category')
    min_price = to_float_or_none(request.args.get('min_price'))
    max_price = to_float_or_none(request.args.get('max_price'))
    date_str = request.args.get('date')
    provider_dni = (request.args.get('provider_dni') or "").strip().upper()

    base_filter = {"is_active": True}

    # Filtros textuales
    if q:
        base_filter["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]
    if city:
        base_filter["location.city"] = city
    if cat:
        base_filter["category"] = cat

    # Rango de precios
    if min_price is not None or max_price is not None:
        base_filter["price"] = {}
        if min_price is not None:
            base_filter["price"]["$gte"] = min_price
        if max_price is not None:
            base_filter["price"]["$lte"] = max_price
    if provider_dni:
        base_filter["provider_dni"] = provider_dni

    # Si se especifica fecha, filtramos por existencias disponibles de dicho día
    if date_str:
        inv_cursor = mongo.db.offer_inventory.find(
            {
                "date": date_str,
                "$expr": {"$lt": ["$booked", "$capacity"]},
            },
            {"offer_id": 1},
        )
        offer_ids = [it["offer_id"] for it in inv_cursor]
        if not offer_ids:
            return jsonify([])
        base_filter["_id"] = {"$in": offer_ids}

    docs = list(mongo.db.offers.find(base_filter))
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return jsonify(docs)


@offers_bp.route('/lookup', methods=['GET'])
@require_roles("staff", "provider", "admin")
def lookup_offer():
    """
    Búsqueda operativa por id o por proveedor (staff/provider).
    """
    offer_id = (request.args.get("offer_id") or "").strip()
    provider_dni = (request.args.get("provider_dni") or "").strip().upper()

    if offer_id:
        try:
            _id = ObjectId(offer_id)
        except Exception:
            return jsonify({"error": "offer_id inválido"}), 400
        
        doc = mongo.db.offers.find_one({"_id": _id})
        if not doc:
            return jsonify({"error": "Oferta no encontrada"}), 404
        doc["_id"] = str(doc["_id"])
        return jsonify(doc)

    if provider_dni:
        items = list(mongo.db.offers.find({"provider_dni": provider_dni}))
        for it in items:
            it["_id"] = str(it["_id"])
        return jsonify(items)

    return jsonify({"error": "Proporciona offer_id o provider_dni"}), 400


@offers_bp.route('/<offer_id>', methods=['GET'])
@require_roles("provider", "staff", "client")
def offer_detail(offer_id):
    """
    Detalle de una oferta concreta 
    """
    try:
        _id = ObjectId(offer_id)
    except Exception:
        return jsonify({"error": "ID de oferta inválida"}), 400

    doc = mongo.db.offers.find_one({"_id": _id})
    if not doc:
        return jsonify({"error": "Oferta no encontrada"}), 404

    doc["_id"] = str(doc["_id"])
    return jsonify(doc)


@offers_bp.route("/", methods=['POST'])
@require_roles("provider")  # admin pasa siempre
def create_offer():
    """
    Crear una nueva oferta
    Campos obligatorios:
    - provider_dni
    - title
    - description
    - price
    - people_included
    - available_from (DD/MM/AAAA)
    - available_to   (DD/MM/AAAA)
    - daily_capacity
    """
    data = request.get_json(force=True)

    # Validación mínima
    required = ["provider_dni", "title", "description", "price", "people_included",
                "available_from", "available_to", "daily_capacity"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return jsonify({"error": f"Faltan campos: {', '.join(missing)}"}), 400

    prov_dni = data["provider_dni"].strip().upper()

    # Si es provider, debe crear SOLO para su empresa
    user = current_user()
    if user and user["role"] == "provider" and user.get("ref_dni") != prov_dni:
        return jsonify({"error": "No autorizado para crear ofertas de otro proveedor"}), 403

    doc = {
        "provider_dni": prov_dni,
        "title": data["title"],
        "description": data["description"],
        "category": data.get("category"),
        "price": float(data["price"]),
        "people_included": int(data["people_included"]),
        "location": data.get("location", {}),
        "images": data.get("images", []),
        "available_from": data["available_from"],  # "DD/MM/AAAA"
        "available_to": data["available_to"],      # "DD/MM/AAAA"
        "daily_capacity": int(data["daily_capacity"]),
        "is_active": bool(data.get("is_active", True)),
    }

    res = mongo.db.offers.insert_one(doc)
    offer_id = res.inserted_id

    # Crear existencias diarias
    bulk = []
    for d in daterange(data["available_from"], data["available_to"]):
        bulk.append({
            "offer_id": offer_id,
            "date": d,  # "DD/MM/AAAA"
            "capacity": int(data["daily_capacity"]),
            "booked": 0,
        })
    if bulk:
        mongo.db.offer_inventory.insert_many(bulk)

    return jsonify({"message": "Oferta creada", "offer_id": str(offer_id)}), 201


@offers_bp.route("/<offer_id>", methods=['PUT', 'PATCH'])
@require_roles("provider")
def update_offer(offer_id):
    """ 
    Actualizar una oferta existente (provider solo la suya) 
    """
    try:
        _id = ObjectId(offer_id)
    except Exception:
        return jsonify({"error": "ID de oferta inválida"}), 400
    
    user = current_user()
    if user and user["role"] == "provider":
        own = mongo.db.offers.find_one({"_id": _id, "provider_dni": user.get("ref_dni")})
        if not own:
            return jsonify({"error": "No autorizado para modificar dicha oferta"}), 403

    data = request.get_json(force=True)
    allowed = {
        "title", "description", "category", "price", "people_included",
        "location", "images", "available_from", "available_to", "daily_capacity", "is_active"
    }
    update = {k: data[k] for k in data.keys() & allowed}

    # Validaciones de tipos para algunos campos
    if "price" in update:
        try:
            update["price"] = float(update["price"])
        except Exception:
            return jsonify({"error": "Precio inválido"}), 400
    if "people_included" in update:
        try:
            update["people_included"] = int(update["people_included"])
        except Exception:
            return jsonify({"error": "Número de personas inválido"}), 400
    if "daily_capacity" in update:
        try:
            update["daily_capacity"] = int(update["daily_capacity"])
        except Exception:
            return jsonify({"error": "Capacidad diaria inválida"}), 400

    if not update:
        return jsonify({"error": "No hay campos válidos para actualizar"}), 400

    res = mongo.db.offers.update_one({"_id": _id}, {"$set": update})
    if res.matched_count == 0:
        return jsonify({"error": "Oferta no encontrada"}), 404

    return jsonify({"message": "Oferta actualizada"}), 200


@offers_bp.route("/<offer_id>", methods=['DELETE'])
@require_roles("provider") 
def delete_offer(offer_id):
    """ 
    Eliminar una oferta (provider solo la suya)
      """
    try:
        _id = ObjectId(offer_id)
    except Exception:
        return jsonify({"error": "ID de oferta inválida"}), 400

    user = current_user()
    if user and user["role"] == "provider":
        own = mongo.db.offers.find_one({"_id": _id, "provider_dni": user.get("ref_dni")})
        if not own:
            return jsonify({"error": "No autorizado para eliminar esta oferta"}), 403

    res = mongo.db.offers.delete_one({"_id": _id})
    if res.deleted_count == 0:
        return jsonify({"error": "Oferta no encontrada"}), 404

    mongo.db.offer_inventory.delete_many({"offer_id": _id})
    mongo.db.bookings.delete_many({"offer_id": _id})
    return jsonify({"message": "Oferta eliminada"}), 200


@offers_bp.route("/<offer_id>/availability", methods=['GET'])
@require_roles("client", "staff", "provider")
def offer_availability(offer_id):
    """
    Comprobar disponibilidad de una oferta en una fecha concreta
    """
    try:
        _id = ObjectId(offer_id)
    except Exception:
        return jsonify({"error": "ID de oferta inválida"}), 400

    date_str = request.args.get("date")
    if not date_str:
        return jsonify({"error": "Falta el parámetro 'date' (DD/MM/AAAA)"}), 400

    inv = mongo.db.offer_inventory.find_one({"offer_id": _id, "date": date_str})
    if not inv:
        return jsonify({"error": "No hay inventario para esa fecha"}), 404

    remaining = max(inv["capacity"] - inv["booked"], 0)
    return jsonify({
        "offer_id": offer_id,
        "date": date_str,
        "capacity": inv["capacity"],
        "booked": inv["booked"],
        "remaining": remaining,
        "available": remaining > 0,
    }), 200
