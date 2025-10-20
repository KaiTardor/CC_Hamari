from werkzeug.security import generate_password_hash
from bson import ObjectId

def ah(t): return {"Authorization": f"Bearer {t}"}

def seed_user(db, username, role, ref_dni=None, pwd="pwd"):
    db.users.insert_one({
        "username": username,
        "password_hash": generate_password_hash(pwd),
        "role": role,
        "ref_dni": ref_dni
    })

def seed_client(db, dni):
    db.clients.insert_one({"dni": dni, "name": "Test", "surname": "User"})

def seed_offer_with_inventory(db, provider_dni="23456789C"):
    off = {
        "provider_dni": provider_dni,
        "title": "Kayak",
        "description": "desc",
        "price": 100.0,
        "people_included": 2,
        "available_from": "01/11/2025",
        "available_to": "03/11/2025",
        "daily_capacity": 2,
        "is_active": True
    }
    oid = db.offers.insert_one(off).inserted_id
    for d in ("01/11/2025","02/11/2025","03/11/2025"):
        db.offer_inventory.insert_one({"offer_id": oid, "date": d, "capacity": 2, "booked": 0})
    return str(oid)

def login_token(client, u, p):
    r = client.post("/api/auth/login", json={"username":u, "password":p})
    assert r.status_code == 200
    return r.get_json()["token"]

def test_client_booking_and_cancel(client, db):
    # seed client + offer
    seed_user(db, "12345678A", "client", ref_dni="12345678A", pwd="client123")
    seed_client(db, "12345678A")
    offer_id = seed_offer_with_inventory(db)

    token = login_token(client, "12345678A", "client123")

    # Crear reserva
    r1 = client.post("/api/bookings/", headers=ah(token), json={
        "offer_id": offer_id,
        "client_dni": "OTRO-IGNORADO",   # se ignora para client; se usa ref_dni
        "date": "01/11/2025"
    })
    assert r1.status_code == 201
    bk = r1.get_json()
    bid = bk["_id"]

    # Inventario quedó en booked=1
    inv = db.offer_inventory.find_one({"offer_id": ObjectId(offer_id), "date":"01/11/2025"})
    assert inv["booked"] == 1

    # Cancelar
    r2 = client.patch(f"/api/bookings/{bid}/status", headers=ah(token), json={"status":"CANCELLED"})
    assert r2.status_code == 200

    inv2 = db.offer_inventory.find_one({"offer_id": ObjectId(offer_id), "date":"01/11/2025"})
    assert inv2["booked"] == 0
