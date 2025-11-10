from flask import Blueprint, jsonify, request

from backend import mongo

from ..services.staff_service import (
    create_staff as svc_create_staff,
)
from ..services.staff_service import (
    delete_staff as svc_delete_staff,
)
from ..services.staff_service import (
    get_staff as svc_get_staff,
)
from ..services.staff_service import (
    list_staff as svc_list_staff,
)
from ..services.staff_service import (
    update_staff as svc_update_staff,
)

staff_bp = Blueprint("staff", __name__)


@staff_bp.route("/", methods=["POST"])
def create_staff():
    data = request.get_json(force=True)
    try:
        dni = svc_create_staff(mongo.db, data)
    except ValueError as e:
        msg = str(e)
        # preserve original behavior: duplicate staff -> 409
        if "Empleado ya existe" in msg:
            return jsonify({"error": msg}), 409
        return jsonify({"error": msg}), 400
    return jsonify({"Message": "Empleado creado", "dni": dni}), 201


@staff_bp.route("/", methods=["GET"])
def list_staff():
    docs = svc_list_staff(mongo.db)
    return jsonify(docs)


@staff_bp.route("/<dni>", methods=["GET"])
def staff_detail(dni):
    doc = svc_get_staff(mongo.db, dni)
    if not doc:
        return jsonify({"error": "Empleado no encontrado"}), 404
    return jsonify(doc)


@staff_bp.route("/<dni>", methods=["PUT", "PATCH"])
def update_staff(dni):
    data = request.get_json(force=True)
    try:
        ok = svc_update_staff(mongo.db, dni, data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    if not ok:
        return jsonify({"error": "No se pudo actualizar el empleado"}), 400
    return jsonify({"message": "Empleado actualizado"}), 200


@staff_bp.route("/<dni>", methods=["DELETE"])
def delete_staff(dni):
    ok = svc_delete_staff(mongo.db, dni)
    if not ok:
        return jsonify({"error": "Empleado no encontrado"}), 404
    return jsonify({"ok": True})
