"""Unit tests for periods.services — valores límite, inválidos y excepciones."""
from datetime import date

import pytest
from unittest.mock import MagicMock

from app.periods.services import create_period, get_period
from app.periods.schemas import AcademicPeriodCreate
from app.core.errors import ConflictError, NotFoundError


@pytest.mark.unit
class TestCreatePeriod:
    """Pruebas de create_period: éxito, código duplicado, fechas inválidas."""

    def test_create_period_success(self):
        """Crear periodo con fechas válidas."""
        mock_db = MagicMock()
        mock_db.scalar.return_value = None
        mock_db.add.return_value = None
        mock_db.commit.return_value = None
        mock_db.refresh.return_value = None
        data = AcademicPeriodCreate(
            code="2024-1",
            name="Primer semestre 2024",
            start_date=date(2024, 1, 15),
            end_date=date(2024, 6, 30),
        )

        result = create_period(mock_db, data)

        assert result.code == "2024-1"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_create_period_duplicate_code_raises_conflict(self):
        """Código de periodo ya existe → ConflictError."""
        mock_db = MagicMock()
        mock_db.scalar.return_value = MagicMock()
        data = AcademicPeriodCreate(
            code="2024-1",
            name="Periodo",
            start_date=date(2024, 1, 1),
            end_date=date(2024, 6, 30),
        )
        with pytest.raises(ConflictError, match="El código de periodo ya existe"):
            create_period(mock_db, data)

    def test_create_period_end_before_start_raises_conflict(self):
        """Fecha fin anterior a fecha inicio → ConflictError (lógica del servicio)."""
        mock_db = MagicMock()
        mock_db.scalar.return_value = None
        data = type("Data", (), {"code": "2024-1", "name": "P", "start_date": date(2024, 6, 1), "end_date": date(2024, 1, 1)})()
        with pytest.raises(ConflictError, match="La fecha de fin no puede ser anterior"):
            create_period(mock_db, data)


@pytest.mark.unit
class TestGetPeriod:
    """Pruebas de get_period: encontrado y no encontrado."""

    def test_get_period_success(self):
        """Periodo existe."""
        mock_db = MagicMock()
        mock_period = MagicMock()
        mock_period.id = 1
        mock_period.code = "2024-1"
        mock_db.get.return_value = mock_period

        result = get_period(mock_db, 1)
        assert result is mock_period
        assert mock_db.get.call_count == 1

    def test_get_period_not_found_raises_not_found(self):
        """Periodo no existe → NotFoundError."""
        mock_db = MagicMock()
        mock_db.get.return_value = None
        with pytest.raises(NotFoundError, match="Periodo académico no encontrado"):
            get_period(mock_db, 999)
