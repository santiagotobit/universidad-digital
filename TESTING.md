# Arquitectura de testing — Universidad Digital

Resumen de la arquitectura de pruebas del proyecto (checklist sección 1).

## 1. Separación backend / frontend / e2e

| Capa        | Ubicación                    | Herramienta | Descripción                                      |
|------------|------------------------------|-------------|--------------------------------------------------|
| Backend    | `backend/tests/`             | pytest      | Unit, integration y e2e a nivel API (TestClient) |
| Frontend   | `frontend/src/tests/`        | Vitest      | Tests de componentes (unit, interaction, functional) |
| E2E frontend | `frontend/cypress/e2e/`    | Cypress     | Flujos completos en navegador                    |

- **E2E backend**: flujos contra la API (login, recursos) en `backend/tests/e2e/`.
- **E2E frontend**: login, navegación, tareas, permisos en `frontend/cypress/e2e/specs/`.

**Regla**: Los tests solo viven en esas carpetas. No hay tests mezclados con código de producción en `backend/app/` ni en `frontend/src/components/`.

## 2. Estructura y niveles de prueba

### Backend (`backend/tests/`)

| Carpeta           | Nivel        | Marker              |
|-------------------|-------------|---------------------|
| `unit/`          | Unitario    | `@pytest.mark.unit`  |
| `integration/`   | Integración | `@pytest.mark.integration` |
| `e2e/`           | E2E API     | `@pytest.mark.e2e`  |

Detalle y convenciones: ver **`backend/TESTING_README.md`**.

### Frontend

- **Componentes**: `frontend/src/tests/unit/`, `interaction/`, `functional/` (Vitest).
- **E2E**: `frontend/cypress/e2e/specs/` (Cypress).

## 3. Independencia y datos

- **Base de datos de tests (backend)**: efímera; se usa un fichero temporal en el directorio del sistema (por proceso), eliminado al final de la run. No se usa `test.db` en el repositorio.
- **Regla de oro**: ningún test puede asumir datos preexistentes. Todo dato necesario se crea en el test o mediante fixtures/factories.
- Los tests deben poder ejecutarse en cualquier orden. Los fixtures deben ser idempotentes.

## 4. Cómo ejecutar

- **Backend**: `cd backend && pytest` (o `python run_tests.py`). Filtros: `-m unit`, `-m integration`, `-m e2e`.
- **Frontend (componentes)**: `cd frontend && npm test` (o `npm run test:run`).
- **Frontend (e2e)**: `cd frontend && npm run e2e` (o `e2e:open` / `e2e:ci`).

## 5. Cobertura

- **Backend**: `pytest` ya incluye cobertura (umbral 85%; ver `backend/pytest.ini` y `backend/TESTING_README.md`). Reporte HTML en `backend/htmlcov/`.
- **Frontend**: `cd frontend && npm run test:coverage`. Umbrales y opciones en `frontend/vite.config.ts` (provider v8); reporte en `frontend/coverage/`.
