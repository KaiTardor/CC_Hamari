from werkzeug.security import generate_password_hash
from bson import ObjectId

def ah(token):
    """
    Helper para crear header de autorización
    """
    return {"Authorization": f"Bearer {token}"}

def seed_user(db, username, role, ref_dni=None, pwd="pwd"):
    """
    Crea un usuario en BD
    """
    db.users.insert_one({
        "username": username,
        "password_hash": generate_password_hash(pwd),
        "role": role,
        "ref_dni": ref_dni
    })

def login_token(client, username, password):
    """
    Login y retorna el token
    """
    r = client.post("/api/auth/login", json={"username": username, "password": password})
    assert r.status_code == 200
    return r.get_json()["token"]


# ========== TESTS DE LOGIN ==========

def test_login_ok(client, db):
    """
    Login exitoso con credenciales válidas
    """
    db.users.insert_one({
        "username": "admin@hamari.com",
        "password_hash": generate_password_hash("admin123"),
        "role": "admin",
        "ref_dni": None
    })

    r = client.post("/api/auth/login", json={"username":"admin@hamari.com","password":"admin123"})
    assert r.status_code == 200
    j = r.get_json()
    assert "token" in j 
    assert j["user"]["role"] == "admin"
    assert j["user"]["username"] == "admin@hamari.com"


def test_login_fail_wrong_password(client, db):
    """
    Login falla con contraseña incorrecta
    """
    seed_user(db, "user@email.com", "client", pwd="correct")
    
    r = client.post("/api/auth/login", json={"username":"user@email.com","password":"wrong"})
    assert r.status_code == 401


def test_login_fail_user_not_found(client, db):
    """
    Login falla con usuario no existente
    """
    r = client.post("/api/auth/login", json={"username":"x@x.com","password":"bad"})
    assert r.status_code == 401


def test_login_fail_missing_fields(client, db):
    """
    Login falla sin username o password
    """
    r = client.post("/api/auth/login", json={"username":"test@email.com"})
    assert r.status_code == 400
    
    r = client.post("/api/auth/login", json={"password":"pwd"})
    assert r.status_code == 400


# ========== TESTS DE /ME ==========

def test_me_with_valid_token(client, db):
    """
    Endpoint /me retorna datos de usuario con token válido
    """
    seed_user(db, "user@email.com", "client", ref_dni="12345678A", pwd="pwd")
    token = login_token(client, "user@email.com", "pwd")
    
    r = client.get("/api/auth/me", headers=ah(token))
    assert r.status_code == 200
    data = r.get_json()
    assert data["user"]["username"] == "user@email.com"
    assert data["user"]["role"] == "client"


def test_me_without_token(client, db):
    """
    Endpoint /me falla sin token
    """
    r = client.get("/api/auth/me")
    assert r.status_code == 401


def test_me_with_invalid_token(client, db):
    """Endpoint /me falla con token inválido"""
    r = client.get("/api/auth/me", headers=ah("invalid-token"))
    assert r.status_code == 401


# ========== TESTS DE AUTORIZACIÓN GENERAL ==========

def test_unauthorized_access_without_token(client, db):
    """
    Acceso denegado a rutas protegidas sin token
    """
    # Intentar acceder a ofertas sin token
    r = client.get("/api/offers/")
    assert r.status_code == 401
    
    r = client.post("/api/offers/", json={})
    assert r.status_code == 401


def test_admin_has_full_access(client, db):
    """Admin tiene acceso completo a todas las rutas"""
    seed_user(db, "admin@hamari.com", "admin", pwd="admin123")
    token = login_token(client, "admin@hamari.com", "admin123")
    
    # Admin puede crear ofertas para cualquier provider
    payload = {
        "provider_dni": "23456789C",
        "title": "Test Offer",
        "description": "desc",
        "price": 50.0,
        "people_included": 2,
        "available_from": "01/11/2025",
        "available_to": "03/11/2025",
        "daily_capacity": 5
    }
    r = client.post("/api/offers/", headers=ah(token), json=payload)
    assert r.status_code == 201