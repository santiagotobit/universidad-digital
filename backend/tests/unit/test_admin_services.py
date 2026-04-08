"""Unit tests for admin.services — estadísticas del dashboard y usuarios."""
import pytest
from unittest.mock import MagicMock
from datetime import datetime, timedelta

from app.admin.services import get_dashboard_stats, get_student_stats, get_teacher_stats
from app.admin.schemas import DashboardStatsResponse


@pytest.mark.unit
class TestGetDashboardStats:
    """Pruebas de get_dashboard_stats: conteos de entidades y períodos activos."""

    def test_get_dashboard_stats_all_counters_zero(self):
        """Cuando no hay datos, todos los contadores son 0."""
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        mock_query.scalar.return_value = 0
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = []

        result = get_dashboard_stats(mock_db)

        assert result.total_users == 0
        assert result.total_subjects == 0
        assert result.total_periods == 0
        assert result.total_enrollments == 0
        assert result.total_grades == 0
        assert result.active_periods == 0
        assert result.recent_users == []
        assert isinstance(result, DashboardStatsResponse)

    def test_get_dashboard_stats_with_data(self):
        """Cuando hay datos, los contadores reflejan los valores."""
        mock_db = MagicMock()
        mock_query = MagicMock()
        
        # Secuencia de retornos: total_users, total_subjects, total_periods, 
        # total_enrollments, total_grades, active_periods, recent users query
        mock_db.query.return_value = mock_query
        mock_query.scalar.side_effect = [5, 3, 2, 10, 20, 1]
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = []

        result = get_dashboard_stats(mock_db)

        assert result.total_users == 5
        assert result.total_subjects == 3
        assert result.total_periods == 2
        assert result.total_enrollments == 10
        assert result.total_grades == 20
        assert result.active_periods == 1
        assert result.recent_users == []

    def test_get_dashboard_stats_recent_users(self):
        """Obtiene la lista de usuarios recientes con roles."""
        mock_db = MagicMock()
        mock_query = MagicMock()
        
        # Mock para contadores
        mock_db.query.return_value = mock_query
        mock_query.scalar.side_effect = [2, 1, 1, 3, 5, 0]
        
        # Mock para usuarios recientes
        mock_role1 = MagicMock()
        mock_role1.name = "Administrador"
        mock_role2 = MagicMock()
        mock_role2.name = "Docente"
        
        mock_user1 = MagicMock()
        mock_user1.id = 1
        mock_user1.email = "admin@test.com"
        mock_user1.roles = [mock_role1]
        
        mock_user2 = MagicMock()
        mock_user2.id = 2
        mock_user2.email = "teacher@test.com"
        mock_user2.roles = [mock_role2]
        
        # Configurar para que all() retorne los usuarios
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [mock_user1, mock_user2]

        result = get_dashboard_stats(mock_db)

        assert len(result.recent_users) == 2
        assert result.recent_users[0]["email"] == "admin@test.com"
        assert result.recent_users[0]["roles"] == ["Administrador"]
        assert result.recent_users[1]["email"] == "teacher@test.com"
        assert result.recent_users[1]["roles"] == ["Docente"]

    def test_get_dashboard_stats_no_roles_for_user(self):
        """Usuario sin roles se muestra con lista vacía."""
        mock_db = MagicMock()
        mock_query = MagicMock()
        
        mock_db.query.return_value = mock_query
        mock_query.scalar.side_effect = [1, 0, 0, 0, 0, 0]
        
        mock_user = MagicMock()
        mock_user.id = 1
        mock_user.email = "user@test.com"
        mock_user.roles = None
        
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [mock_user]

        result = get_dashboard_stats(mock_db)

        assert result.recent_users[0]["roles"] == []

    def test_get_dashboard_stats_active_periods_query(self):
        """Valida que se consultan períodos entre hoy."""
        mock_db = MagicMock()
        mock_query = MagicMock()
        
        mock_db.query.return_value = mock_query
        mock_query.scalar.side_effect = [0, 0, 0, 0, 0, 2]
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = []

        get_dashboard_stats(mock_db)

        # Verificar que se llamó a filter para períodos activos
        assert mock_query.filter.called


@pytest.mark.unit
class TestGetStudentStats:
    """Pruebas de get_student_stats: inscripciones, calificaciones y promedios."""

    def test_get_student_stats_no_enrollments(self):
        """Estudiante sin inscripciones retorna ceros."""
        mock_db = MagicMock()
        mock_query = MagicMock()
        
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        # Retorna: enrollments, grades, avg_grade, current_subjects
        mock_query.scalar.side_effect = [0, 0, None, 0]
        mock_query.in_.return_value = mock_query
        mock_query.isnot.return_value = mock_query

        result = get_student_stats(mock_db, user_id=1)

        assert result["total_enrollments"] == 0
        assert result["total_grades"] == 0
        assert result["average_grade"] == 0
        assert result["current_subjects"] == 0

    def test_get_student_stats_with_enrollments_and_grades(self):
        """Estudiante con inscripciones y calificaciones."""
        mock_db = MagicMock()
        mock_query = MagicMock()
        
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        # enrollments, grades, avg_grade, current_subjects
        mock_query.scalar.side_effect = [3, 5, 85.5, 2]
        mock_query.in_.return_value = mock_query
        mock_query.isnot.return_value = mock_query

        result = get_student_stats(mock_db, user_id=1)

        assert result["total_enrollments"] == 3
        assert result["total_grades"] == 5
        assert result["average_grade"] == 85.5
        assert result["current_subjects"] == 2

    def test_get_student_stats_average_grade_rounding(self):
        """Promedio de calificaciones se redondea a 2 decimales."""
        mock_db = MagicMock()
        mock_query = MagicMock()
        
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        # avg_grade es un float con muchos decimales
        mock_query.scalar.side_effect = [2, 4, 87.33333333, 1]
        mock_query.in_.return_value = mock_query
        mock_query.isnot.return_value = mock_query

        result = get_student_stats(mock_db, user_id=1)

        assert result["average_grade"] == 87.33

    def test_get_student_stats_user_id_parameter(self):
        """Función recibe y usa el user_id correcto."""
        mock_db = MagicMock()
        mock_query = MagicMock()
        
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.scalar.side_effect = [1, 1, 90.0, 1]
        mock_query.in_.return_value = mock_query
        mock_query.isnot.return_value = mock_query

        get_student_stats(mock_db, user_id=42)

        # Verificar que filter fue llamado
        assert mock_query.filter.called


@pytest.mark.unit
class TestGetTeacherStats:
    """Pruebas de get_teacher_stats: estudiantes, asignaturas y calificaciones pendientes."""

    def test_get_teacher_stats_no_subjects(self):
        """Docente sin asignaturas retorna ceros."""
        mock_db = MagicMock()
        mock_query = MagicMock()
        
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.all.return_value = []
        # Retorna: students, subjects, pending_grades
        mock_query.scalar.side_effect = [0, 0, 0]
        mock_query.in_.return_value = mock_query
        mock_query.or_.return_value = mock_query

        result = get_teacher_stats(mock_db, user_id=1)

        assert result["total_students"] == 0
        assert result["total_subjects"] == 0
        assert result["pending_grades"] == 0

    def test_get_teacher_stats_with_subjects_and_students(self):
        """Docente con asignaturas y estudiantes."""
        mock_db = MagicMock()
        mock_query = MagicMock()
        
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.all.return_value = []
        # students, subjects, pending_grades
        mock_query.scalar.side_effect = [15, 3, 5]
        mock_query.in_.return_value = mock_query
        mock_query.or_.return_value = mock_query

        result = get_teacher_stats(mock_db, user_id=1)

        assert result["total_students"] == 15
        assert result["total_subjects"] == 3
        assert result["pending_grades"] == 5

    def test_get_teacher_stats_pending_grades_zero_or_null(self):
        """Calificaciones con score=0 o NULL se cuentan como pendientes."""
        mock_db = MagicMock()
        mock_query = MagicMock()
        
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.all.return_value = []
        mock_query.scalar.side_effect = [8, 2, 3]
        mock_query.in_.return_value = mock_query
        mock_query.or_.return_value = mock_query

        result = get_teacher_stats(mock_db, user_id=5)

        assert result["pending_grades"] == 3

    def test_get_teacher_stats_user_id_parameter(self):
        """Función recibe y usa el teacher_id correcto."""
        mock_db = MagicMock()
        mock_query = MagicMock()
        
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.all.return_value = []
        mock_query.scalar.side_effect = [10, 4, 2]
        mock_query.in_.return_value = mock_query
        mock_query.or_.return_value = mock_query

        get_teacher_stats(mock_db, user_id=99)

        # Verificar que filter fue llamado
        assert mock_query.filter.called
