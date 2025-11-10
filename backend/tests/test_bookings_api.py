from bson import ObjectId
from werkzeug.security import generate_password_hash


def ah(t):
    """
    Retorna el header de autorización con el token JWT
    """
    return {"Authorization": f"Bearer {t}"}


def seed_user(db, username, role, ref_dni=None, pwd="pwd"):
    """
    Crea un usuario en BD
    """
    db.users.insert_one(
        {
            "username": username,
            "password_hash": generate_password_hash(pwd),
            "role": role,
            "ref_dni": ref_dni,
        }
    )


def seed_client(db, dni, name="Test", surname="User"):
    """
    Crea un cliente en BD
    """
    db.clients.insert_one({"dni": dni, "name": name, "surname": surname})


def seed_offer_with_inventory(db, provider_dni="23456789C", daily_capacity=2, **kwargs):
    """
    Crea una oferta en BD con inventario y retorna su ID
    """
    defaults = {
        "provider_dni": provider_dni,
        "title": "Kayak",
        "description": "desc",
        "price": 100.0,
        "people_included": 2,
        "available_from": "01/11/2025",
        "available_to": "03/11/2025",
        "daily_capacity": daily_capacity,
        "is_active": True,
    }
    defaults.update(kwargs)
    oid = db.offers.insert_one(defaults).inserted_id

    for d in ("01/11/2025", "02/11/2025", "03/11/2025"):
        db.offer_inventory.insert_one(
            {"offer_id": oid, "date": d, "capacity": daily_capacity, "booked": 0}
        )
    return str(oid)


def login_token(client, u, p):
    """
    Realiza login y retorna el token JWT
    """
    r = client.post("/api/auth/login", json={"username": u, "password": p})
    assert r.status_code == 200
    return r.get_json()["token"]


# ========== TESTS DE CREACIÓN ==========


def test_client_booking_and_cancel(client, db):
    """
    Cliente crea y cancela su reserva
    """
    seed_user(db, "12345678A", "client", ref_dni="12345678A", pwd="client123")
    seed_client(db, "12345678A")
    offer_id = seed_offer_with_inventory(db)
    token = login_token(client, "12345678A", "client123")

    # Crear reserva
    r1 = client.post(
        "/api/bookings/",
        headers=ah(token),
        json={"offer_id": offer_id, "date": "01/11/2025"},
    )
    assert r1.status_code == 201
    bid = r1.get_json()["_id"]

    # Verificar inventario
    inv = db.offer_inventory.find_one(
        {"offer_id": ObjectId(offer_id), "date": "01/11/2025"}
    )
    assert inv["booked"] == 1

    # Cancelar
    r2 = client.patch(
        f"/api/bookings/{bid}/status", headers=ah(token), json={"status": "CANCELLED"}
    )
    assert r2.status_code == 200

    # Verificar liberación de plaza
    inv2 = db.offer_inventory.find_one(
        {"offer_id": ObjectId(offer_id), "date": "01/11/2025"}
    )
    assert inv2["booked"] == 0


def test_staff_can_create_booking_for_client(client, db):
    """
    Staff puede crear reserva para cualquier cliente
    """
    seed_user(db, "staff@email.com", "staff", ref_dni="STAFF1", pwd="pwd")
    seed_client(db, "12345678A")
    offer_id = seed_offer_with_inventory(db)
    token = login_token(client, "staff@email.com", "pwd")

    r = client.post(
        "/api/bookings/",
        headers=ah(token),
        json={"offer_id": offer_id, "client_dni": "12345678A", "date": "01/11/2025"},
    )
    assert r.status_code == 201
    assert r.get_json()["client_dni"] == "12345678A"


def test_booking_no_capacity(client, db):
    """
    Error cuando no hay capacidad
    """
    seed_user(db, "12345678A", "client", ref_dni="12345678A", pwd="pwd")
    seed_client(db, "12345678A")
    offer_id = seed_offer_with_inventory(db, daily_capacity=1)

    # Llenar capacidad
    db.offer_inventory.update_one(
        {"offer_id": ObjectId(offer_id), "date": "01/11/2025"}, {"$set": {"booked": 1}}
    )

    token = login_token(client, "12345678A", "pwd")
    r = client.post(
        "/api/bookings/",
        headers=ah(token),
        json={"offer_id": offer_id, "date": "01/11/2025"},
    )
    assert r.status_code == 409


def test_booking_client_not_exists(client, db):
    """
    Error si cliente no existe
    """
    seed_user(db, "12345678A", "client", ref_dni="12345678A", pwd="pwd")
    offer_id = seed_offer_with_inventory(db)
    token = login_token(client, "12345678A", "pwd")

    r = client.post(
        "/api/bookings/",
        headers=ah(token),
        json={"offer_id": offer_id, "date": "01/11/2025"},
    )
    assert r.status_code == 404


# ========== TESTS DE LISTADO ==========


def test_client_list_own_bookings(client, db):
    """
    Cliente solo ve sus reservas
    """
    seed_user(db, "client1@email.com", "client", ref_dni="11111111A", pwd="pwd")
    seed_user(db, "client2@email.com", "client", ref_dni="22222222B", pwd="pwd")
    seed_client(db, "11111111A")
    seed_client(db, "22222222B")

    offer_id = seed_offer_with_inventory(db, daily_capacity=5)
    token1 = login_token(client, "client1@email.com", "pwd")
    token2 = login_token(client, "client2@email.com", "pwd")

    # Crear reservas
    client.post(
        "/api/bookings/",
        headers=ah(token1),
        json={"offer_id": offer_id, "date": "01/11/2025"},
    )
    client.post(
        "/api/bookings/",
        headers=ah(token2),
        json={"offer_id": offer_id, "date": "02/11/2025"},
    )

    # Cliente 1 solo ve su reserva
    r = client.get("/api/bookings/", headers=ah(token1))
    assert r.status_code == 200
    bookings = r.get_json()
    assert len(bookings) == 1
    assert bookings[0]["client_dni"] == "11111111A"


def test_staff_list_bookings_by_dni(client, db):
    """
    Staff puede filtrar reservas por DNI
    """
    seed_user(db, "staff@email.com", "staff", ref_dni="STAFF1", pwd="pwd")
    seed_client(db, "11111111A")
    offer_id = seed_offer_with_inventory(db)

    db.bookings.insert_one(
        {
            "offer_id": ObjectId(offer_id),
            "client_dni": "11111111A",
            "date": "01/11/2025",
            "status": "PENDING",
        }
    )

    token = login_token(client, "staff@email.com", "pwd")
    r = client.get("/api/bookings/?dni=11111111A", headers=ah(token))
    assert r.status_code == 200
    assert len(r.get_json()) == 1


# ========== TESTS DE ACTUALIZACIÓN DE ESTADO ==========


def test_client_cannot_confirm_booking(client, db):
    """
    Cliente solo puede cancelar
    """
    seed_user(db, "12345678A", "client", ref_dni="12345678A", pwd="pwd")
    seed_client(db, "12345678A")
    offer_id = seed_offer_with_inventory(db)
    token = login_token(client, "12345678A", "pwd")

    r1 = client.post(
        "/api/bookings/",
        headers=ah(token),
        json={"offer_id": offer_id, "date": "01/11/2025"},
    )
    booking_id = r1.get_json()["_id"]

    r2 = client.patch(
        f"/api/bookings/{booking_id}/status",
        headers=ah(token),
        json={"status": "CONFIRMED"},
    )
    assert r2.status_code == 403
