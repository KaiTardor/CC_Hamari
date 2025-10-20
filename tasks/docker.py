from invoke import task

COMPOSE = "docker compose" 

@task
def build(c):
    """
    Construir las imágenes de Docker.
    """
    c.run(f"{COMPOSE} build", pty=True)

@task
def up(c, d=True):
    """
    Levantar los contenedores de Docker.
    """
    detach_flag = "-d" if d else ""
    c.run(f"{COMPOSE} up {detach_flag}", pty=True)

@task
def down(c):
    """
    Detener y eliminar los contenedores de Docker.
    """
    c.run(f"{COMPOSE} down", pty=True)

@task
def ps(c):
    """
    Listar los contenedores de Docker en ejecución.
    """
    c.run(f"{COMPOSE} ps", pty=True)

@task
def logs(c, svc="", f=True):
    """
    Ver los logs de todos o de un servicio concreto (svc).
    """
    follow = "-f" if f else ""
    c.run(f"{COMPOSE} logs {follow} {svc}", pty=True)

@task
def restart(c, svc=""):
    """
    Reiniciar todos los contenedores o un servicio concreto (svc).
    """
    c.run(f"{COMPOSE} restart {svc}", pty=True)

@task
def shell(c, svc, shell="bash"):
    """
    Abrir una shell interactiva en un contenedor de servicio (svc).
    """
    c.run(f"{COMPOSE} exec {svc} {shell}", pty=True)