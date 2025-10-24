# backend/routes/bookings.py

from flask import Blueprint, request, jsonify
from bson import ObjectId
from pymongo import ReturnDocument

from backend import mongo
from backend.utils.utils import normalize_dni
from backend.utils.authz import require_roles, current_user

bookings_bp = Blueprint('bookings', __name__)


@bookings_bp.route("/", methods=["GET"])
@require_roles("client", "staff")
def list_bookings():
    """
    Listar las reservas realizadas.
    - client: ignora query y devuelve SOLAMENTE sus reservas (token.ref_dni)
    - staff/admin: puede consultar las reservas filtradas por 'dni' o 'offer_id' (al menos uno)
    """
    user = current_user()
    q = {}

    if user["role"] == "client":
        dni = user.get("ref_dni")
        if not dni:
            return jsonify({"error": "DNI inválido"}), 400
        q["client_dni"] = normalize_dni(dni)
    else:
        client_dni = request.args.get("dni")
        offer_id = request.args.get("offer_id")

        if not client_dni and not offer_id:
            return jsonify({"error": "Indica al menos un parametro: dni u offer_id"}), 400

        if client_dni:
            q["client_dni"] = normalize_dni(client_dni)

        if offer_id:
            try:
                q["offer_id"] = ObjectId(offer_id)
            except Exception:
                return jsonify({"error": "offer_id inexistente"}), 400

    docs = list(mongo.db.bookings.find(q).sort([("_id", -1)]))
    for d in docs:
        d["_id"] = str(d["_id"])
        d["offer_id"] = str(d["offer_id"])
    return jsonify(docs)


@bookings_bp.route("/", methods=["POST"])
@require_roles("client", "staff")
def create_booking():
    """
    Crear nueva reserva para un cliente dado una fecha concreta de una oferta.
    """
    user = current_user()
    data = request.get_json(force=True) or {}

    offer_id = data.get('offer_id')
    date_str = (data.get('date') or "").strip()  # "DD/MM/AAAA"

    if user["role"] == "client":
        client_dni = normalize_dni(user.get("ref_dni") or "")
    else:
        client_dni = normalize_dni(data.get('client_dni') or "")

    if not offer_id or not client_dni or not date_str:
        return jsonify({"error": "offer_id, client_dni y date son obligatorios"}), 400

    try:
        _offer_id = ObjectId(offer_id)
    except Exception:
        return jsonify({"error": "offer_id inválido"}), 400

    # Cliente debe existir en la bd
    if not mongo.db.clients.find_one({"dni": client_dni}):
        return jsonify({"error": "El cliente con el DNI proporcionado no existe"}), 404

    # La oferta debe estar activa
    if not mongo.db.offers.find_one({"_id": _offer_id, "is_active": True}):
        return jsonify({"error": "La oferta no existe o no está disponible"}), 404

    # Reserva 1 plaza si hay capacidad
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
        "date": date_str,        # "DD/MM/AAAA"
        "status": "PENDING"
    }
    ins = mongo.db.bookings.insert_one(res_doc)
    res_doc["_id"] = str(ins.inserted_id)
    res_doc["offer_id"] = str(res_doc["offer_id"])
    return jsonify(res_doc), 201


@bookings_bp.route("/lookup", methods=["GET"])
@require_roles("staff", "admin")
def lookup_booking():
    """
    Buscar reservas por id de la oferta y/o dni del cliente:
    """
    offer_id = (request.args.get("offer_id") or "").strip()
    client_dni = normalize_dni(request.args.get("client_dni") or "")

    q = {}
    if offer_id:
        try:
            q["offer_id"] = ObjectId(offer_id)
        except Exception:
            return jsonify({"error": "Oferta inexistente o inválida"}), 400
    if client_dni:
        q["client_dni"] = client_dni

    if not q:
        return jsonify({"error": "Indica offer_id y/o client_dni para realizar la busqueda"}), 400

    items = list(mongo.db.bookings.find(q).sort([("_id", -1)]))
    for b in items:
        b["_id"] = str(b["_id"])
        b["offer_id"] = str(b["offer_id"])
    return jsonify(items)


@bookings_bp.route("/<booking_id>/status", methods=["PUT", "PATCH"])
@require_roles("client", "staff")
def update_booking_status(booking_id):
    """
    Actualizar el estado de una reserva.
      - status: "PENDING" | "CONFIRMED" | "CANCELLED"
    """
    user = current_user()
    data = request.get_json(force=True) or {}
    new_status = data.get("status")

    if new_status not in ("PENDING", "CONFIRMED", "CANCELLED"):
        return jsonify({"error": "Estado inválido, debe ser PENDING, CONFIRMED o CANCELLED"}), 400

    try:
        _bid = ObjectId(booking_id)
    except Exception:
        return jsonify({"error": "oferta inválida"}), 400

    bk = mongo.db.bookings.find_one({"_id": _bid})
    if not bk:
        return jsonify({"error": "Reserva no encontrada"}), 404

    # Permisos
    if user["role"] == "client":
        if bk["client_dni"] != (user.get("ref_dni") or "").upper():
            return jsonify({"error": "No autorizado"}), 403
        if new_status != "CANCELLED":
            return jsonify({"error": "Los clientes solo pueden cancelar su reserva"}), 403

    # Si pasa a CANCELLED, se libera una plaza
    prev_status = bk.get("status")
    if new_status == "CANCELLED" and prev_status != "CANCELLED":
        # Aumentar el contador de existencias
        mongo.db.offer_inventory.update_one(
            {"offer_id": bk["offer_id"], "date": bk["date"]},
            {"$inc": {"booked": -1}}
        )

    # Actualizamos el estado
    res = mongo.db.bookings.update_one({"_id": _bid}, {"$set": {"status": new_status}})
    if res.matched_count == 0:
        return jsonify({"error": "No se pudo actualizar el estado de la reserva"}), 404

    return jsonify({"ok": True})
