import os
import re

import pytest
from testcontainers.core.wait_strategies import LogMessageWaitStrategy
from testcontainers.mongodb import MongoDbContainer
from backend.utils.jwt import create_jwt
from backend import create_app


def _patched_connect(self) -> None:
    pattern = re.compile(r"waiting for connections", re.MULTILINE | re.IGNORECASE)
    LogMessageWaitStrategy(pattern).wait_until_ready(self)


MongoDbContainer._connect = _patched_connect

COLLECTIONS = [
    "users",
    "offers",
    "offer_inventory",
    "bookings",
    "clients",
    "providers",
    "staff",
]


@pytest.fixture(scope="session")
def mongo_uri_tmp():
    """
    Proporciona una URI de MongoDB temporal para tests
    """
    with MongoDbContainer("mongo:7") as mongo:
        uri = mongo.get_connection_url()
        if uri.endswith("/test"):
            uri = uri[:-5] + "/HamariDB_test"
        yield uri


@pytest.fixture(scope="session")
def app(mongo_uri_tmp):
    """
    Crea la app de Flask para tests
    """
    os.environ["MONGO_URI"] = mongo_uri_tmp
    os.environ["JWT_SECRET"] = os.getenv("JWT_SECRET", "testing-secret")

    app = create_app()
    with app.app_context():
        yield app


@pytest.fixture()
def client(app):
    """
    Proporciona el cliente de test de Flask
    """
    return app.test_client()


@pytest.fixture()
def db(app):
    """
    Proporciona la base de datos limpia para cada test
    """
    from backend import mongo

    for col in COLLECTIONS:
        try:
            mongo.db[col].delete_many({})
        except Exception:
            pass
    return mongo.db

@pytest.fixture()
def admin_headers():
    token = create_jwt(
        {"sub": "test-admin", "username": "admin@test", "role": "admin", "ref_dni": None}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def staff_headers():
    token = create_jwt(
        {"sub": "test-staff", "username": "staff@test", "role": "staff", "ref_dni": "34567890D"}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def client_headers():
    token = create_jwt(
        {"sub": "test-client", "username": "client@test", "role": "client", "ref_dni": "12345678A"}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def provider_headers():
    token = create_jwt(
        {"sub": "test-provider", "username": "provider@test", "role": "provider", "ref_dni": "23456789C"}
    )
    return {"Authorization": f"Bearer {token}"}
