from types import SimpleNamespace

from bson import ObjectId

from backend.services.bookings_service import create_booking, update_booking_status


class FakeCollection:
    def __init__(self, doc=None, insert_error=None):
        self.doc = doc
        self.insert_error = insert_error

    def find_one(self, query):
        if self.doc is None:
            return None
        if "_id" in query and self.doc.get("_id") != query["_id"]:
            return None
        return self.doc

    def find_one_and_update(self, query, update, return_document=None):
        if self.doc is None:
            return None
        if self.doc.get("booked", 0) >= self.doc.get("capacity", 0):
            return None
        self.doc["booked"] += update["$inc"]["booked"]
        return self.doc

    def insert_one(self, doc):
        if self.insert_error:
            raise self.insert_error
        self.doc = {**doc, "_id": ObjectId()}
        return SimpleNamespace(inserted_id=self.doc["_id"])

    def update_one(self, query, update):
        if self.doc is None:
            return SimpleNamespace(matched_count=0)
        if query.get("booked", {}).get("$gt") == 0 and self.doc.get("booked", 0) <= 0:
            return SimpleNamespace(matched_count=0)
        if "$inc" in update:
            for key, value in update["$inc"].items():
                self.doc[key] = self.doc.get(key, 0) + value
        if "$set" in update:
            self.doc.update(update["$set"])
        return SimpleNamespace(matched_count=1)


def test_create_booking_rolls_back_inventory_when_insert_fails():
    offer_id = ObjectId()
    inventory = {"offer_id": offer_id, "date": "01/11/2025", "capacity": 1, "booked": 0}
    db = SimpleNamespace(
        clients=FakeCollection({"dni": "12345678A"}),
        offers=FakeCollection({"_id": offer_id, "is_active": True}),
        offer_inventory=FakeCollection(inventory),
        bookings=FakeCollection(insert_error=RuntimeError("insert failed")),
    )

    try:
        create_booking(
            db,
            {"role": "staff"},
            {"offer_id": str(offer_id), "client_dni": "12345678A", "date": "01/11/2025"},
        )
    except RuntimeError:
        pass

    assert inventory["booked"] == 0


def test_cancel_booking_does_not_make_inventory_negative():
    offer_id = ObjectId()
    booking_id = ObjectId()
    booking = {
        "_id": booking_id,
        "offer_id": offer_id,
        "client_dni": "12345678A",
        "date": "01/11/2025",
        "status": "PENDING",
    }
    inventory = {"offer_id": offer_id, "date": "01/11/2025", "capacity": 1, "booked": 0}
    db = SimpleNamespace(
        bookings=FakeCollection(booking),
        offer_inventory=FakeCollection(inventory),
    )

    update_booking_status(db, str(booking_id), "CANCELLED", {"role": "staff"})

    assert inventory["booked"] == 0
    assert booking["status"] == "CANCELLED"
