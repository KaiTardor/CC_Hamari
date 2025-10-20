from werkzeug.security import generate_password_hash

def test_login_ok(client, db):
    db.users.insert_one({
        "username": "admin@hamari.com",
        "password_hash": generate_password_hash("admin123"),
        "role": "admin",
        "ref_dni": None
    })

    r = client.post("/api/auth/login", json={"username":"admin@hamari.com","password":"admin123"})
    assert r.status_code == 200
    j = r.get_json()
    assert "token" in j and j["user"]["role"] == "admin"

def test_login_fail(client):
    r = client.post("/api/auth/login", json={"username":"x@x.com","password":"bad"})
    assert r.status_code in (401, 400)
