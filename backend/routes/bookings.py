# backend/routes/bookings.py

from flask import Blueprint, jsonify, request

from backend import mongo
from backend.utils.authz import current_user, require_roles

from ..services.bookings_service import (
    create_booking as svc_create_booking,
)
from ..services.bookings_service import (
    list_bookings as svc_list_bookings,
)
from ..services.bookings_service import (
    lookup_booking as svc_lookup_booking,
)
from ..services.bookings_service import (
    update_booking_status as svc_update_booking_status,
)

bookings_bp = Blueprint("bookings", __name__)


@bookings_bp.route("/", methods=["GET"])
@require_roles("client", "staff")
def list_bookings():
    user = current_user()
    client_dni = request.args.get("dni")
    offer_id = request.args.get("offer_id")
    try:
        docs = svc_list_bookings(
            mongo.db, user, client_dni=client_dni, offer_id=offer_id
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    return jsonify(docs)


@bookings_bp.route("/", methods=["POST"])
@require_roles("client", "staff")
def create_booking():
    user = current_user()
    data = request.get_json(force=True) or {}
    try:
        res = svc_create_booking(mongo.db, user, data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except LookupError as e:
        return jsonify({"error": str(e)}), 404
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 409
    return jsonify(res), 201


@bookings_bp.route("/lookup", methods=["GET"])
@require_roles("staff", "admin")
def lookup_booking():
    offer_id = (request.args.get("offer_id") or "").strip()
    client_dni = request.args.get("client_dni") or ""
    try:
        items = svc_lookup_booking(
            mongo.db, offer_id=offer_id or None, client_dni=client_dni or None
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    return jsonify(items)


@bookings_bp.route("/<booking_id>/status", methods=["PUT", "PATCH"])
@require_roles("client", "staff")
def update_booking_status(booking_id):
    user = current_user()
    data = request.get_json(force=True) or {}
    new_status = data.get("status")
    try:
        svc_update_booking_status(mongo.db, booking_id, new_status, user)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except LookupError as e:
        return jsonify({"error": str(e)}), 404
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 404
    return jsonify({"ok": True})
