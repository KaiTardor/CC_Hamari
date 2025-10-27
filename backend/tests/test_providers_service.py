import pytest
from backend.services import providers_service as svc


def make_provider_payload(dni="P1", company="Comp", email="a@x.com", phone="123"):
    return {"dni": dni, "company_name": company, "email": email, "phone": phone}


def test_create_provider_success(db):
    data = make_provider_payload(dni="PROV10")
    dni = svc.create_provider(db, data)
    assert dni == "PROV10"
    assert db.providers.find_one({"dni": "PROV10"}) is not None


def test_create_provider_duplicate(db):
    data = make_provider_payload(dni="DUP1")
    svc.create_provider(db, data)
    with pytest.raises(ValueError):
        svc.create_provider(db, data)


def test_get_provider_details_and_sales(db):
    # create provider and offers/bookings
    dni = "PDET"
    svc.create_provider(db, make_provider_payload(dni=dni))
    # insert offers and bookings
    o1 = db.offers.insert_one({"provider_dni": dni, "title": "o1", "is_active": True})
    o2 = db.offers.insert_one({"provider_dni": dni, "title": "o2", "is_active": True})
    db.bookings.insert_one({"offer_id": o1.inserted_id, "client_dni": "C1", "date": "01/01/2025"})

    res = svc.get_provider_details(db, dni)
    assert res is not None
    assert res["provider"]["dni"] == dni
    assert isinstance(res["offers"], list)
    assert res["sales_count"] == 1


def test_update_and_delete_provider(db):
    dni = "UPDEL"
    svc.create_provider(db, make_provider_payload(dni=dni))
    ok = svc.update_provider(db, dni, {"company_name": "NewCo"})
    assert ok is True
    doc = db.providers.find_one({"dni": dni})
    assert doc["company_name"] == "NewCo"

    # add an offer and ensure deletion cascades
    o = db.offers.insert_one({"provider_dni": dni, "title": "x"})
    db.offer_inventory.insert_one({"offer_id": o.inserted_id, "date": "01/01/2025", "capacity": 5, "booked": 0})
    ok = svc.delete_provider(db, dni)
    assert ok is True
    assert db.providers.find_one({"dni": dni}) is None
    assert db.offers.find_one({"provider_dni": dni}) is None
