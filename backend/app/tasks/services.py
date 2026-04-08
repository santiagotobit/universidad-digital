from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.tasks.models import Task
from app.users.models import User
from app.tasks.schemas import TaskCreate, TaskUpdate


def list_tasks(db: Session, user: User, search: str | None = None, status: str | None = None) -> list[Task]:
    """Lista tareas del usuario autenticado, opcionalmente filtradas."""
    q = select(Task).where(Task.created_by_id == user.id)
    if search:
        q = q.where(Task.title.ilike(f"%{search}%"))
    if status:
        q = q.where(Task.status == status)
    q = q.order_by(Task.created_at.desc())
    return list(db.scalars(q).all())


def get_task(db: Session, task_id: int, user: User) -> Task:
    """Obtiene una tarea por ID (solo del usuario)."""
    task = db.scalar(
        select(Task).where(Task.id == task_id, Task.created_by_id == user.id)
    )
    if not task:
        raise NotFoundError("Tarea no encontrada.")
    return task


def create_task(db: Session, data: TaskCreate, user: User) -> Task:
    """Crea una tarea."""
    task = Task(
        title=data.title,
        description=data.description,
        priority=data.priority,
        status="pending",
        created_by_id=user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task_id: int, data: TaskUpdate, user: User) -> Task:
    """Actualiza una tarea."""
    task = get_task(db, task_id, user)
    if data.title is not None:
        task.title = data.title
    if data.description is not None:
        task.description = data.description
    if data.status is not None:
        task.status = data.status
    if data.priority is not None:
        task.priority = data.priority
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int, user: User) -> None:
    """Elimina una tarea."""
    task = get_task(db, task_id, user)
    db.delete(task)
    db.commit()
