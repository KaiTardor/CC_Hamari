def seed_staff(db, dni, **kwargs):
    """
    Crea un staff member en BD
    """
    defaults = {
        "dni": dni.upper(),
        "name": "Test",
        "surname": "Staff",
        "email": "staff@email.com",
        "phone": "600000000",
        "sex": "",
        "birth_date": ""
    }
    defaults.update(kwargs)
    db.staff.insert_one(defaults)


# ========== TESTS DE CREACIÓN ==========
def test_create_staff_ok(client, db):
    """
    Crear empleado con todos los campos
    """
    payload = {
        "dni": "34567890D",
        "name": "empleado",
        "surname": "Martínez",
        "email": "empleado@hamari.com",
        "phone": "600111222",
        "sex": "F",
        "birth_date": "15/05/1985"
    }
    r = client.post("/api/staff/", json=payload)
    assert r.status_code == 201
    
    # Verificar que se creó
    created = db.staff.find_one({"dni": "34567890D"})
    assert created is not None
    assert created["name"] == "empleado"


def test_create_staff_missing_fields(client, db):
    """
    Error cuando faltan campos obligatorios
    """
    payload = {
        "dni": "34567890D",
        "name": "Empleado"
        # Faltan surname, email, phone
    }
    r = client.post("/api/staff/", json=payload)
    assert r.status_code == 400


def test_create_staff_duplicate(client, db):
    """
    Error al crear empleado con DNI duplicado
    """
    seed_staff(db, "34567890D")
    
    payload = {
        "dni": "34567890D",
        "name": "Otro",
        "surname": "Empleado",
        "email": "otro@email.com",
        "phone": "600222333"
    }
    r = client.post("/api/staff/", json=payload)
    assert r.status_code == 409


# ========== TESTS DE LISTADO ==========
def test_list_staff_with_data(client, db):
    """
    Listar todos los empleados
    """
    seed_staff(db, "11111111A", name="Staff1")
    seed_staff(db, "22222222B", name="Staff2")
    
    r = client.get("/api/staff/")
    assert r.status_code == 200
    staff_list = r.get_json()
    assert len(staff_list) == 2


# ========== TESTS DE DETALLE ==========
def test_get_staff_detail(client, db):
    """
    Obtener detalles de un empleado
    """
    seed_staff(db, "34567890D", name="Empleado")
    
    r = client.get("/api/staff/34567890D")
    assert r.status_code == 200
    data = r.get_json()
    assert data["name"] == "Empleado"


def test_get_staff_not_found(client, db):
    """
    Error cuando empleado no existe
    """
    r = client.get("/api/staff/99999999X")
    assert r.status_code == 404


# ========== TESTS DE ACTUALIZACIÓN ==========

def test_update_staff(client, db):
    """
    Actualizar datos de un empleado
    """
    seed_staff(db, "34567890D", name="Original")
    
    r = client.patch("/api/staff/34567890D", json={
        "name": "Actualizado",
        "phone": "666777888"
    })
    assert r.status_code == 200
    
    # Verificar cambios
    updated = db.staff.find_one({"dni": "34567890D"})
    assert updated["name"] == "Actualizado"
    assert updated["phone"] == "666777888"


def test_update_staff_not_found(client, db):
    """
    Error al actualizar empleado que no existe
    """
    r = client.patch("/api/staff/99999999X", json={"name": "Test"})
    assert r.status_code == 400


# ========== TESTS DE ELIMINACIÓN ==========
def test_delete_staff(client, db):
    """
    Eliminar un empleado
    """
    seed_staff(db, "34567890D")
    
    r = client.delete("/api/staff/34567890D")
    assert r.status_code == 200
    
    # Verificar eliminación
    assert db.staff.find_one({"dni": "34567890D"}) is None

