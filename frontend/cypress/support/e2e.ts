// ============================================================================
// CYPRESS E2E CONFIGURATION AND HOOKS
// ============================================================================

import './commands';

// ============================================================================
// BEFOREEACH HOOK - Limpieza y configuración global
// ============================================================================
before(() => {
  // Verificar que backend esté disponible (evita fallos silenciosos)
  cy.request({
    url: `${Cypress.env('apiBaseUrl')}/auth/login`,
    method: 'POST',
    body: { email: 'admin@ud.edu', password: 'AdminPass1234' },
    failOnStatusCode: false,
    timeout: 10000,
  }).then((res) => {
    if (res.status === 200) {
      cy.log('✓ Backend disponible y credenciales OK');
    } else {
      cy.log('⚠️ Backend responde pero login falló - usar admin@ud.edu/AdminPass1234 o crear usuarios');
    }
  });
});

beforeEach(() => {
  // Esperar a que el servidor esté listo
  cy.request({
    url: Cypress.config('baseUrl'),
    failOnStatusCode: false,
    timeout: 30000,
  }).then((response) => {
    if (response.status !== 200) {
      cy.log('⚠️ Servidor no responde correctamente, esperando...');
      cy.wait(5000); // Esperar 5 segundos adicionales
    }
  });

  // Limpieza de localStorage (excepto configuraciones persistentes)
  cy.window().then((win) => {
    win.localStorage.removeItem('auth_token');
    win.localStorage.removeItem('user_data');
  });

  // Limpieza de cookies
  cy.clearCookies();

  // Setup de interceptos globales para monitoreo de API
  cy.intercept('GET', '**/api/**', (req) => {
    req.alias = `api-get-${req.url.split('/').pop()}`;
  }).as('apiGetAll');

  cy.intercept('POST', '**/api/**', (req) => {
    req.alias = `api-post-${req.url.split('/').pop()}`;
  }).as('apiPostAll');

  cy.intercept('PUT', '**/api/**', (req) => {
    req.alias = `api-put-${req.url.split('/').pop()}`;
  }).as('apiPutAll');

  cy.intercept('DELETE', '**/api/**', (req) => {
    req.alias = `api-delete-${req.url.split('/').pop()}`;
  }).as('apiDeleteAll');
});

// ============================================================================
// AFTEREACH HOOK - Validación y limpieza post-test
// ============================================================================
afterEach(() => {
  // Check para errores de consola no capturados
  cy.window().then((win) => {
    const errors = win.__uncaughtErrors || [];
    expect(errors).to.have.length(0);
  });
});

// ============================================================================
// MANEJO DE ERRORES NO CAPTURADOS
// ============================================================================
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignorar errores específicos que no afecten la funcionalidad
  if (
    err.message.includes('ResizeObserver loop') ||
    err.message.includes('Non-Error promise rejection')
  ) {
    return false; // Ignorar
  }

  // Dejar los demás errores como fallos
  return true;
});

// ============================================================================
// VENTANA GLOBAL PARA TRACKING DE ERRORES
// ============================================================================
Cypress.on('window:before:load', (win) => {
  win.__uncaughtErrors = [];

  const originalError = win.onerror;
  win.onerror = function (message, source, lineno, colno, error) {
    win.__uncaughtErrors.push({
      message,
      source,
      lineno,
      colno,
      error,
      timestamp: new Date().toISOString(),
    });
    if (typeof originalError === 'function') {
      return originalError(message, source, lineno, colno, error);
    }
  };
});
