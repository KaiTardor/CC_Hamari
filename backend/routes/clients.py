from flask import Blueprint, jsonify, request
from ..utils.authz import *
from ..utils.http import get_json_body
from backend import mongo

from ..services.clients_service import (
    create_client as svc_create_client,
)
from ..services.clients_service import (
    delete_client as svc_delete_client,
)
from ..services.clients_service import (
    get_client as svc_get_client,
)
from ..services.clients_service import (
    list_clients as svc_list_clients,
)
from ..services.clients_service import (
    update_client as svc_update_client,
)

clients_bp = Blueprint("clients", __name__)


@clients_bp.route("/", methods=["POST"])
@require_roles("admin")
def create_client():
    try:
        data = get_json_body()
        dni = svc_create_client(mongo.db, data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"message": "Cliente con dni " + dni + " creado"}), 201


@clients_bp.route("/", methods=["GET"])
@require_roles("admin", "staff")
def list_clients():
    clients = svc_list_clients(mongo.db)
    return jsonify(clients), 200


@clients_bp.route("/<dni>", methods=["GET"])
def client_detail(dni):
    doc = svc_get_client(mongo.db, dni)
    if not doc:
        return jsonify({"error": "Cliente no encontrado"}), 404
    return jsonify(doc), 200


@clients_bp.route("/<dni>", methods=["PUT", "PATCH"])
@require_self_or_admin("dni")
def update_client(dni):
    try:
        data = get_json_body()
        ok = svc_update_client(mongo.db, dni, data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    if not ok:
        return jsonify({"error": "No se pudo actualizar el cliente"}), 400
    return jsonify({"message": "Cliente actualizado"}), 200


@clients_bp.route("/<dni>", methods=["DELETE"])
@require_roles("admin")
def delete_client(dni):
    ok = svc_delete_client(mongo.db, dni)
    if not ok:
        return jsonify({"error": "Cliente no encontrado"}), 404
    return jsonify({"message": "Cliente eliminado"}), 200
