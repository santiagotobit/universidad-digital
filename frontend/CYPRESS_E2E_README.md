# Cypress E2E Testing Suite - Universidad Digital

Suite profesional de pruebas end-to-end para la aplicación Universidad Digital. Validación completa de flujos: autenticación, navegación, creación de tareas, persistencia y manejo de errores.

---

## 📋 Tabla de Contenidos

1. [Instalación](#instalación)
2. [Configuración](#configuración)
3. [Ejecución](#ejecución)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Escritura de Tests](#escritura-de-tests)
6. [Comandos Personalizados](#comandos-personalizados)
7. [Page Objects](#page-objects)
8. [Helpers](#helpers)
9. [Mejores Prácticas](#mejores-prácticas)
10. [CI/CD](#cicd)

---

## 🔧 Instalación

### Requisitos previos

- Node.js >= 18.x
- npm >= 9.x
- Backend ejecutándose en `http://localhost:8000`
- Frontend ejecutándose en `http://localhost:5173`

### Pasos

```bash
# Ir al directorio del frontend
cd frontend

# Instalar dependencias (incluye Cypress)
npm install

# Descargar Cypress Browser
npx cypress install
```

---

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env.cypress` en la raíz del frontend:

```env
VITE_API_BASE_URL=http://localhost:8000
CYPRESS_BASE_URL=http://localhost:5173
TEST_USER_EMAIL=admin@test.com
TEST_USER_PASSWORD=password123
NODE_ENV=test
```

### Archivo de Configuración

`cypress.config.ts` contiene:
- Base URL configurable
- Timeouts (API, UI)
- Directorios de fixtures, screenshots, videos
- Configuración de retries
- Variables de entorno

---

## 🚀 Ejecución

### Modo Interactivo (Cypress UI)

```bash
npm run e2e:open
```

Abre el navegador con Cypress Test Runner. Permite:
- Ejecutar tests individuales
- Ver ejecución en tiempo real
- Inspeccionar elementos
- Debug visual

### Modo Headless (CLI)

```bash
# Ejecutar todos los tests
npm run e2e

# Ejecutar tests headless
npm run e2e:headless

# Executar en Chrome
npm run e2e:chrome

# Ejecutar en Firefox
npm run e2e:firefox

# Ejecutar archivo específico
npx cypress run --spec "cypress/e2e/specs/authentication.cy.ts"

# Ejecutar suite específica
npx cypress run --spec "**/authentication.cy.ts"
```

### En Desarrollo (Watch Mode)

```bash
npm run e2e:open
# Seleccionar un test y dejar en ejecución continua
```

---

## 📁 Estructura del Proyecto

```
cypress/
├── support/
│   ├── e2e.ts                 # Hooks globales (beforeEach, afterEach)
│   ├── commands.ts            # Comandos personalizados
│   └── component.ts           # Para component testing (opcional)
├── fixtures/
│   ├── users.json            # Datos de usuarios de prueba
│   ├── auth-responses.json    # Respuestas de autenticación
│   └── tasks.json            # Datos de tareas
├── page-objects/
│   ├── BasePage.ts           # Clase base para todas las POs
│   ├── LoginPage.ts          # Selectores y acciones de login
│   ├── DashboardPage.ts      # Selectores y acciones de dashboard
│   └── TaskCreationPage.ts   # Selectores y acciones de creación
├── helpers/
│   ├── ApiHelper.ts          # Métodos para interactuar con API
│   ├── ValidationHelper.ts   # Validaciones de respuestas
│   ├── TestDataHelper.ts     # Generador de datos de prueba
│   └── UiHelper.ts           # Utilidades de UI
├── e2e/
│   └── specs/
│       ├── authentication.cy.ts    # Tests de autenticación
│       ├── navigation.cy.ts        # Tests de navegación
│       ├── task-creation.cy.ts     # Tests de creación
│       ├── task-display.cy.ts      # Tests de visualización
│       └── error-handling.cy.ts    # Tests de errores
└── cypress.config.ts         # Configuración principal
```

---

## ✍️ Escritura de Tests

### Estructura Básica

```typescript
import { LoginPage } from '../../page-objects/LoginPage';
import { TestDataHelper } from '../../helpers/TestDataHelper';

describe('Feature Suite', () => {
  const loginPage = new LoginPage();

  beforeEach(() => {
    cy.visit('/login');
    loginPage.verifyPageLoaded();
  });

  it('SC-001: Descripción del test', () => {
    // Setup
    const testData = TestDataHelper.createValidUser();

    // Action
    loginPage.login(testData.email, testData.password);

    // Assertion
    cy.assertIsAuthenticated();
  });
});
```

### Patrón AAA (Arrange-Act-Assert)

```typescript
it('Should create task successfully', () => {
  // ✓ ARRANGE: Setup datos y mocks
  const taskData = TestDataHelper.createValidTask();
  cy.intercept('POST', '**/tasks', { statusCode: 201 }).as('createTask');

  // ✓ ACT: Ejecutar acción
  dashboardPage.clickCreateButton();
  taskCreationPage.fillTaskForm(taskData);
  taskCreationPage.submitTask();

  // ✓ ASSERT: Validar resultado
  cy.assertApiResponse('createTask', 201);
  dashboardPage.verifyTaskExists(taskData.title);
});
```

---

## 🔧 Comandos Personalizados

Definidos en `cypress/support/commands.ts`:

### Autenticación

```typescript
// Login via API
cy.apiLogin('email@test.com', 'password123');

// Login via UI
cy.uiLogin('email@test.com', 'password123');

// Logout
cy.apiLogout();

// Setup usuario autenticado
cy.setupAuthenticatedUser();
```

### Validación

```typescript
// Verificar autenticación
cy.assertIsAuthenticated();
cy.assertIsNotAuthenticated();

// Esperar API con validación
cy.waitForApi('POST', '**/tasks');
cy.waitForApiWithValidation('@loginRequest', 200);

// Validar elemento visible
cy.assertVisible('[data-testid="dashboard"]');
cy.assertNotExists('[data-testid="error"]');
cy.assertTextContent('[data-testid="title"]', 'Expected Text');
```

### Interacción Segura

```typescript
// Click con validaciones previas
cy.safeClick('[data-testid="submit-button"]');

// Type con limpieza automática
cy.safeType('input[type="email"]', 'test@test.com');

// Seleccionar opción
cy.selectOption('select[name="priority"]', 'high');
```

### Manejo de Errores

```typescript
// Mock de errores
cy.mockServerError('POST', '**/tasks');      // Error 500
cy.mockSlowApi('GET', '**/tasks', 15000);   // Delay 15s
cy.mockValidationError('POST', '**/tasks', fieldErrors);
```

---

## 📄 Page Objects

Encapsulan selectores y acciones de una página:

### Ejemplo: LoginPage

```typescript
const loginPage = new LoginPage();

loginPage.verifyPageLoaded();          // Verificar que página cargó
loginPage.fillEmail('test@test.com');
loginPage.fillPassword('password123');
loginPage.login('test@test.com', 'password123');
loginPage.verifyErrorMessage('Invalid credentials');
loginPage.verifySubmitButtonState(false); // Disabled
```

### Crear Nueva Page Object

```typescript
export class NewPage {
  readonly selector1 = '[data-testid="element"]';
  readonly selector2 = '[data-testid="button"]';

  fillField(value: string) {
    cy.safeType(this.selector1, value);
  }

  verifyMessage(text: string) {
    cy.assertTextContent(this.selector2, text);
  }
}
```

---

## 🛠️ Helpers

### ApiHelper - Llamadas a API

```typescript
ApiHelper.login(email, password);
ApiHelper.getMe();
ApiHelper.logout();
ApiHelper.createTask(taskData);
ApiHelper.getTasks();
ApiHelper.updateTask(taskId, taskData);
ApiHelper.deleteTask(taskId);
```

### ValidationHelper - Validaciones

```typescript
ValidationHelper.validateLoginResponse(response);
ValidationHelper.validateUserResponse(response);
ValidationHelper.validateTaskResponse(response);
ValidationHelper.validateErrorResponse(response, 401);
ValidationHelper.validateStatusCode(response, 200);
ValidationHelper.validateResponseTime(response, 5000);
```

### TestDataHelper - Datos de Prueba

```typescript
TestDataHelper.generateRandomEmail();
TestDataHelper.generateRandomTaskTitle();
TestDataHelper.createValidUser();
TestDataHelper.createValidTask();
TestDataHelper.createInvalidTask('long');
TestDataHelper.createInvalidCredentials('wrong');
TestDataHelper.generateMultipleTasks(5);
```

### UiHelper - Interacciones UI

```typescript
UiHelper.waitForElement('[data-testid="modal"]');
UiHelper.getInputValue('input[type="email"]');
UiHelper.getElementText('[data-testid="title"]');
UiHelper.countElements('[data-testid="item"]');
UiHelper.verifyAttribute('[button]', 'disabled', 'disabled');
UiHelper.verifyClass('[element]', 'active');
UiHelper.scrollToElement('[data-testid="field"]');
```

---

## 📋 Suite de Pruebas Incluida

### 1. **authentication.cy.ts** - Autenticación (16 tests)
- Login exitoso
- Credenciales inválidas
- Campos vacíos
- Token expirado
- Error 500
- Timeout
- Logout
- Flujo completo

### 2. **navigation.cy.ts** - Navegación (18 tests)
- Acceso sin autenticación
- Redirección a login
- Navegación entre secciones
- Control de acceso por rol
- Historial de navegación
- Estructura de página

### 3. **task-creation.cy.ts** - Creación de Tareas (17 tests)
- Crear tarea válida
- Tarea aparece en lista
- Persistencia en BD
- Indicadores de carga
- Validación frontend/backend
- Error 500
- Cancelación de modal
- Múltiples tareas

### 4. **task-display.cy.ts** - Visualización (17 tests)
- Listar tareas
- Ver detalles
- Estados de tareas
- Refresco de datos
- Búsqueda y filtrado
- Sincronización

### 5. **error-handling.cy.ts** - Manejo de Errores (17 tests)
- Pérdida de conexión
- Respuestas corruptas
- Timeouts
- Condiciones de carrera
- Token expirado
- Recuperación de errores

**Total: 85 tests E2E profesionales**

---

## ✅ Mejores Prácticas

### 1. Siempre Usar Comandos Personalizados

❌ **NO:**
```typescript
cy.get('input[type="email"]').type(email);
```

✅ **SÍ:**
```typescript
cy.safeType('input[type="email"]', email);
```

### 2. No Usar wait() Fijo

❌ **NO:**
```typescript
cy.wait(5000);
```

✅ **SÍ:**
```typescript
cy.intercept('GET', '**/tasks').as('getTasks');
cy.wait('@getTasks', { timeout: 10000 });
```

### 3. Usar Aliases y Validación

❌ **NO:**
```typescript
cy.get('[data-testid="error"]');
```

✅ **SÍ:**
```typescript
cy.intercept('POST', '**/tasks', { statusCode: 500 }).as('error');
cy.wait('@error').then((intercept) => {
  expect(intercept.response?.statusCode).to.equal(500);
});
```

### 4. Fixtures para Datos Estáticos

```typescript
cy.fixture('users.json').then((users) => {
  cy.apiLogin(users.validUser.email, users.validUser.password);
});
```

### 5. Page Objects para Selectores

No repetir selectores en pruebas:

```typescript
const loginPage = new LoginPage();
loginPage.login(email, password); // Encapsula todos los selectores
```

### 6. beforeEach/afterEach para Setup/Teardown

```typescript
beforeEach(() => {
  cy.setupAuthenticatedUser();
  cy.visit('/dashboard');
  dashboardPage.verifyPageLoaded();
});
```

---

## 🔄 CI/CD

### GitHub Actions (Ejemplo)

```yaml
name: Cypress E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Run E2E tests
        run: npm run e2e:ci
      
      - name: Upload videos
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-videos
          path: cypress/videos
```

### Scripts CLI Personalizados

```bash
# Ejecutar en paralelo (4 workers)
npx cypress run --parallel --record

# Ejecutar con configuración específica
npx cypress run --config baseUrl=http://staging.com

# Ejecutar con spec filter
npx cypress run --spec "**/*authentication*"

# Ejecutar con env vars
npx cypress run --env testUserEmail=user@test.com
```

---

## 🐛 Debugging

### Modo Debug Interactivo

```bash
npm run e2e:open
# Ver ejecución en tiempo real
# Pausar con cy.pause()
# Inspeccionar elementos
```

### Logs Detallados

```typescript
cy.log('Custom message');
cy.debugState(); // Helper personalizado
```

### Screenshots Automáticos

```typescript
cy.screenshot('login-form'); // Toma screenshot automáticamente
```

---

## 📊 Reportes

### Console Output

```bash
npm run e2e  # Muestra resumen en consola
```

### Video de Ejecución

Videos guardados en `cypress/videos/` por cada test

### Screenshots

Screenshots en `cypress/screenshots/` cuando hay fallos

---

## 🔗 Referencias

- [Documentación Cypress](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Page Object Pattern](https://www.cypress.io/blog/2019/12/02/cy-get-vs-cy-contains-when-to-use-them/)
- [Testing Best Practices](https://docs.cypress.io/guides/core-concepts/best-practices)

---

## 💡 Solución de Problemas

### "Unable to connect to localhost:8000"

```bash
# Asegurarse que backend está running
cd backend
python -m uvicorn app.main:app --reload
```

### "Test timeout after 10000ms"

Aumentar timeout en cypress.config.ts:
```typescript
defaultCommandTimeout: 15000,
requestTimeout: 15000,
```

### "Element not found"

Usar `cy.get(..., { timeout: 10000 })` para aumentar timeout

### Limpiar estado entre tests

Ya incluido en `cypress/support/e2e.ts`:
```typescript
beforeEach(() => {
  cy.clearCookies();
  cy.window().then(win => win.localStorage.clear());
});
```

---

## 📝 Notas Finales

Este suite está diseñado para ser:
- ✅ **Escalable**: Agregar nuevos tests es sencillo
- ✅ **Mantenible**: Page Objects y Helpers reutilizables
- ✅ **Profesional**: Sigue estándares de la industria
- ✅ **Completo**: Cubre autenticación, navegación, datos y errores
- ✅ **Robusto**: Manejo de condiciones edge y errores

¡Happy testing! 🚀
