from bson import ObjectId


def seed_provider(db, dni, **kwargs):
    """
    Crea un provider en BD
    """
    defaults = {
        "dni": dni.upper(),
        "company_name": "Test Company",
        "contact_name": "Contact",
        "contact_surname": "Test",
        "email": "provider@email.com",
        "phone": "600000000",
    }
    defaults.update(kwargs)
    db.providers.insert_one(defaults)


# ========== TESTS DE CREACIÓN ==========
def test_create_provider_ok(client, db):
    """
    Crear provider con todos los campos
    """
    payload = {
        "dni": "23456789C",
        "company_name": "Nombre Compañia",
        "contact_name": "Contacto",
        "contact_surname": "Apellido contacto",
        "email": "compañia@email.com",
        "phone": "600111222",
    }
    r = client.post("/api/providers/", json=payload)
    assert r.status_code == 201

    # Verificar que se creó
    created = db.providers.find_one({"dni": "23456789C"})
    assert created is not None
    assert created["company_name"] == "Nombre Compañia"


def test_create_provider_missing_fields(client, db):
    """
    Error cuando faltan campos obligatorios
    """
    payload = {
        "dni": "23456789C",
        "company_name": "Test",
        # Faltan email, phone
    }
    r = client.post("/api/providers/", json=payload)
    assert r.status_code == 400


def test_create_provider_duplicate(client, db):
    """
    Error al crear provider con DNI duplicado
    """
    seed_provider(db, "23456789C")

    payload = {
        "dni": "23456789C",
        "company_name": "Otra Empresa",
        "email": "otro@email.com",
        "phone": "600222333",
    }
    r = client.post("/api/providers/", json=payload)
    assert r.status_code == 400


# ========== TESTS DE LISTADO ==========
def test_list_providers_with_data(client, db):
    """
    Listar todos los providers
    """
    seed_provider(db, "11111111A", company_name="Provider1")
    seed_provider(db, "22222222B", company_name="Provider2")

    r = client.get("/api/providers/")
    assert r.status_code == 200
    providers = r.get_json()
    assert len(providers) == 2


# ========== TESTS DE DETALLE ==========
def test_get_provider_detail(client, db):
    """
    Obtener detalles de un provider con sus ofertas
    """
    seed_provider(db, "23456789C", company_name="Nombre Compañia")

    # Crear ofertas del provider
    db.offers.insert_one(
        {"provider_dni": "23456789C", "title": "Oferta 1", "price": 50.0}
    )
    db.offers.insert_one(
        {"provider_dni": "23456789C", "title": "Oferta 2", "price": 75.0}
    )

    r = client.get("/api/providers/23456789C")
    assert r.status_code == 200
    data = r.get_json()
    assert data["provider"]["company_name"] == "Nombre Compañia"
    assert len(data["offers"]) == 2


def test_get_provider_not_found(client, db):
    """
    Error cuando provider no existe
    """
    r = client.get("/api/providers/99999999X")
    assert r.status_code == 404


# ========== TESTS DE ACTUALIZACIÓN ==========


def test_update_provider(client, db):
    """
    Actualizar datos de un provider
    """
    seed_provider(db, "23456789C", company_name="Original")

    r = client.patch(
        "/api/providers/23456789C",
        json={"company_name": "Actualizada", "phone": "666777888"},
    )
    assert r.status_code == 200

    # Verificar cambios
    updated = db.providers.find_one({"dni": "23456789C"})
    assert updated["company_name"] == "Actualizada"
    assert updated["phone"] == "666777888"


# ========== TESTS DE ELIMINACIÓN ==========


def test_delete_provider(client, db):
    """
    Eliminar un provider
    """
    seed_provider(db, "23456789C")

    r = client.delete("/api/providers/23456789C")
    assert r.status_code == 200

    # Verificar eliminación
    assert db.providers.find_one({"dni": "23456789C"}) is None


def test_delete_provider_cascades(client, db):
    """
    Eliminar provider también elimina sus ofertas y reservas
    """
    seed_provider(db, "23456789C")

    # Crear oferta del provider
    offer_id = db.offers.insert_one(
        {"provider_dni": "23456789C", "title": "Oferta", "price": 50.0}
    ).inserted_id

    # Crear inventario
    db.offer_inventory.insert_one(
        {"offer_id": offer_id, "date": "01/11/2025", "capacity": 5, "booked": 0}
    )

    # Crear reserva
    db.bookings.insert_one(
        {
            "offer_id": offer_id,
            "client_dni": "CLIENT1",
            "date": "01/11/2025",
            "status": "PENDING",
        }
    )

    # Verificar que existen
    assert db.offers.count_documents({"provider_dni": "23456789C"}) == 1
    assert db.offer_inventory.count_documents({"offer_id": offer_id}) == 1
    assert db.bookings.count_documents({"offer_id": offer_id}) == 1

    # Eliminar provider
    client.delete("/api/providers/23456789C")

    # Verificar eliminación en cascada
    assert db.offers.count_documents({"provider_dni": "23456789C"}) == 0
    assert db.offer_inventory.count_documents({"offer_id": offer_id}) == 0
    assert db.bookings.count_documents({"offer_id": offer_id}) == 0
