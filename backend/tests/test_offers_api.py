from werkzeug.security import generate_password_hash

def auth_header(token): return {"Authorization": f"Bearer {token}"}

def seed_user(db, username, role, ref_dni=None, pwd="pwd"):
    db.users.insert_one({
        "username": username,
        "password_hash": generate_password_hash(pwd),
        "role": role,
        "ref_dni": ref_dni
    })

def login_token(client, username, password):
    r = client.post("/api/auth/login", json={"username":username, "password":password})
    assert r.status_code == 200
    return r.get_json()["token"]

def test_provider_can_create_own_offer(client, db):
    seed_user(db, "23456789C", "provider", ref_dni="23456789C", pwd="provider123")
    token = login_token(client, "23456789C", "provider123")

    payload = {
        "provider_dni": "23456789C",
        "title": "Ruta guiada",
        "description": "desc",
        "price": 50.0,
        "people_included": 4,
        "available_from": "01/11/2025",
        "available_to": "03/11/2025",
        "daily_capacity": 5,
        "is_active": True
    }
    r = client.post("/api/offers/", headers=auth_header(token), json=payload)
    assert r.status_code == 201
    j = r.get_json()
    assert "offer_id" in j

def test_staff_cannot_create_offer(client, db):
    # staff
    db.users.insert_one({
        "username":"34567890D","password_hash":generate_password_hash("staff123"),
        "role":"staff","ref_dni":"34567890D"
    })
    token = login_token(client, "34567890D", "staff123")

    payload = {
        "provider_dni": "23456789C",
        "title": "No debería",
        "description": "desc",
        "price": 10.0,
        "people_included": 2,
        "available_from": "01/11/2025",
        "available_to": "02/11/2025",
        "daily_capacity": 3
    }
    r = client.post("/api/offers/", headers=auth_header(token), json=payload)
    assert r.status_code == 403
