import pytest
from bson import ObjectId

from backend.services import offers_service as svc


def make_offer_payload(provider_dni="P123", title="T", desc="D", price=10.0,
                       people=1, from_d="01/01/2025", to_d="01/01/2025", daily_capacity=5):
    return {
        "provider_dni": provider_dni,
        "title": title,
        "description": desc,
        "price": price,
        "people_included": people,
        "available_from": from_d,
        "available_to": to_d,
        "daily_capacity": daily_capacity,
    }


def test_create_offer_service_success(db):
    data = make_offer_payload(provider_dni="PROV1")
    user = {"role": "provider", "ref_dni": "PROV1"}
    offer_id = svc.create_offer(db, data, user=user)
    assert isinstance(offer_id, str)
    doc = db.offers.find_one({"provider_dni": "PROV1"})
    assert doc is not None


def test_create_offer_service_forbidden(db):
    data = make_offer_payload(provider_dni="PROV2")
    user = {"role": "provider", "ref_dni": "OTHER"}
    with pytest.raises(PermissionError):
        svc.create_offer(db, data, user=user)


def test_list_offers_service_filters(db):
    # insert two offers
    db.offers.insert_one({"provider_dni": "A", "title": "one", "description": "x", "price": 5.0, "is_active": True})
    db.offers.insert_one({"provider_dni": "B", "title": "two", "description": "y", "price": 15.0, "is_active": True})

    res = svc.list_offers(db, min_price=10)
    assert isinstance(res, list)
    assert len(res) == 1
    assert res[0]["provider_dni"] == "B"


def test_update_offer_service(db):
    data = make_offer_payload(provider_dni="UPD", title="Old")
    user = {"role": "provider", "ref_dni": "UPD"}
    offer_id = svc.create_offer(db, data, user=user)

    ok = svc.update_offer(db, offer_id, {"title": "New"}, user=user)
    assert ok is True
    doc = db.offers.find_one({"_id": ObjectId(offer_id)})
    assert doc["title"] == "New"


def test_delete_offer_service(db):
    data = make_offer_payload(provider_dni="DEL", from_d="02/02/2025", to_d="02/02/2025")
    user = {"role": "provider", "ref_dni": "DEL"}
    offer_id = svc.create_offer(db, data, user=user)

    # ensure inventory created
    inv = list(db.offer_inventory.find({"offer_id": ObjectId(offer_id)}))
    assert len(inv) >= 1

    ok = svc.delete_offer(db, offer_id, user=user)
    assert ok is True
    assert db.offers.find_one({"_id": ObjectId(offer_id)}) is None
    assert db.offer_inventory.find_one({"offer_id": ObjectId(offer_id)}) is None


def test_check_availability_service(db):
    data = make_offer_payload(provider_dni="AV", from_d="03/03/2025", to_d="03/03/2025")
    user = {"role": "provider", "ref_dni": "AV"}
    offer_id = svc.create_offer(db, data, user=user)

    res = svc.check_availability(db, offer_id, "03/03/2025")
    assert res is not None
    assert res["available"] is True
    assert res["remaining"] == res["capacity"]
