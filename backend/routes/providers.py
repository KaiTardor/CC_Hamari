from flask import Blueprint, jsonify, request
from ..utils.authz import *
from backend import mongo

from ..services.providers_service import (
    create_provider as svc_create_provider,
)
from ..services.providers_service import (
    delete_provider as svc_delete_provider,
)
from ..services.providers_service import (
    get_provider_details as svc_get_provider_details,
)
from ..services.providers_service import (
    list_providers as svc_list_providers,
)
from ..services.providers_service import (
    update_provider as svc_update_provider,
)

providers_bp = Blueprint("providers", __name__)


@providers_bp.route("/", methods=["POST"])
@require_roles("admin")
def create_provider():
    data = request.get_json(force=True)
    try:
        dni = svc_create_provider(mongo.db, data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"message": "Proveedor creado", "dni": dni}), 201


@providers_bp.route("/", methods=["GET"])
def list_providers():
    docs = svc_list_providers(mongo.db)
    return jsonify(docs)


@providers_bp.route("/<dni>", methods=["GET"])
def provider_details(dni):
    res = svc_get_provider_details(mongo.db, dni)
    if not res:
        return jsonify({"error": "Proveedor no encontrado"}), 404
    return jsonify(res)


@providers_bp.route("/<dni>", methods=["PUT", "PATCH"])
@require_self_or_admin("dni")
def update_provider(dni):
    data = request.get_json(force=True)
    try:
        ok = svc_update_provider(mongo.db, dni, data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    if not ok:
        return jsonify({"error": "Proveedor no encontrado"}), 404
    return jsonify({"message": "Proveedor actualizado"}), 200


@providers_bp.route("/<dni>", methods=["DELETE"])
@require_roles("admin")
def delete_provider(dni):
    ok = svc_delete_provider(mongo.db, dni)
    if not ok:
        return jsonify({"error": "Proveedor no encontrado"}), 404
    return jsonify({"message": "Proveedor y sus ofertas eliminados"}), 200
