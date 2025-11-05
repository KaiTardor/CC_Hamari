from flask import Blueprint, request, jsonify
from backend import mongo
from ..services.clients_service import (
    create_client as svc_create_client,
    list_clients as svc_list_clients,
    get_client as svc_get_client,
    update_client as svc_update_client,
    delete_client as svc_delete_client,
)

clients_bp = Blueprint('clients', __name__)


@clients_bp.route("/", methods=["POST"])
def create_client():
    data = request.get_json(force=True)
    try:
        dni = svc_create_client(mongo.db, data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"message": "Cliente con dni " + dni + " creado"}), 201


@clients_bp.route("/", methods=["GET"])
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
def update_client(dni):
    data = request.get_json(force=True)
    try:
        ok = svc_update_client(mongo.db, dni, data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    if not ok:
        return jsonify({"error": "No se pudo actualizar el cliente"}), 400
    return jsonify({"message": "Cliente actualizado"}), 200


@clients_bp.route("/<dni>", methods=["DELETE"])
def delete_client(dni):
    ok = svc_delete_client(mongo.db, dni)
    if not ok:
        return jsonify({"error": "Cliente no encontrado"}), 404
    return jsonify({"message": "Cliente eliminado"}), 200