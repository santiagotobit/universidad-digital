from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError
from app.roles.models import Role
from app.roles.schemas import RoleCreate, RoleUpdate


def create_role(db: Session, data: RoleCreate) -> Role:
    """Crea un rol."""
    if db.scalar(select(Role).where(Role.name == data.name)):
        raise ConflictError("El nombre del rol ya existe.")
    role = Role(name=data.name, description=data.description)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


def list_roles(db: Session) -> list[Role]:
    """Lista roles."""
    return list(db.scalars(select(Role).order_by(Role.id)).all())


def get_role(db: Session, role_id: int) -> Role:
    """Obtiene un rol por ID."""
    role = db.get(Role, role_id)
    if not role:
        raise NotFoundError("Rol no encontrado.")
    return role


def update_role(db: Session, role_id: int, data: RoleUpdate) -> Role:
    """Actualiza un rol."""
    role = get_role(db, role_id)
    if data.name is not None and data.name != role.name:
        if db.scalar(select(Role).where(Role.name == data.name)):
            raise ConflictError("El nombre del rol ya existe.")
        role.name = data.name
    if data.description is not None:
        role.description = data.description
    db.commit()
    db.refresh(role)
    return role


def delete_role(db: Session, role_id: int) -> None:
    """Elimina un rol."""
    role = get_role(db, role_id)
    db.delete(role)
    db.commit()


def ensure_default_roles(db: Session) -> None:
    """Crea roles base si no existen."""
    defaults = ["Administrador", "Docente", "Estudiante"]
    existing = {role.name for role in db.scalars(select(Role)).all()}
    for name in defaults:
        if name not in existing:
            db.add(Role(name=name, description=f"Rol {name.lower()}"))
    db.commit()
