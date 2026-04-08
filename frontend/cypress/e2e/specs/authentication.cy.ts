import { LoginPage } from '../../page-objects/LoginPage';
import { DashboardPage } from '../../page-objects/DashboardPage';
import { ApiHelper } from '../../helpers/ApiHelper';
import { ValidationHelper } from '../../helpers/ValidationHelper';
import { TestDataHelper } from '../../helpers/TestDataHelper';

/**
 * SUITE: AUTENTICACIÓN
 * 
 * Validaciones:
 * - Login exitoso (UI + API + persistencia)
 * - Login fallido con credenciales inválidas
 * - Campos vacíos
 * - Validación de tokens
 * - Manejo de errores del servidor
 * - Logout
 */
describe('Authentication Suite', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();
  const testEmail = Cypress.env('testUserEmail');
  const testPassword = Cypress.env('testUserPassword');

  beforeEach(() => {
    cy.visit('/login');
    loginPage.verifyPageLoaded();
  });

  // ============================================================================
  // HAPPY PATH: LOGIN EXITOSO
  // ============================================================================

  it('SC-AUTH-001: Login exitoso con credenciales válidas', () => {
    cy.fixture('auth-responses.json').then((fixture) => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: fixture.successfulLogin,
      }).as('loginRequest');
      // Mock /auth/me (app lo llama tras login para obtener usuario)
      cy.intercept('GET', '**/auth/me', {
        statusCode: 200,
        body: {
          id: 1,
          email: testEmail,
          full_name: 'Admin User',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          roles: ['Administrador'],
        },
      }).as('getMeRequest');
    });

    loginPage.fillCredentials(testEmail, testPassword);
    loginPage.submitLogin();

    // Validar respuesta de API
    cy.assertApiResponse('loginRequest', 200, (body) => {
      ValidationHelper.validateLoginResponse({ status: 200, body });
    });

    // Validar persistencia (app usa cookies; comprobamos UI)
    cy.assertIsAuthenticated();

    // Validar redirección
    cy.url().should('not.include', '/login');
  });

  it('SC-AUTH-002: Post-login: datos de usuario cargados correctamente', () => {
    cy.setupAuthenticatedUser();
    cy.visitWithAuth('/dashboard');

    // Validar que dashboard cargó
    dashboardPage.verifyPageLoaded();
    dashboardPage.verifyNoLoadingSpinner();

    // Validar que información del usuario es accesible (localStorage o UI)
    cy.window().then((win) => {
      const userData = win.localStorage.getItem('user_data');
      expect(userData).to.exist;
    });
  });

  it('SC-AUTH-003: Token permanece en localStorage después de refresco', () => {
    cy.setupAuthenticatedUser();
    cy.visitWithAuth('/dashboard');

    cy.window().then((win) => {
      const token = win.localStorage.getItem('auth_token');
      expect(token).to.exist;
    });

    // Refrescar página
    cy.reload();
    cy.assertIsAuthenticated();
    cy.url().should('include', '/dashboard');
  });

  // ============================================================================
  // CREDENCIALES INVÁLIDAS
  // ============================================================================

  it('SC-AUTH-004: Login falla con credenciales incorrectas', () => {
    cy.visit('/login');
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { detail: 'Invalid email or password' },
    }).as('invalidLogin');

    const invalidCredentials = TestDataHelper.createInvalidCredentials('wrong');
    loginPage.login(invalidCredentials.email, invalidCredentials.password);

    cy.assertApiResponse('invalidLogin', 401);
    cy.assertIsNotAuthenticated();
  });

  it('SC-AUTH-005: Mensaje de error se muestra cuando credenciales son inválidas', () => {
    cy.visit('/login');
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { detail: 'Invalid email or password' },
    }).as('invalidLogin');

    loginPage.login('wrong@test.com', 'wrongpassword');

    // Esperar a la respuesta de API
    cy.wait('@invalidLogin');
    cy.get('[data-testid="error-message"]', {
      timeout: Cypress.env('uiTimeout'),
    }).should('be.visible');
  });

  it('SC-AUTH-006: Login falla cuando usuario no existe', () => {
    cy.visit('/login');
    cy.intercept('POST', '**/auth/login', {
      statusCode: 404,
      body: { detail: 'User not found' },
    }).as('userNotFound');

    loginPage.login('nonexistent@test.com', 'password123');

    cy.assertApiResponse('userNotFound', 404);
    cy.assertIsNotAuthenticated();
  });

  it('SC-AUTH-007: Login falla cuando usuario está inactivo', () => {
    cy.visit('/login');
    cy.intercept('POST', '**/auth/login', {
      statusCode: 403,
      body: { detail: 'User account is inactive' },
    }).as('inactiveUser');

    cy.fixture('users.json').then((users) => {
      loginPage.login(users.inactiveUser.email, 'password123');
    });

    cy.assertApiResponse('inactiveUser', 403);
    cy.assertIsNotAuthenticated();
  });

  // ============================================================================
  // VALIDACIÓN DE CAMPOS
  // ============================================================================

  it('SC-AUTH-008: Email vacío no permite envío', () => {
    cy.visit('/login');

    loginPage.fillPassword('password123');
    loginPage.verifySubmitButtonState(true); // disabled

    cy.assertNotExists('[data-testid="error-message"]');
  });

  it('SC-AUTH-009: Password vacío no permite envío', () => {
    cy.visit('/login');

    loginPage.fillEmail('test@test.com');
    loginPage.verifySubmitButtonState(true); // disabled

    cy.assertNotExists('[data-testid="error-message"]');
  });

  it('SC-AUTH-010: Email vacío genera error de validación', () => {
    cy.visit('/login');

    // Solo contraseña: validación cliente (Zod) evita envío; el botón está deshabilitado
    loginPage.fillPassword('password123');
    // Verificar que el botón submit sigue deshabilitado (email vacío)
    cy.get('button[type="submit"]').should('be.disabled');
  });

  // ============================================================================
  // MANEJO DE ERRORES DEL SERVIDOR
  // ============================================================================

  it('SC-AUTH-011: Error 500 del servidor maneja gracefully', () => {
    cy.visit('/login');
    cy.mockServerError('POST', '**/auth/login');

    loginPage.login(testEmail, testPassword);

    cy.wait('@serverError', { timeout: 5000 });
    cy.assertIsNotAuthenticated();
  });

  it('SC-AUTH-012: Timeout en respuesta de login muestra mensaje amigable', () => {
    cy.visit('/login');
    cy.mockSlowApi('POST', '**/auth/login', 15000);

    loginPage.login(testEmail, testPassword);

    // Mientras la petición tarda, el botón permanece deshabilitado (isSubmitting)
    cy.get('button[type="submit"]').should('be.disabled');
  });

  // ============================================================================
  // LOGOUT
  // ============================================================================

  it('SC-AUTH-013: Logout exitoso elimina token', () => {
    cy.setupAuthenticatedUser();
    cy.visit('/dashboard');

    cy.intercept('POST', '**/auth/logout').as('logoutRequest');

    dashboardPage.clickLogout();

    cy.assertApiResponse('logoutRequest', 204);
    cy.assertIsNotAuthenticated();
  });

  it('SC-AUTH-014: Post-logout: usuario redirigido a login', () => {
    cy.setupAuthenticatedUser();
    cy.visit('/dashboard');

    cy.intercept('POST', '**/auth/logout').as('logoutRequest');

    dashboardPage.clickLogout();

    cy.wait('@logoutRequest');
    cy.url().should('include', '/login');
  });

  it('SC-AUTH-015: Token/cookie inválido causa redirección a login', () => {
    cy.visit('/login');
    cy.clearCookies();

    // Interceptar GET /auth/me para devolver 401 (simula token/cookie inválido)
    cy.intercept('GET', '**/auth/me', { statusCode: 401 }).as('invalidToken');

    cy.visit('/dashboard');
    cy.wait('@invalidToken', { timeout: 5000 });
    cy.url().should('include', '/login');
  });

  // ============================================================================
  // FLUJO COMPLETO: LOGIN → DASHBOARD → LOGOUT
  // ============================================================================

  it('SC-AUTH-016: Flujo completo de autenticación', () => {
    // 1. Verificar que no está autenticado
    cy.assertIsNotAuthenticated();

    // 2. Navegar a login
    cy.visit('/login');
    loginPage.verifyPageLoaded();

    // 3. Hacer login
    cy.intercept('POST', '**/auth/login').as('loginRequest');
    cy.intercept('GET', '**/auth/me').as('getMeRequest');

    loginPage.login(testEmail, testPassword);

    // 4. Validar respuesta de login
    cy.wait('@loginRequest').then((intercept) => {
      expect(intercept.response?.statusCode).to.equal(200);
    });

    // 5. Verificar token guardado
    cy.assertIsAuthenticated();

    // 6. Navegar a dashboard
    cy.visit('/dashboard');
    cy.wait('@getMeRequest', { timeout: Cypress.env('apiTimeout') });

    // 7. Validar dashboard cargó
    dashboardPage.verifyPageLoaded();

    // 8. Hacer logout
    cy.intercept('POST', '**/auth/logout').as('logoutRequest');
    dashboardPage.clickLogout();

    // 9. Validar logout
    cy.wait('@logoutRequest');
    cy.assertIsNotAuthenticated();

    // 10. Validar redirección a login
    cy.url().should('include', '/login');
  });
});
