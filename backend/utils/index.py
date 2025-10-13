def index(mongo):
    """
    Crear índices en las colecciones de la base de datos.
    """
    db = mongo.db

    # identificadores únicos
    db.clients.create_index("dni", unique=True)
    db.providers.create_index("dni", unique=True)
    db.staff.create_index("dni", unique=True)

    # filtros 
    db.offers.create_index([("category", 1), ("price", 1)])
    db.offers.create_index("is_active")

    # reservas
    db.bookings.create_index([("offer_id", 1), ("client_dni", 1)])
    db.bookings.create_index("date")

    # existencias 
    db.offer_inventory.create_index([("offer_id", 1), ("date", 1)], unique=True)
    db.offer_inventory.create_index("date") 
