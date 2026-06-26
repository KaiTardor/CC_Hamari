from bson import ObjectId
from flask import Blueprint, g, jsonify, request

from backend import mongo

from ..services.offers_service import (
    check_availability as svc_check_availability,
)
from ..services.offers_service import (
    create_offer as svc_create_offer,
)
from ..services.offers_service import (
    delete_offer as svc_delete_offer,
)
from ..services.offers_service import (
    get_offer as svc_get_offer,
)
from ..services.offers_service import (
    list_offers as svc_list_offers,
)
from ..services.offers_service import (
    lookup_offer as svc_lookup_offer,
)
from ..services.offers_service import (
    update_offer as svc_update_offer,
)
from ..utils.authz import require_roles
from ..utils.http import get_json_body
from ..utils.utils import to_float_or_none

offers_bp = Blueprint("offers", __name__)


@offers_bp.route("/", methods=["GET"])
@require_roles("provider", "staff", "client")
def list_offers():
    q = request.args.get("q")
    city = request.args.get("city")
    cat = request.args.get("category")
    min_price = to_float_or_none(request.args.get("min_price"))
    max_price = to_float_or_none(request.args.get("max_price"))
    date_str = request.args.get("date")
    provider_dni = (request.args.get("provider_dni") or "").strip().upper()

    docs = svc_list_offers(
        mongo.db,
        q=q,
        city=city,
        category=cat,
        min_price=min_price,
        max_price=max_price,
        date_str=date_str,
        provider_dni=provider_dni,
    )
    return jsonify(docs)


@offers_bp.route("/lookup", methods=["GET"])
@require_roles("staff", "provider", "admin")
def lookup_offer():
    offer_id = (request.args.get("offer_id") or "").strip()
    provider_dni = (request.args.get("provider_dni") or "").strip().upper()

    try:
        res = svc_lookup_offer(
            mongo.db, offer_id=offer_id or None, provider_dni=provider_dni or None
        )
    except ValueError:
        return jsonify({"error": "Proporciona offer_id o provider_dni"}), 400
    if res is None:
        return jsonify({"error": "Oferta no encontrada"}), 404
    return jsonify(res)


@offers_bp.route("/<offer_id>", methods=["GET"])
@require_roles("provider", "staff", "client")
def offer_detail(offer_id):
    try:
        doc = svc_get_offer(mongo.db, offer_id)
    except ValueError:
        return jsonify({"error": "ID de oferta inválida"}), 400
    if not doc:
        return jsonify({"error": "Oferta no encontrada"}), 404
    return jsonify(doc)


@offers_bp.route("/", methods=["POST"])
@require_roles("provider")
def create_offer():
    try:
        data = get_json_body()
        user = g.user
        offer_id = svc_create_offer(mongo.db, data, user=user)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403
    return jsonify({"message": "Oferta creada", "offer_id": str(offer_id)}), 201


@offers_bp.route("/<offer_id>", methods=["PUT", "PATCH"])
@require_roles("provider")
def update_offer(offer_id):
    try:
        data = get_json_body()
        user = g.user
        ok = svc_update_offer(mongo.db, offer_id, data, user=user)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403
    if not ok:
        return jsonify({"error": "Oferta no encontrada"}), 404
    return jsonify({"message": "Oferta actualizada"}), 200


@offers_bp.route("/<offer_id>", methods=["DELETE"])
@require_roles("provider")
def delete_offer(offer_id):
    user = g.user
    try:
        ok = svc_delete_offer(mongo.db, offer_id, user=user)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403
    if not ok:
        return jsonify({"error": "Oferta no encontrada"}), 404
    return jsonify({"message": "Oferta eliminada"}), 200


@offers_bp.route("/<offer_id>/availability", methods=["GET"])
@require_roles("client", "staff", "provider")
def offer_availability(offer_id):
    date_str = request.args.get("date")
    if not date_str:
        return jsonify({"error": "Falta el parámetro 'date' (DD/MM/AAAA)"}), 400
    try:
        res = svc_check_availability(mongo.db, offer_id, date_str)
    except ValueError:
        return jsonify({"error": "ID de oferta inválida"}), 400
    if res is None:
        return jsonify({"error": "No hay inventario para esa fecha"}), 404
    return jsonify(res), 200
