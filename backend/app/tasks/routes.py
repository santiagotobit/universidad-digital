from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user_dep, get_db
from app.tasks.schemas import TaskCreate, TaskResponse, TaskUpdate
from app.tasks.services import create_task, get_task, list_tasks, update_task
from app.users.models import User


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=list[TaskResponse])
def list_tasks_endpoint(
    search: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_dep),
) -> list[TaskResponse]:
    """Lista tareas del usuario autenticado."""
    tasks = list_tasks(db, user, search=search, status=status)
    return [
        TaskResponse(
            id=t.id,
            title=t.title,
            description=t.description,
            status=t.status,
            priority=t.priority,
            created_at=t.created_at,
            created_by=t.created_by_id,
        )
        for t in tasks
    ]


@router.get("/{task_id}", response_model=TaskResponse)
def get_task_endpoint(
    task_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_dep),
) -> TaskResponse:
    """Obtiene una tarea por ID."""
    task = get_task(db, task_id, user)
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        created_at=task.created_at,
        created_by=task.created_by_id,
    )


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task_endpoint(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_dep),
) -> TaskResponse:
    """Crea una nueva tarea."""
    task = create_task(db, payload, user)
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        created_at=task.created_at,
        created_by=task.created_by_id,
    )


@router.put("/{task_id}", response_model=TaskResponse)
def update_task_endpoint(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_dep),
) -> TaskResponse:
    """Actualiza una tarea."""
    task = update_task(db, task_id, payload, user)
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        created_at=task.created_at,
        created_by=task.created_by_id,
    )
