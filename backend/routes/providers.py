from flask import Blueprint, request, jsonify
from backend import mongo
from ..services.providers_service import (
    create_provider as svc_create_provider,
    list_providers as svc_list_providers,
    get_provider_details as svc_get_provider_details,
    update_provider as svc_update_provider,
    delete_provider as svc_delete_provider,
)

providers_bp = Blueprint('providers', __name__)


@providers_bp.route('/', methods=['POST'])
def create_provider():
    data = request.get_json(force=True)
    try:
        dni = svc_create_provider(mongo.db, data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"message": "Proveedor creado", "dni": dni}), 201


@providers_bp.route('/', methods=['GET'])
def list_providers():
    docs = svc_list_providers(mongo.db)
    return jsonify(docs)


@providers_bp.route('/<dni>', methods=['GET'])
def provider_details(dni):
    res = svc_get_provider_details(mongo.db, dni)
    if not res:
        return jsonify({"error": "Proveedor no encontrado"}), 404
    return jsonify(res)


@providers_bp.route("/<dni>", methods=["PUT", "PATCH"])
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
def delete_provider(dni):
    ok = svc_delete_provider(mongo.db, dni)
    if not ok:
        return jsonify({"error": "Proveedor no encontrado"}), 404
    return jsonify({"message": "Proveedor y sus ofertas eliminados"}), 200