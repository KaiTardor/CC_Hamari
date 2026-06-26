from types import SimpleNamespace

import pytest
from bson import ObjectId

from backend.services.offers_service import update_offer
from backend.utils.errors import ConflictError


class FakeOffers:
    def __init__(self, offer):
        self.offer = offer

    def find_one(self, query):
        if query.get("_id") != self.offer["_id"]:
            return None
        if "provider_dni" in query and query["provider_dni"] != self.offer["provider_dni"]:
            return None
        return self.offer

    def update_one(self, query, update):
        if query.get("_id") != self.offer["_id"]:
            return SimpleNamespace(matched_count=0)
        self.offer.update(update["$set"])
        return SimpleNamespace(matched_count=1)


class FakeBookings:
    def __init__(self, count=0):
        self.count = count

    def count_documents(self, query, **kwargs):
        return self.count


class FakeInventory:
    def __init__(self):
        self.deleted_offer_id = None
        self.inserted = []

    def delete_many(self, query):
        self.deleted_offer_id = query["offer_id"]

    def insert_many(self, docs):
        self.inserted.extend(docs)


def make_db(bookings_count=0):
    offer_id = ObjectId()
    offer = {
        "_id": offer_id,
        "provider_dni": "23456789C",
        "available_from": "01/11/2025",
        "available_to": "02/11/2025",
        "daily_capacity": 5,
    }
    inventory = FakeInventory()
    db = SimpleNamespace(
        offers=FakeOffers(offer),
        bookings=FakeBookings(bookings_count),
        offer_inventory=inventory,
    )
    return db, offer, inventory


def test_update_offer_regenerates_inventory_when_capacity_changes_without_bookings():
    db, offer, inventory = make_db(bookings_count=0)

    ok = update_offer(db, str(offer["_id"]), {"daily_capacity": 3})

    assert ok is True
    assert offer["daily_capacity"] == 3
    assert inventory.deleted_offer_id == offer["_id"]
    assert [doc["capacity"] for doc in inventory.inserted] == [3, 3]
    assert [doc["booked"] for doc in inventory.inserted] == [0, 0]


def test_update_offer_blocks_inventory_changes_with_existing_bookings():
    db, offer, inventory = make_db(bookings_count=1)

    with pytest.raises(ConflictError):
        update_offer(db, str(offer["_id"]), {"daily_capacity": 3})

    assert offer["daily_capacity"] == 5
    assert inventory.inserted == []


def test_update_offer_rejects_inverted_availability_range():
    db, offer, inventory = make_db(bookings_count=0)

    with pytest.raises(ValueError, match="posterior"):
        update_offer(
            db,
            str(offer["_id"]),
            {"available_from": "03/11/2025", "available_to": "01/11/2025"},
        )

    assert inventory.inserted == []
