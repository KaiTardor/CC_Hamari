from invoke import task

COMPOSE = "docker compose"
BACK = "back"

@task
def restart(c):
    """
    Reiniciar el backend de la aplicación.
    """
    c.run(f"{COMPOSE} restart {BACK}", pty=True)

@task
def logs(c, f=True):
    """
    Ver los logs del backend de la aplicación.
    """
    follow = "-f" if f else ""
    c.run(f"{COMPOSE} logs {follow} {BACK}", pty=True)

@task
def sh(c):
    """
    Abrir una shell interactiva en el contenedor del backend.
    """
    c.run(f"{COMPOSE} exec {BACK} bash", pty=True)

@task
def ping(c, url="http://localhost:5000/"):
    """
    Hacer ping al backend de la aplicación para comprobar si está activo.
    """
    c.run(f"curl -I {url}", pty=True)

@task
def test(c, k=""):
    """
    Ejecutar las pruebas del backend de la aplicación.
    """
    k_option = f"-k '{k}'" if k else ""
    c.run(f"{COMPOSE} exec {BACK} pytest -q {k_option}", pty=True)

@task
def fmt(c):
    """
    Formatear el código del backend de la aplicación con ruff.
    """
    c.run(f"{COMPOSE} exec {BACK} ruff format . || true", pty=True)
    c.run(f"{COMPOSE} exec {BACK} ruff check . || true", pty=True)
