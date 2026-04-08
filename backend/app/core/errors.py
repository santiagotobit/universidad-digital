from __future__ import annotations


class AppError(Exception):
    """Error base de la aplicación."""
    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class NotFoundError(AppError):
    """Recurso no encontrado."""
    pass


class ConflictError(AppError):
    """Conflicto de negocio o validación."""
    pass


class UnauthorizedError(AppError):
    """Autenticación requerida o inválida."""
    pass


class ForbiddenError(AppError):
    """Acceso denegado por permisos."""
    pass
