import pytest
from backend.services import clients_service as svc


def make_client(dni="C1", name="N", surname="S", phone="123", email="e@x.com"):
    return {"dni": dni, "name": name, "surname": surname, "phone": phone, "email": email}


def test_create_and_get_client(db):
    data = make_client(dni="CL1")
    dni = svc.create_client(db, data)
    assert dni == "CL1"
    doc = svc.get_client(db, "CL1")
    assert doc is not None


def test_duplicate_client(db):
    data = make_client(dni="CLD")
    svc.create_client(db, data)
    with pytest.raises(ValueError):
        svc.create_client(db, data)


def test_update_and_delete_client(db):
    dni = "CLUP"
    svc.create_client(db, make_client(dni=dni))
    ok = svc.update_client(db, dni, {"name": "NewName"})
    assert ok is True
    doc = svc.get_client(db, dni)
    assert doc["name"] == "NewName"

    # add booking then delete
    db.bookings.insert_one({"offer_id": None, "client_dni": dni, "date": "01/01/2025"})
    ok = svc.delete_client(db, dni)
    assert ok is True
    assert svc.get_client(db, dni) is None