from bson import ObjectId

from ..utils.dates import daterange
from ..utils.errors import ConflictError
from ..utils.utils import to_float_or_none


def list_offers(
    db,
    q=None,
    city=None,
    category=None,
    min_price=None,
    max_price=None,
    date_str=None,
    provider_dni=None,
):
    base_filter = {"is_active": True}

    if q:
        base_filter["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]
    if city:
        base_filter["location.city"] = city
    if category:
        base_filter["category"] = category

    if min_price is not None or max_price is not None:
        base_filter["price"] = {}
        if min_price is not None:
            base_filter["price"]["$gte"] = min_price
        if max_price is not None:
            base_filter["price"]["$lte"] = max_price

    if provider_dni:
        base_filter["provider_dni"] = provider_dni

    if date_str:
        inv_cursor = db.offer_inventory.find(
            {
                "date": date_str,
                "$expr": {"$lt": ["$booked", "$capacity"]},
            },
            {"offer_id": 1},
        )
        offer_ids = [it["offer_id"] for it in inv_cursor]
        if not offer_ids:
            return []
        base_filter["_id"] = {"$in": offer_ids}

    docs = list(db.offers.find(base_filter))
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return docs


def lookup_offer(db, offer_id=None, provider_dni=None):
    if offer_id:
        try:
            _id = ObjectId(offer_id)
        except Exception:
            raise ValueError("offer_id inválido")
        doc = db.offers.find_one({"_id": _id})
        if not doc:
            return None
        doc["_id"] = str(doc["_id"])
        return doc

    if provider_dni:
        items = list(db.offers.find({"provider_dni": provider_dni}))
        for it in items:
            it["_id"] = str(it["_id"])
        return items

    raise ValueError("Proporciona offer_id o provider_dni")


def get_offer(db, offer_id):
    try:
        _id = ObjectId(offer_id)
    except Exception:
        raise ValueError("ID de oferta inválida")
    doc = db.offers.find_one({"_id": _id})
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


def create_offer(db, data, user=None):
    required = [
        "provider_dni",
        "title",
        "description",
        "price",
        "people_included",
        "available_from",
        "available_to",
        "daily_capacity",
    ]
    missing = [k for k in required if not data.get(k)]
    if missing:
        raise ValueError(f"Faltan campos: {', '.join(missing)}")

    prov_dni = data["provider_dni"].strip().upper()
    if user and user.get("role") == "provider" and user.get("ref_dni") != prov_dni:
        raise PermissionError("No autorizado para crear ofertas de otro proveedor")

    doc = {
        "provider_dni": prov_dni,
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
        "is_active": bool(data.get("is_active", True)),
    }

    res = db.offers.insert_one(doc)
    offer_id = res.inserted_id

    bulk = []
    for d in daterange(data["available_from"], data["available_to"]):
        bulk.append(
            {
                "offer_id": offer_id,
                "date": d,
                "capacity": int(data["daily_capacity"]),
                "booked": 0,
            }
        )
    if bulk:
        db.offer_inventory.insert_many(bulk)

    return str(offer_id)


def update_offer(db, offer_id, data, user=None):
    try:
        _id = ObjectId(offer_id)
    except Exception:
        raise ValueError("ID de oferta inválida")

    if user and user.get("role") == "provider":
        own = db.offers.find_one({"_id": _id, "provider_dni": user.get("ref_dni")})
        if not own:
            raise PermissionError("No autorizado para modificar dicha oferta")
    else:
        own = db.offers.find_one({"_id": _id})

    if not own:
        return False

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
        "daily_capacity",
        "is_active",
    }
    update = {k: data[k] for k in data.keys() & allowed}

    if "price" in update:
        try:
            update["price"] = float(update["price"])
        except Exception:
            raise ValueError("Precio inválido")
    if "people_included" in update:
        try:
            update["people_included"] = int(update["people_included"])
        except Exception:
            raise ValueError("Número de personas inválido")
    if "daily_capacity" in update:
        try:
            update["daily_capacity"] = int(update["daily_capacity"])
        except Exception:
            raise ValueError("Capacidad diaria inválida")
        if update["daily_capacity"] <= 0:
            raise ValueError("Capacidad diaria inválida")

    inventory_fields = {"available_from", "available_to", "daily_capacity"}
    inventory_changed = bool(update.keys() & inventory_fields)
    if inventory_changed:
        has_bookings = db.bookings.count_documents({"offer_id": _id}, limit=1) > 0
        if has_bookings:
            raise ConflictError(
                "No se puede cambiar disponibilidad o capacidad con reservas existentes"
            )

        available_from = update.get("available_from", own.get("available_from"))
        available_to = update.get("available_to", own.get("available_to"))
        daily_capacity = update.get("daily_capacity", own.get("daily_capacity"))

        try:
            inventory_docs = [
                {
                    "offer_id": _id,
                    "date": d,
                    "capacity": int(daily_capacity),
                    "booked": 0,
                }
                for d in daterange(available_from, available_to)
            ]
        except Exception:
            raise ValueError("Las fechas deben tener formato DD/MM/AAAA")
        if not inventory_docs:
            raise ValueError("available_from no puede ser posterior a available_to")

    if not update:
        raise ValueError("No hay campos válidos para actualizar")

    res = db.offers.update_one({"_id": _id}, {"$set": update})
    if res.matched_count == 0:
        return False

    if inventory_changed:
        db.offer_inventory.delete_many({"offer_id": _id})
        if inventory_docs:
            db.offer_inventory.insert_many(inventory_docs)
    return True


def delete_offer(db, offer_id, user=None):
    try:
        _id = ObjectId(offer_id)
    except Exception:
        raise ValueError("ID de oferta inválida")

    if user and user.get("role") == "provider":
        own = db.offers.find_one({"_id": _id, "provider_dni": user.get("ref_dni")})
        if not own:
            raise PermissionError("No autorizado para eliminar esta oferta")

    res = db.offers.delete_one({"_id": _id})
    if res.deleted_count == 0:
        return False
    db.offer_inventory.delete_many({"offer_id": _id})
    db.bookings.delete_many({"offer_id": _id})
    return True


def check_availability(db, offer_id, date_str):
    try:
        _id = ObjectId(offer_id)
    except Exception:
        raise ValueError("ID de oferta inválida")

    inv = db.offer_inventory.find_one({"offer_id": _id, "date": date_str})
    if not inv:
        return None
    remaining = max(inv["capacity"] - inv["booked"], 0)
    return {
        "offer_id": offer_id,
        "date": date_str,
        "capacity": inv["capacity"],
        "booked": inv["booked"],
        "remaining": remaining,
        "available": remaining > 0,
    }
