from ..utils.utils import is_valid_email, is_valid_phone, normalize_dni


def create_client(db, data):
    required = ["dni", "name", "surname", "phone", "email"]
    if any(k not in data for k in required):
        raise ValueError("Faltan campos obligatorios. Los campos requeridos son: " + ", ".join(required))

    if data.get("email") and not is_valid_email(data["email"]):
        raise ValueError("Email no válido")
    if data.get("phone") and not is_valid_phone(data["phone"]):
        raise ValueError("Teléfono no válido")

    dni = normalize_dni(data["dni"])
    if db.clients.find_one({"dni": dni}):
        raise ValueError("El cliente ya existe")

    doc = {
        "dni": dni,
        "name": data["name"],
        "surname": data["surname"],
        "sex": data.get("sex", ""),
        "birth_date": data.get("birth_date", ""),
        "email": data["email"],
        "phone": data["phone"],
    }
    db.clients.insert_one(doc)
    return dni


def list_clients(db):
    return list(db.clients.find({}, {"_id": 0}))


def get_client(db, dni):
    doc = db.clients.find_one({"dni": normalize_dni(dni)}, {"_id": 0})
    return doc


def update_client(db, dni, data):
    if "email" in data and not is_valid_email(data["email"]):
        raise ValueError("Email no válido")
    if "phone" in data and not is_valid_phone(data["phone"]):
        raise ValueError("Teléfono no válido")

    allowed = ["name", "surname", "sex", "birth_date", "email", "phone"]
    update = {k: v for k, v in data.items() if k in allowed}
    if not update:
        raise ValueError("No hay campos para actualizar")
    res = db.clients.update_one({"dni": normalize_dni(dni)}, {"$set": update})
    return res.modified_count > 0


def delete_client(db, dni):
    r = db.clients.delete_one({"dni": normalize_dni(dni)})
    if r.deleted_count == 0:
        return False
    db.bookings.delete_many({"client_dni": normalize_dni(dni)})
    return True
