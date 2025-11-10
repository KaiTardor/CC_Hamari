from datetime import date as Date
from datetime import datetime

from bson import ObjectId
from flask import Flask
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash

from ..config import Config
from .dates import *
from .utils import *


def seed():
    # Crear BD simplificada de ejemplo
    app = Flask(__name__)
    app.config.from_object(Config)
    mongo = PyMongo(app)
    db = mongo.db

    # Limpieza
    for name in [
        "clients",
        "providers",
        "staff",
        "offers",
        "bookings",
        "offer_inventory",
    ]:
        db[name].delete_many({})

    # Clientes
    c1 = normalize_dni("12345678A")
    c2 = normalize_dni("87654321B")

    db.clients.insert_many(
        [
            {
                "dni": c1,
                "name": "Angela",
                "surname": "Melero Martinez",
                "sex": "F",
                "birth_date": "24/05/1990",
                "email": "angela@example.com",
                "phone": "612345678",
            },
            {
                "dni": c2,
                "name": "Adrian",
                "surname": "Maldonado Vega",
                "sex": "M",
                "birth_date": "15/08/2000",
                "email": "adrian@example.com",
                "phone": "698765432",
            },
        ]
    )

    # Proveedor
    p1 = normalize_dni("23456789C")
    db.providers.insert_one(
        {
            "dni": p1,
            "contact_name": "Marta",
            "contact_surname": "Torres Cisneros",
            "company_name": "Empresa S.L.",
            "email": "marta@empresa.com",
            "phone": "623456789",
        }
    )

    # Personal
    s1 = normalize_dni("34567890D")
    s2 = normalize_dni("45678901E")
    db.staff.insert_many(
        [
            {
                "dni": s1,
                "name": "Mario",
                "surname": "Casas Perez",
                "email": "mario@hamari.com",
                "phone": "634567890",
            },
            {
                "dni": s2,
                "name": "Marina",
                "surname": "Ruiz Palomino",
                "email": "marina@hamari.com",
                "phone": "645678901",
            },
        ]
    )

    # Ofertas disponibles

    offer_docs = [
        {
            "_id": ObjectId(),
            "provider_dni": p1,
            "title": "Conexiones con el cielo y la noche",
            "description": "texto texto texto textotexto textotextotextotextotextotexto texto texto texto",
            "price": 200.00,
            "people_included": 10,
            "available_from": "01/11/2025",
            "available_to": "15/01/2026",
            "daily_capacity": 10,
            "is_active": True,
        },
        {
            "_id": ObjectId(),
            "provider_dni": p1,
            "title": "Gula saciada",
            "description": "aaaaa aaa aaaa aaaaa aaaaa aaaaa aaaaa aaaaa aaaaa aaaaa aaaaa aaaaa aaaaa",
            "price": 150.00,
            "people_included": 4,
            "valid_date": Date(2025, 11, 1).strftime("%d/%m/%Y"),
            "available_from": "15/11/2025",
            "available_to": "15/12/2025",
            "daily_capacity": 5,
            "is_active": True,
        },
    ]

    db.offers.insert_many(offer_docs)

    # Existencias
    inventory_bulk = []
    for off in offer_docs:
        for d in daterange(off["available_from"], off["available_to"]):
            inventory_bulk.append(
                {
                    "offer_id": off["_id"],
                    "date": d,
                    "capacity": off["daily_capacity"],
                    "booked": 0,
                }
            )
    if inventory_bulk:
        db.offer_inventory.insert_many(inventory_bulk)

    # Reservas de ejemplo (1 plaza cada una)
    db.bookings.insert_many(
        [
            {
                "offer_id": offer_docs[0]["_id"],
                "client_dni": c1,
                "date": "02/11/2025",
                "status": "PENDING",
            },
            {
                "offer_id": offer_docs[1]["_id"],
                "client_dni": c2,
                "date": "20/11/2025",
                "status": "CONFIRMED",
            },
        ]
    )
    db.offer_inventory.update_one(
        {"offer_id": offer_docs[0]["_id"], "date": "02/11/2025"},
        {"$inc": {"booked": 1}},
    )
    db.offer_inventory.update_one(
        {"offer_id": offer_docs[1]["_id"], "date": "20/11/2025"},
        {"$inc": {"booked": 1}},
    )

    print("   Provider DNI:", p1)
    print("   Staff DNI   :", s1, s2)
    print("   Clients DNI :", c1, c2)
    print("   Offers IDs  :", [str(doc["_id"]) for doc in offer_docs])
    print("   Inventario  :", len(inventory_bulk), "días generados")

    # seed_users(db)


if __name__ == "__main__":
    seed()
