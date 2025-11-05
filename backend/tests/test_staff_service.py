import pytest
from backend.services import staff_service as svc


def make_staff(dni="S1", name="N", surname="S", phone="123", email="e@x.com"):
    return {"dni": dni, "name": name, "surname": surname, "phone": phone, "email": email}


def test_create_and_get_staff(db):
    data = make_staff(dni="ST1")
    dni = svc.create_staff(db, data)
    assert dni == "ST1"
    doc = svc.get_staff(db, "ST1")
    assert doc is not None


def test_update_and_delete_staff(db):
    dni = "STUP"
    svc.create_staff(db, make_staff(dni=dni))
    ok = svc.update_staff(db, dni, {"name": "New"})
    assert ok is True
    assert svc.get_staff(db, dni)["name"] == "New"

    ok = svc.delete_staff(db, dni)
    assert ok is True
    assert svc.get_staff(db, dni) is None
