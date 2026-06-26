from werkzeug.security import generate_password_hash


def test_login_uses_generic_error_for_unknown_user(client):
    r = client.post(
        "/api/auth/login", json={"username": "missing", "password": "wrong"}
    )

    assert r.status_code == 401
    assert r.get_json()["error"] == "Credenciales inválidas"


def test_login_uses_generic_error_for_wrong_password(client, db):
    db.users.insert_one(
        {
            "username": "client@test",
            "password_hash": generate_password_hash("correct"),
            "role": "client",
            "ref_dni": "12345678A",
        }
    )

    r = client.post(
        "/api/auth/login", json={"username": "client@test", "password": "wrong"}
    )

    assert r.status_code == 401
    assert r.get_json()["error"] == "Credenciales inválidas"
