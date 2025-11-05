from ..utils.utils import is_valid_email, is_valid_phone, normalize_dni


def create_provider(db, data):
    required = ("dni", "company_name", "email", "phone")
    if any(k not in data for k in required):
        raise ValueError("DNI, nombre de empresa, email y teléfono son obligatorios")

    if data.get("email") and not is_valid_email(data["email"]):
        raise ValueError("Email no válido")
    if data.get("phone") and not is_valid_phone(data["phone"]):
        raise ValueError("Teléfono no válido")

    dni = normalize_dni(data["dni"])
    if db.providers.find_one({"dni": dni}):
        raise ValueError("El proveedor ya existe")

    doc = {
        "dni": dni,
        "contact_name": data.get("contact_name"),
        "contact_surname": data.get("contact_surname"),
        "company_name": data["company_name"],
        "email": data.get("email"),
        "phone": data.get("phone"),
    }
    db.providers.insert_one(doc)
    return dni


def list_providers(db):
    return list(db.providers.find({}, {"_id": 0}))


def get_provider_details(db, dni):
    dni = normalize_dni(dni)
    prov = db.providers.find_one({"dni": dni})
    if not prov:
        return None
    offers = list(db.offers.find({"provider_dni": dni}))
    offer_ids = [o["_id"] for o in offers]
    sales_count = db.bookings.count_documents({"offer_id": {"$in": offer_ids}}) if offer_ids else 0

    for o in offers:
        o["_id"] = str(o["_id"])
    prov["_id"] = str(prov["_id"])

    return {"provider": prov, "offers": offers, "sales_count": sales_count}


def update_provider(db, dni, data):
    if "email" in data and not is_valid_email(data["email"]):
        raise ValueError("Email no válido")
    if "phone" in data and not is_valid_phone(data["phone"]):
        raise ValueError("Teléfono no válido")

    allowed = {"company_name", "contact_name", "contact_surname", "email", "phone"}
    update = {k: v for k, v in data.items() if k in allowed}
    if not update:
        raise ValueError("No hay campos para actualizar")

    res = db.providers.update_one({"dni": normalize_dni(dni)}, {"$set": update})
    return res.matched_count > 0


def delete_provider(db, dni):
    dni = normalize_dni(dni)
    res = db.providers.delete_one({"dni": dni})
    if res.deleted_count == 0:
        return False

    offers = list(db.offers.find({"provider_dni": dni}, {"_id": 1}))
    offer_ids = [o["_id"] for o in offers]
    if offer_ids:
        db.offers.delete_many({"_id": {"$in": offer_ids}})
        db.offer_inventory.delete_many({"offer_id": {"$in": offer_ids}})
        db.bookings.delete_many({"offer_id": {"$in": offer_ids}})
    return True
