# Guía de Ejecución de Testing

Esta guía describe cómo ejecutar las pruebas para el backend, frontend y testing integrado (E2E) del proyecto Universidad Digital.

## Prerrequisitos

- **Backend**: Python 3.8+, PostgreSQL corriendo, dependencias instaladas (`pip install -r requirements.txt`)
- **Frontend**: Node.js 18+, dependencias instaladas (`npm install`)
- **Base de datos**: PostgreSQL con la base de datos "universidad" creada y configurada

## 1. Testing del Backend

El backend utiliza **pytest** para pruebas unitarias e integración.

### Configuración
- Archivo de configuración: `backend/pytest.ini`
- Cobertura: `pytest-cov`
- Tests ubicados en: `backend/tests/`

### Ejecutar pruebas del backend

#### Todas las pruebas
```bash
cd backend
python run_tests.py
```

#### Pruebas específicas
```bash
# Pruebas unitarias
python -m pytest tests/unit/ -v

# Pruebas de integración
python -m pytest tests/integration/ -v

# Prueba específica
python -m pytest tests/unit/test_admin_services.py -v
```

#### Con cobertura
```bash
python -m pytest --cov=app --cov-report=html
# Ver reporte en htmlcov/index.html
```

python run_tests.py             #Ejecutar todos
python run_tests.py --unit       # Solo unitarios
python run_tests.py --coverage   # Con reporte

### Verificar estado
- Las pruebas deben pasar sin errores
- Cobertura mínima recomendada: 80%
- Revisar reportes de cobertura en `htmlcov/`

## 2. Testing del Frontend

El frontend utiliza **Vitest** para pruebas unitarias y **Cypress** para pruebas E2E.

### Configuración
- Vitest: `frontend/vitest.config.ts`
- Cypress: `frontend/cypress.config.ts`
- Tests ubicados en: `frontend/src/tests/` y `frontend/cypress/`

### Ejecutar pruebas del frontend

#### Pruebas unitarias con Vitest
```bash
cd frontend
npm run test
# o
npm run test:ui  # Con interfaz gráfica
```

#### Pruebas E2E con Cypress
```bash
cd frontend
npm run e2e:open  # Modo interactivo
# o
npm run e2e:chrome
npm run e2e  # Modo headless
```

#### Ejecutar pruebas específicas
```bash
# Vitest: archivo específico
npm run test src/components/Button.test.tsx

# Cypress: suite específica
npx cypress run --spec "cypress/e2e/auth.cy.ts" --config-file cypress.config.cjs
```

### Verificar estado
- Vitest: Todas las pruebas pasan
- Cypress: Tests E2E pasan en diferentes navegadores
- Revisar reportes de cobertura en `frontend/coverage/`

## 3. Testing Integrado (Frontend + Backend)

Para testing integrado, utilizamos Cypress para pruebas E2E que interactúan con el backend real.

### Prerrequisitos
- Backend corriendo en `http://localhost:8000` (usar `localhost`, no `127.0.0.1`, para cookies)
- Frontend corriendo en `http://localhost:3000`
- Base de datos con usuarios de prueba

**Usuarios requeridos** (usar `credentials.txt` o `create_test_users.py`):
- Admin: `admin@ud.edu` / `AdminPass1234` (o `admin@test.com` / `password123` tras `python create_test_users.py`)
- Docente: `docente@ud.edu` / `DocentePass1234`
- Estudiante: `estudiante@ud.edu` / `EstudiantePass1234`

Para crear usuarios de `create_test_users.py`: `cd backend && python create_test_users.py`

### Configuración
- Cypress: `frontend/cypress.config.cjs`
- Variables: `frontend/.env.cypress` (VITE_API_BASE_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD)

### Ejecutar testing integrado

#### Iniciar servicios
```bash
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --reload                                  #  --host localhost --port 8000 --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

#### Ejecutar pruebas E2E
```bash
cd frontend
npm run e2e
```

#### Pruebas específicas
```bash
# Autenticación
npx cypress run --spec "cypress/e2e/auth.cy.ts" --config-file cypress.config.cjs

# Dashboard de estudiante
npx cypress run --spec "cypress/e2e/student-dashboard.cy.ts" --config-file cypress.config.cjs

# Todas las pruebas E2E
npx cypress run --spec "cypress/e2e/**/*.cy.ts" --config-file cypress.config.cjs
```

### Verificar estado
- Backend responde correctamente a las peticiones del frontend
- Frontend maneja estados de autenticación y navegación
- Base de datos mantiene consistencia durante las pruebas
- No hay errores en la consola del navegador

## Flujo Completo de Testing

### Desarrollo diario
1. Ejecutar pruebas unitarias del backend: `cd backend && python run_tests.py`
2. Ejecutar pruebas unitarias del frontend: `cd frontend && npm run test`
3. Si hay cambios en integración, ejecutar pruebas E2E: `cd frontend && npm run e2e`

### Antes de commit/merge
1. Todas las pruebas unitarias pasan
2. Cobertura de código >= 80%
3. Pruebas E2E pasan en al menos Chrome
4. No hay errores de linting: `cd frontend && npm run lint`

### CI/CD Pipeline
- Backend: pytest con cobertura
- Frontend: Vitest + Cypress
- Integrado: Cypress contra staging environment

## Troubleshooting

### Backend
- Error de conexión a DB: Verificar PostgreSQL corriendo y credenciales
- Tests lentos: Usar `--tb=short` para output reducido
- Cobertura baja: Revisar archivos no testeados

### Frontend
- Tests no pasan: Verificar dependencias instaladas
- Cypress falla: Verificar puertos libres y servicios corriendo
- Vitest error: Limpiar cache con `npm run test -- --clearCache`

### Integrado
- Timeout en Cypress: Aumentar timeout en config
- Estado inconsistente: Resetear DB entre tests
- CORS errors: Verificar configuración de backend

## Reportes y Métricas

- **Cobertura Backend**: `htmlcov/index.html`
- **Cobertura Frontend**: `frontend/coverage/lcov-report/index.html`
- **Resultados Cypress**: `frontend/cypress/videos/` y `screenshots/`

## Mejores Prácticas

- Escribir tests antes del código (TDD)
- Mantener tests independientes
- Usar fixtures para datos de prueba
- Ejecutar tests en paralelo cuando sea posible
- Revisar cobertura regularmente