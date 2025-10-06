from flask import Blueprint, request, jsonify
from .. import mongo
from ..utils.utils import *

providers_bp = Blueprint('providers', __name__)

@providers_bp.route('/<dni>', methods=['GET'])
def provider_details(dni):
    """ 
    Devuelve los ofertas de un proveedor dado su dni
    """
    dni = normalize_dni(dni)
    prov = mongo.db.providers.find_one({"dni": dni})
    if not prov:
        return jsonify({"error": "Proveedor no encontrado"}), 404
    
    offers = list (mongo.db.offers.find({"provider_dni": dni}))
    offer_ids = [o["_id"] for o in offers]
    sales_count = mongo.db.bookings.count_documents({"offer_id": {"$in": offer_ids}})

    for o in offers:
        o["_id"] = str(o["_id"])
    prov["_id"] = str(prov["_id"])

    return jsonify({
        "provider": prov,
        "offers": offers,
        "sales_count": sales_count
    })