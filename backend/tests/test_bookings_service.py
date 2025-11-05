import pytest
from bson import ObjectId
from backend.services import bookings_service as svc


def test_create_booking_and_cancel(db):
    # prepare client, offer and inventory
    db.clients.insert_one({"dni": "BC1", "name": "A"})
    o = db.offers.insert_one({"provider_dni": "P1", "is_active": True})
    db.offer_inventory.insert_one({"offer_id": o.inserted_id, "date": "10/10/2025", "capacity": 2, "booked": 0})

    user = {"role": "client", "ref_dni": "BC1"}
    data = {"offer_id": str(o.inserted_id), "date": "10/10/2025"}
    res = svc.create_booking(db, user, data)
    assert res["status"] == "PENDING"

    # check inventory booked increment
    inv = db.offer_inventory.find_one({"offer_id": o.inserted_id, "date": "10/10/2025"})
    assert inv["booked"] == 1

    # cancel booking
    bk_id = res["_id"]
    ok = svc.update_booking_status(db, bk_id, "CANCELLED", user)
    assert ok is True
    inv2 = db.offer_inventory.find_one({"offer_id": o.inserted_id, "date": "10/10/2025"})
    assert inv2["booked"] == 0


def test_create_booking_no_availability(db):
    db.clients.insert_one({"dni": "BC2", "name": "A"})
    o = db.offers.insert_one({"provider_dni": "P2", "is_active": True})
    db.offer_inventory.insert_one({"offer_id": o.inserted_id, "date": "11/11/2025", "capacity": 1, "booked": 1})
    user = {"role": "client", "ref_dni": "BC2"}
    data = {"offer_id": str(o.inserted_id), "date": "11/11/2025"}
    with pytest.raises(RuntimeError):
        svc.create_booking(db, user, data)
