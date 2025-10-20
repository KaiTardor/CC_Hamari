from invoke import task

COMPOSE = "docker compose"
FRONT = "front"

@task
def build(c):
    """
    Construye el front con Vite dentro del contenedor.
    """
    c.run(f"{COMPOSE} exec {FRONT} npm run build", pty=True)
    
@task
def logs(c, f=True):
    """
    Ver los logs del front de la aplicación.
    """
    follow = "-f" if f else ""
    c.run(f"{COMPOSE} logs {follow} {FRONT}", pty=True)

@task
def sh(c):
    """
    Abrir una shell interactiva en el contenedor del front.
    """
    c.run(f"{COMPOSE} exec {FRONT} sh", pty=True)

@task
def restart(c):
    """
    Reiniciar el front de la aplicación.
    """
    c.run(f"{COMPOSE} restart {FRONT}", pty=True)
