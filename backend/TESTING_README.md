# Sistema de Pruebas Automatizadas - Universidad Digital

## 1. Arquitectura del sistema de pruebas

### Separación backend / frontend / e2e

- **Backend**: tests en `backend/tests/` (pytest). Incluye unit, integration y e2e a nivel de API (TestClient).
- **Frontend**: tests de componentes en `frontend/src/tests/` (Vitest); e2e en navegador en `frontend/cypress/e2e/`.
- **E2E backend**: flujos completos contra la API (login, recursos) en `backend/tests/e2e/`.
- **E2E frontend**: flujos en navegador (login, navegación, tareas) en `frontend/cypress/e2e/specs/`.

Los tests **no** van mezclados con código de producción: solo en las carpetas indicadas. No se permiten archivos de test fuera de `backend/tests/`, `frontend/src/tests/` o `frontend/cypress/` sin justificación.

### Mapa de carpetas ↔ nivel de prueba (backend)

| Carpeta              | Nivel        | Marker pytest      | Uso                          |
|----------------------|-------------|--------------------|------------------------------|
| `tests/unit/`        | Unitario    | `@pytest.mark.unit` | Lógica pura, mocks, sin BD   |
| `tests/integration/` | Integración | `@pytest.mark.integration` | BD + servicios               |
| `tests/e2e/`         | E2E API     | `@pytest.mark.e2e`  | Flujo completo vía TestClient |

### Base de datos de tests e independencia

- La base de datos de testing es **efímera**: se usa un fichero temporal en el directorio del sistema (`tempfile`), con nombre único por proceso, que se elimina al final de la sesión de tests. No hay fichero `test.db` en el repositorio ni datos persistentes entre ejecuciones.
- **Regla de oro**: ningún test puede asumir datos preexistentes en la base de datos. Todo dato necesario debe crearse en el propio test o mediante fixtures/factories explícitos.
- Cada test debe poder ejecutarse en cualquier orden. Los fixtures de datos deben ser idempotentes y no depender del orden de ejecución.
- Para paralelismo futuro (p. ej. `pytest-xdist`) se puede cambiar a una BD por worker (p. ej. `sqlite:///./test_{worker_id}.db`).

---

## Arquitectura de Pruebas (detalle)

Este proyecto implementa una **estrategia integral de testing profesional** siguiendo la pirámide de testing, diseñada para estudiantes universitarios pero con estándares empresariales.

### Pirámide de Testing

```
  E2E Tests (Flujo Completo)
     |
 Integration Tests (Componentes)
     |
   Unit Tests (Lógica Pura)
```

## Estructura del Proyecto de Pruebas

```
tests/
├── unit/              # Pruebas unitarias (lógica pura, sin BD/red)
├── integration/       # Pruebas de integración (BD + servicios)
├── e2e/               # Pruebas end-to-end (flujo completo)
├── fixtures/          # Fixtures personalizadas
├── factories/         # Factories para datos de prueba
└── data/              # Datos estáticos de prueba
```

### Propósito de cada carpeta

- **unit/**: Validan reglas de negocio, cálculos, validaciones sin dependencias externas. Usan mocks.
- **integration/**: Validan comunicación entre componentes (repositorios + BD, API + servicios).
- **e2e/**: Validan flujo completo del usuario (registro → login → matrícula).
- **fixtures/**: Fixtures reutilizables (usuario válido, curso, matrícula).
- **factories/**: Generadores de datos fake usando Factory Boy.
- **data/**: Datos estáticos en JSON para seeds reproducibles.

## Buenas Prácticas Aplicadas

### Patrón AAA (Arrange-Act-Assert)
```python
def test_example():
    # Arrange: Preparar datos y estado
    user = UserFactory()

    # Act: Ejecutar la acción
    result = service.create_user(user)

    # Assert: Verificar resultado
    assert result.email == user.email
```

### Naming Conventions
- `test_*`: Funciones de test
- `Test*`: Clases de test
- Nombres descriptivos: `test_create_user_success`, `test_create_user_invalid_email`

### Tests Deterministas
- Sin estado compartido
- Fixtures limpias por test
- No dependencias de orden de ejecución

### Scopes de Fixtures
- `function`: Por defecto, estado fresco por test
- `module`: Datos compartidos en módulo
- `session`: BD de test compartida

### Uso de Mocks
```python
mock_db = MagicMock()
mock_db.scalar.return_value = None
```

### Parametrización
```python
@pytest.mark.parametrize("input,expected", [
    ("valid", True),
    ("invalid", False),
])
def test_validation(input, expected):
    assert validate(input) == expected
```

## Fixtures Profesionales

### Usuario Válido
```python
@pytest.fixture
def valid_user(db_session):
    user = UserFactory()
    db_session.add(user)
    db_session.commit()
    return user
```

### Usuario Inválido
```python
@pytest.fixture
def invalid_user():
    return {"full_name": "", "email": "invalid"}
```

### Base de Datos Temporal (efímera, fichero en temp)
```python
# conftest.py usa un fichero en tempfile.gettempdir(), borrado al final
_test_db_path = os.path.join(tempfile.gettempdir(), f"universidad_digital_test_{os.getpid()}.db")
@pytest.fixture(scope="session")
def engine():
    test_engine = create_engine(
        f"sqlite:///{_test_db_path}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=test_engine)
    yield test_engine
    Base.metadata.drop_all(bind=test_engine)
    os.remove(_test_db_path)  # limpieza
```

### Cliente API
```python
@pytest.fixture
def client(db_session):
    from fastapi.testclient import TestClient
    app.dependency_overrides[get_db] = lambda: db_session
    return TestClient(app)
```

## Cobertura de Casos

### Casos Normales
- Funcionamiento esperado con datos válidos

### Casos Límite
- Valores cero, null, vacío, máximo permitido

### Casos Inválidos
- Tipos incorrectos, valores negativos, estados inconsistentes

### Casos de Seguridad
- Inyección SQL, accesos indebidos, manipulación de datos

## Configuración de Cobertura

### pytest.ini
```ini
[tool:pytest]
addopts =
    --cov=app
    --cov-report=term-missing
    --cov-report=html:htmlcov
    --cov-fail-under=85
```

### Meta de Cobertura: 85% (objetivo a medio plazo: 90%)
- **Cubrir**: Lógica de negocio, validaciones, edge cases
- **No cubrir**: Configuración, dependencias externas, código trivial
- El umbral actual en `pytest.ini` es 85%; subir a 90% cuando rutas y servicios restantes tengan más tests.

## Integración Continua (CI)

### Flujo de CI
1. Instalar dependencias
2. Ejecutar linting (flake8)
3. Ejecutar tests con cobertura
4. Generar reporte de cobertura
5. Fallar si cobertura < 85%

### Comando de Ejecución
```bash
cd backend
pytest
```

## Datos de Prueba

### Datos Fake con Faker
```python
email = fake.email()
name = fake.name()
```

### Factories Reproducibles
```python
class UserFactory(factory.Factory):
    email = factory.LazyAttribute(lambda _: fake.email())
    full_name = factory.LazyAttribute(lambda _: fake.name())
```

### Seeds Estáticos
- JSON con datos predefinidos para tests específicos
- Evitar hardcodeados en código

## Ejemplos de Tests

### Unit Test
```python
@pytest.mark.unit
def test_create_user_success(mocker):
    mock_db = mocker.MagicMock()
    # ... test logic
```

### Integration Test
```python
@pytest.mark.integration
def test_create_user_db(db_session):
    user = create_user(db_session, data)
    assert user.id is not None
```

### E2E Test
```python
@pytest.mark.e2e
def test_login_flow(client):
    response = client.post("/auth/login", json=data)
    assert response.status_code == 200
```

## Explicación Pedagógica

Este sistema de pruebas está diseñado para enseñar:

1. **Separación de responsabilidades**: Unit vs Integration vs E2E
2. **Testing como documentación**: Tests expresan requisitos
3. **Calidad del código**: Cobertura asegura robustez
4. **Mantenibilidad**: Fixtures y factories facilitan cambios
5. **Profesionalismo**: Estándares usados en empresas reales

### Lecciones Clave

- **Tests son código**: Deben ser mantenibles y legibles
- **Primero test, luego código**: TDD para mejor diseño
- **Cobertura no es calidad**: Tests malos con 100% no sirven
- **Integration > Unit**: Los unit tests son fáciles, pero integration valida realidad
- **E2E para confianza**: Validan que el sistema funciona end-to-end

### Mejores Prácticas Empresariales

- Tests en paralelo para velocidad
- CI/CD con gates de calidad
- Code review de tests
- Tests como especificación viva
- Métricas de calidad (cobertura, mutación, etc.)

Este framework proporciona una base sólida para que los estudiantes aprendan testing profesional aplicado a sistemas reales.