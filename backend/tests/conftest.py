import os
import pytest 
from testcontainers.mongodb import MongoDbContainer
from backend import create_app

COLLECTIONS = ["users", "offers", "offer_inventory", "bookings", "clients", "providers", "staff"]


@pytest.fixture(scope="session")
def mongo_uri_tmp():
    with MongoDbContainer("mongo:7") as mongo:
        uri = mongo.get_connection_url()
        if uri.endswith("/test"):
            uri = uri[:-5] + "/HamariDB_test"
        yield uri

@pytest.fixture(scope="session")
def app(mongo_uri_tmp):
    # Inyecta MONGO_URI y secreto de JWT para la app de tests
    os.environ["MONGO_URI"] = mongo_uri_tmp
    os.environ["JWT_SECRET"] = os.getenv("JWT_SECRET", "testing-secret")

    app = create_app()
    with app.app_context():
        yield app

@pytest.fixture()
def client(app):
    return app.test_client()

@pytest.fixture()
def db(app):
    from backend import mongo
    for col in COLLECTIONS:
        try:
            mongo.db[col].delete_many({})
        except Exception:
            pass
    return mongo.db