from invoke import Collection
from . import docker, app, db, front

ns = Collection()
ns.add_collection(Collection.from_module(docker), name="dc")
ns.add_collection(Collection.from_module(app), name="app")
ns.add_collection(Collection.from_module(db), name="db")
ns.add_collection(Collection.from_module(front), name="front")