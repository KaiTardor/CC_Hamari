from bson import ObjectId
from pymongo import ReturnDocument

from ..utils.utils import normalize_dni


def list_bookings(db, user, client_dni=None, offer_id=None):
    q = {}
    if user["role"] == "client":
        dni = user.get("ref_dni")
        if not dni:
            raise ValueError("DNI inválido")
        q["client_dni"] = normalize_dni(dni)
    else:
        if not client_dni and not offer_id:
            raise ValueError("Indica al menos un parametro: dni u offer_id")
        if client_dni:
            q["client_dni"] = normalize_dni(client_dni)
        if offer_id:
            try:
                q["offer_id"] = ObjectId(offer_id)
            except Exception:
                raise ValueError("offer_id inexistente")

    docs = list(db.bookings.find(q).sort([("_id", -1)]))
    for d in docs:
        d["_id"] = str(d["_id"])
        d["offer_id"] = str(d["offer_id"]) if d.get("offer_id") is not None else None
    return docs


def create_booking(db, user, data):
    offer_id = data.get("offer_id")
    date_str = (data.get("date") or "").strip()
    if user["role"] == "client":
        client_dni = normalize_dni(user.get("ref_dni") or "")
    else:
        client_dni = normalize_dni(data.get("client_dni") or "")

    if not offer_id or not client_dni or not date_str:
        raise ValueError("offer_id, client_dni y date son obligatorios")

    try:
        _offer_id = ObjectId(offer_id)
    except Exception:
        raise ValueError("offer_id inválido")

    if not db.clients.find_one({"dni": client_dni}):
        raise LookupError("El cliente con el DNI proporcionado no existe")

    if not db.offers.find_one({"_id": _offer_id, "is_active": True}):
        raise LookupError("La oferta no existe o no está disponible")

    inv = db.offer_inventory.find_one_and_update(
        {
            "offer_id": _offer_id,
            "date": date_str,
            "$expr": {"$lt": ["$booked", "$capacity"]},
        },
        {"$inc": {"booked": 1}},
        return_document=ReturnDocument.AFTER,
    )
    if not inv:
        raise RuntimeError("No hay disponibilidad para la fecha seleccionada")

    res_doc = {
        "offer_id": _offer_id,
        "client_dni": client_dni,
        "date": date_str,
        "status": "PENDING",
    }
    try:
        ins = db.bookings.insert_one(res_doc)
    except Exception:
        db.offer_inventory.update_one(
            {"offer_id": _offer_id, "date": date_str, "booked": {"$gt": 0}},
            {"$inc": {"booked": -1}},
        )
        raise
    res_doc["_id"] = str(ins.inserted_id)
    res_doc["offer_id"] = (
        str(res_doc["offer_id"]) if res_doc.get("offer_id") is not None else None
    )
    return res_doc


def lookup_booking(db, offer_id=None, client_dni=None):
    q = {}
    if offer_id:
        try:
            q["offer_id"] = ObjectId(offer_id)
        except Exception:
            raise ValueError("Oferta inexistente o inválida")
    if client_dni:
        q["client_dni"] = normalize_dni(client_dni)
    if not q:
        raise ValueError("Indica offer_id y/o client_dni para realizar la busqueda")

    items = list(db.bookings.find(q).sort([("_id", -1)]))
    for b in items:
        b["_id"] = str(b["_id"])
        b["offer_id"] = str(b["offer_id"]) if b.get("offer_id") is not None else None
    return items


def update_booking_status(db, booking_id, new_status, user):
    if new_status not in ("PENDING", "CONFIRMED", "CANCELLED"):
        raise ValueError("Estado inválido, debe ser PENDING, CONFIRMED o CANCELLED")
    try:
        _bid = ObjectId(booking_id)
    except Exception:
        raise ValueError("oferta inválida")

    bk = db.bookings.find_one({"_id": _bid})
    if not bk:
        raise LookupError("Reserva no encontrada")

    if user["role"] == "client":
        if bk["client_dni"] != (user.get("ref_dni") or "").upper():
            raise PermissionError("No autorizado")
        if new_status != "CANCELLED":
            raise PermissionError("Los clientes solo pueden cancelar su reserva")

    prev_status = bk.get("status")
    if new_status == "CANCELLED" and prev_status != "CANCELLED":
        db.offer_inventory.update_one(
            {"offer_id": bk["offer_id"], "date": bk["date"], "booked": {"$gt": 0}},
            {"$inc": {"booked": -1}},
        )

    res = db.bookings.update_one({"_id": _bid}, {"$set": {"status": new_status}})
    if res.matched_count == 0:
        raise RuntimeError("No se pudo actualizar el estado de la reserva")
    return True
