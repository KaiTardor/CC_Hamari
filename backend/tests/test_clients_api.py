from bson import ObjectId
from werkzeug.security import generate_password_hash


def seed_client(db, dni, **kwargs):
    """
    Crea un cliente en BD
    """
    defaults = {
        "dni": dni.upper(),
        "name": "Test",
        "surname": "Client",
        "email": "test@email.com",
        "phone": "600000000",
        "sex": "",
        "birth_date": "",
    }
    defaults.update(kwargs)
    db.clients.insert_one(defaults)


# ========== TESTS DE CREACIÓN ==========


def test_create_client_ok(client, db):
    """
    Crear cliente con todos los campos
    """
    payload = {
        "dni": "12345678A",
        "name": "Nombre",
        "surname": "Apellido",
        "email": "email@email.com",
        "phone": "600111222",
        "sex": "M",
        "birth_date": "01/01/1990",
    }
    r = client.post("/api/clients/", json=payload)
    assert r.status_code == 201

    # Verificar que se creó
    created = db.clients.find_one({"dni": "12345678A"})
    assert created is not None
    assert created["name"] == "Nombre"


def test_create_client_missing_fields(client, db):
    """
    Error cuando faltan campos obligatorios
    """
    payload = {
        "dni": "12345678A",
        "name": "Nombre",
        # Faltan surname, email, phone
    }
    r = client.post("/api/clients/", json=payload)
    assert r.status_code == 400


def test_create_client_duplicate(client, db):
    """
    Error al crear cliente con DNI duplicado
    """
    seed_client(db, "12345678A")

    payload = {
        "dni": "12345678A",
        "name": "Otro",
        "surname": "Apellido",
        "email": "otro@email.com",
        "phone": "600222333",
    }
    r = client.post("/api/clients/", json=payload)
    assert r.status_code == 400


# ========== TESTS DE LISTADO ==========
def test_list_clients_with_data(client, db):
    """
    Listar todos los clientes
    """
    seed_client(db, "11111111A", name="Cliente1")
    seed_client(db, "22222222B", name="Cliente2")

    r = client.get("/api/clients/")
    assert r.status_code == 200
    clients = r.get_json()
    assert len(clients) == 2


# ========== TESTS DE DETALLE ==========
def test_get_client_detail(client, db):
    """
    Obtener detalles de un cliente
    """
    seed_client(db, "12345678A", name="Nombre")

    r = client.get("/api/clients/12345678A")
    assert r.status_code == 200
    data = r.get_json()
    assert data["name"] == "Nombre"


def test_get_client_not_found(client, db):
    """
    Error cuando cliente no existe
    """
    r = client.get("/api/clients/99999999X")
    assert r.status_code == 404


# ========== TESTS DE ACTUALIZACIÓN ==========
def test_update_client(client, db):
    """
    Actualizar datos de un cliente
    """
    seed_client(db, "12345678A", name="Nombre")

    r = client.patch(
        "/api/clients/12345678A", json={"name": "Nombre_Nuevo", "phone": "666777888"}
    )
    assert r.status_code == 200

    # Verificar cambios
    updated = db.clients.find_one({"dni": "12345678A"})
    assert updated["name"] == "Nombre_Nuevo"
    assert updated["phone"] == "666777888"


# ========== TESTS DE ELIMINACIÓN ==========
def test_delete_client(client, db):
    """
    Eliminar un cliente
    """
    seed_client(db, "12345678A")

    r = client.delete("/api/clients/12345678A")
    assert r.status_code == 200

    # Verificar eliminación
    assert db.clients.find_one({"dni": "12345678A"}) is None


def test_delete_client_removes_bookings(client, db):
    """
    Eliminar cliente también elimina sus reservas
    """
    seed_client(db, "12345678A")

    # Crear una reserva para el cliente
    db.bookings.insert_one(
        {
            "offer_id": ObjectId(),
            "client_dni": "12345678A",
            "date": "01/11/2025",
            "status": "PENDING",
        }
    )

    assert db.bookings.count_documents({"client_dni": "12345678A"}) == 1

    # Eliminar cliente
    client.delete("/api/clients/12345678A")

    # Verificar que se eliminaron las reservas
    assert db.bookings.count_documents({"client_dni": "12345678A"}) == 0
