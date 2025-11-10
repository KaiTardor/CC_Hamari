from bson import ObjectId
from werkzeug.security import generate_password_hash


def auth_header(token):
    """
    Retorna el header de autorización con el token JWT
    """
    return {"Authorization": f"Bearer {token}"}


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


def login_token(client, username, password):
    """
    Realiza login y retorna el token JWT
    """
    r = client.post(
        "/api/auth/login", json={"username": username, "password": password}
    )
    assert r.status_code == 200
    return r.get_json()["token"]


def seed_offer(db, provider_dni="23456789C", **kwargs):
    """
    Crea una oferta en BD y retorna su ID
    """
    defaults = {
        "provider_dni": provider_dni,
        "title": "Oferta test test testtest",
        "description": "Descripción testtesttest ",
        "price": 50.0,
        "people_included": 2,
        "available_from": "01/11/2025",
        "available_to": "03/11/2025",
        "daily_capacity": 5,
        "is_active": True,
    }
    defaults.update(kwargs)
    oid = db.offers.insert_one(defaults).inserted_id

    # Crear inventario
    for d in ["01/11/2025", "02/11/2025", "03/11/2025"]:
        db.offer_inventory.insert_one(
            {
                "offer_id": oid,
                "date": d,
                "capacity": defaults["daily_capacity"],
                "booked": 0,
            }
        )
    return str(oid)


# ========== TESTS DE CREACIÓN ==========


def test_provider_can_create_own_offer(client, db):
    """
    Proveedor crea una oferta propia
    """
    seed_user(db, "23456789C", "provider", ref_dni="23456789C", pwd="provider123")
    token = login_token(client, "23456789C", "provider123")

    payload = {
        "provider_dni": "23456789C",
        "title": "Proveedor crea oferta",
        "description": "Proveedor crea oferta Proveedor crea oferta",
        "price": 50.0,
        "people_included": 4,
        "available_from": "01/11/2025",
        "available_to": "03/11/2025",
        "daily_capacity": 5,
        "is_active": True,
    }
    r = client.post("/api/offers/", headers=auth_header(token), json=payload)
    assert r.status_code == 201
    j = r.get_json()
    assert "offer_id" in j


def test_provider_cannot_create_offer_for_other_provider(client, db):
    """
    Proveedor intenta crear oferta para otro proveedor
    """
    seed_user(db, "23456789C", "provider", ref_dni="23456789C", pwd="pwd")
    token = login_token(client, "23456789C", "pwd")

    payload = {
        "provider_dni": "99999999X",
        "title": "Proveedor crea oferta otro proveedor",
        "description": "Proveedor crea oferta otro proveedor Proveedor crea oferta otro proveedor",
        "price": 50.0,
        "people_included": 4,
        "available_from": "01/11/2025",
        "available_to": "03/11/2025",
        "daily_capacity": 5,
    }
    r = client.post("/api/offers/", headers=auth_header(token), json=payload)
    assert r.status_code == 403


# ========== TESTS DE LISTADO Y FILTROS ==========


def test_list_offers_with_filters(client, db):
    """
    Listado de ofertas con filtros
    """
    seed_user(db, "client@email.com", "client", ref_dni="12345678A", pwd="pwd")
    token = login_token(client, "client@email.com", "pwd")

    seed_offer(db, title="AAA", price=20.0, is_active=True)
    seed_offer(db, title="BBB", price=50.0, is_active=True)
    seed_offer(db, title="CCC", price=100.0, is_active=False)

    # Solo activas
    r = client.get("/api/offers/", headers=auth_header(token))
    assert r.status_code == 200
    assert len(r.get_json()) == 2

    # Por precio
    r = client.get("/api/offers/?min_price=30&max_price=80", headers=auth_header(token))
    assert r.status_code == 200
    assert len(r.get_json()) == 1


# ========== TESTS DE DETALLE ==========


def test_get_offer_detail(client, db):
    """
    Detalle de una oferta concreta
    """
    seed_user(db, "client@email.com", "client", ref_dni="12345678A", pwd="pwd")
    token = login_token(client, "client@email.com", "pwd")

    offer_id = seed_offer(db, title="Detalle test")

    r = client.get(f"/api/offers/{offer_id}", headers=auth_header(token))
    assert r.status_code == 200
    assert r.get_json()["title"] == "Detalle test"


def test_get_offer_not_found(client, db):
    """
    Detalle de oferta no existente
    """
    seed_user(db, "client@email.com", "client", ref_dni="12345678A", pwd="pwd")
    token = login_token(client, "client@email.com", "pwd")

    r = client.get(f"/api/offers/{str(ObjectId())}", headers=auth_header(token))
    assert r.status_code == 404


# ========== TESTS DE ACTUALIZACIÓN DE OFERTAS ==========
def test_provider_can_update_own_offer(client, db):
    """
    Proveedor actualiza su propia oferta
    """
    seed_user(db, "23456789C", "provider", ref_dni="23456789C", pwd="pwd")
    token = login_token(client, "23456789C", "pwd")

    offer_id = seed_offer(db, provider_dni="23456789C", title="Original")

    r = client.patch(
        f"/api/offers/{offer_id}",
        headers=auth_header(token),
        json={"title": "Actualizado"},
    )
    assert r.status_code == 200
    assert db.offers.find_one({"_id": ObjectId(offer_id)})["title"] == "Actualizado"


def test_provider_cannot_update_other_offer(client, db):
    """
    Proveedor intenta actualizar oferta de otro proveedor
    """
    seed_user(db, "23456789C", "provider", ref_dni="23456789C", pwd="pwd")
    token = login_token(client, "23456789C", "pwd")

    offer_id = seed_offer(db, provider_dni="OTRO-DNI")

    r = client.patch(
        f"/api/offers/{offer_id}", headers=auth_header(token), json={"title": "X"}
    )
    assert r.status_code == 403


# ========== TESTS DE ELIMINACIÓN ==========


def test_provider_can_delete_own_offer(client, db):
    """
    Proveedor elimina su propia oferta
    """
    seed_user(db, "23456789C", "provider", ref_dni="23456789C", pwd="pwd")
    token = login_token(client, "23456789C", "pwd")

    offer_id = seed_offer(db, provider_dni="23456789C")

    r = client.delete(f"/api/offers/{offer_id}", headers=auth_header(token))
    assert r.status_code == 200
    assert db.offers.find_one({"_id": ObjectId(offer_id)}) is None


def test_provider_cannot_delete_other_offer(client, db):
    """
    Proveedor intenta eliminar oferta de otro proveedor
    """
    seed_user(db, "23456789C", "provider", ref_dni="23456789C", pwd="pwd")
    token = login_token(client, "23456789C", "pwd")

    offer_id = seed_offer(db, provider_dni="OTRO-DNI")

    r = client.delete(f"/api/offers/{offer_id}", headers=auth_header(token))
    assert r.status_code == 403


# ========== TESTS DE DISPONIBILIDAD ==========
def test_offer_availability(client, db):
    seed_user(db, "client@email.com", "client", ref_dni="12345678A", pwd="pwd")
    token = login_token(client, "client@email.com", "pwd")

    offer_id = seed_offer(db, daily_capacity=5)

    # Con disponibilidad
    r = client.get(
        f"/api/offers/{offer_id}/availability?date=01/11/2025",
        headers=auth_header(token),
    )
    assert r.status_code == 200
    assert r.get_json()["available"] is True

    # Sin disponibilidad
    db.offer_inventory.update_one(
        {"offer_id": ObjectId(offer_id), "date": "01/11/2025"}, {"$set": {"booked": 5}}
    )

    r = client.get(
        f"/api/offers/{offer_id}/availability?date=01/11/2025",
        headers=auth_header(token),
    )
    assert r.status_code == 200
    assert r.get_json()["available"] is False
