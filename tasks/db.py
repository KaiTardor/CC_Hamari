from invoke import task

COMPOSE = "docker compose"
DB = "mongodb"

@task
def ping(c):
    """
    Hacer ping a la base de datos para comprobar si está activa.
    """
    c.run(f'{COMPOSE} exec {DB} mongosh --quiet --eval "db.runCommand({{ ping: 1 }})"', pty=True)

@task
def shell(c):
    """
    Abrir una shell interactiva en el contenedor de la base de datos.
    """
    c.run(f"{COMPOSE} exec {DB} mongosh", pty=True)


@task
def drop(c, db="HamariDB"):
    """
    Eliminar una base de datos concreta (db) en la base de datos.
    """
    c.run(f'{COMPOSE} exec {DB} mongosh --quiet --eval "db.getSiblingDB(\'{db}\').dropDatabase()"', pty=True)

@task
def stats(c, db="HamariDB"):
    """
    Mostrar las estadísticas de una base de datos concreta (db).
    """
    c.run(f'{COMPOSE} exec {DB} mongosh --quiet --eval "db.getSiblingDB(\'{db}\').stats()"', pty=True)

@task
def list_dbs(c):
    """
    Listar todas las bases de datos en la base de datos.
    """
    c.run(f'{COMPOSE} exec {DB} mongosh --quiet --eval "show dbs"', pty=True)