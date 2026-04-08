// ============================================================================
// CUSTOM CYPRESS COMMANDS PARA PRUEBAS E2E
// ============================================================================

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

/**
 * Login con credenciales
 * Usa Bearer token para evitar problemas con domain de cookies (localhost vs 127.0.0.1)
 * @param email Email del usuario
 * @param password Password del usuario
 * @param options Opciones adicionales
 */
Cypress.Commands.add('apiLogin', (email: string, password: string, options?: { apiBaseUrl?: string }) => {
  const apiUrl = options?.apiBaseUrl || Cypress.env('apiBaseUrl');

  cy.session([email, password, apiUrl], () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      body: { email, password },
    }).then((response) => {
      expect(response.status).to.eq(200);
      const token = response.body?.access_token;
      if (token) {
        // Guardar token para requests posteriores (evita dependencia de cookies por domain)
        cy.wrap(token).as('authToken');
      }
    });
  }, {
    validate: () => {
      // Validar sesión: login + GET /auth/me con Bearer token
      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/login`,
        body: { email, password },
      }).then((loginRes) => {
        expect(loginRes.status).to.eq(200);
        const token = loginRes.body?.access_token;
        expect(token, 'Token no recibido en login').to.be.a('string');
        return cy.request({
          method: 'GET',
          url: `${apiUrl}/auth/me`,
          headers: { Authorization: `Bearer ${token}` },
        });
      }).then((meResponse) => {
        expect(meResponse.status).to.eq(200);
        cy.window().then((win) => {
          win.localStorage.setItem('user_data', JSON.stringify(meResponse.body));
        });
      });
    },
    cacheAcrossSpecs: false,
  });

  // Re-login para obtener token y usarlo en requests de esta spec
  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    body: { email, password },
  }).then((res) => {
    if (res.body?.access_token) {
      cy.wrap(res.body.access_token).as('authToken');
    }
  });

  cy.log(`✓ Login exitoso: ${email}`);
});

/**
 * Login via UI (simula acciones del usuario)
 * @param email Email del usuario
 * @param password Password del usuario
 */
Cypress.Commands.add('uiLogin', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email, { delay: 50 });
  cy.get('input[type="password"]').type(password, { delay: 50 });
  cy.get('button[type="submit"]').click();
  cy.get('[data-testid="dashboard"]').should('be.visible');
  cy.log(`✓ Login UI exitoso: ${email}`);
});

/**
 * Setup de usuario autenticado (login automático)
 * Usa credenciales de credentials.txt o create_test_users.py (admin@test.com)
 * @param userType Tipo de usuario ('admin', 'teacher', 'student')
 */
Cypress.Commands.add('setupAuthenticatedUser', (userType: 'admin' | 'teacher' | 'student' = 'admin') => {
  const credentials = {
    admin: { email: Cypress.env('testUserEmail') || 'admin@ud.edu', password: Cypress.env('testUserPassword') || 'AdminPass1234' },
    teacher: { email: 'docente@ud.edu', password: 'DocentePass1234' },
    student: { email: 'estudiante@ud.edu', password: 'EstudiantePass1234' }
  };

  const { email, password } = credentials[userType];

  cy.apiLogin(email, password);

  // Obtener token y user_data para cy.visitWithAuth (tests que requieren localStorage)
  const apiUrl = Cypress.env('apiBaseUrl');
  cy.get('@authToken').then((token) => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/auth/me`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((meRes) => {
      cy.wrap({ token, userData: meRes.body }).as('authData');
    });
  });

  cy.log(`✓ Setup usuario autenticado: ${userType} (${email})`);
});

/**
 * Visitar ruta con auth (localStorage) para tests que verifican user_data/auth_token
 * Usar en lugar de cy.visit cuando el test requiere localStorage pre-poblado
 */
Cypress.Commands.add('visitWithAuth', (path: string = '/dashboard') => {
  cy.get('@authData').then((data: { token: string; userData: object }) => {
    cy.visit(path, {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('auth_token', data.token);
        win.localStorage.setItem('user_data', JSON.stringify(data.userData));
      },
    });
  });
});

// ============================================================================
// VALIDACIÓN DE ESTADO
// ============================================================================

/**
 * Crear usuario de prueba via API
 * @param email Email del usuario
 * @param password Password del usuario
 * @param fullName Nombre completo
 * @param roleName Nombre del rol
 */
Cypress.Commands.add('createTestUser', (email: string, password: string, fullName: string, roleName: string) => {
  const apiUrl = Cypress.env('apiBaseUrl');

  // First create the user
  cy.request({
    method: 'POST',
    url: `${apiUrl}/users`,
    body: {
      email,
      password,
      full_name: fullName
    },
    failOnStatusCode: false,
  }).then((createResponse) => {
    if (createResponse.status === 201 || createResponse.status === 200) {
      cy.log(`✓ Usuario creado: ${email}`);

      // Get user ID from response
      const userId = createResponse.body.id;

      // Assign role (assuming role exists)
      cy.request({
        method: 'POST',
        url: `${apiUrl}/users/${userId}/roles`,
        body: { role_name: roleName },
        failOnStatusCode: false,
      }).then((roleResponse) => {
        if (roleResponse.status === 200) {
          cy.log(`✓ Rol asignado: ${roleName} a ${email}`);
        } else {
          cy.log(`⚠️ Error asignando rol: ${roleResponse.status}`);
        }
      });
    } else if (createResponse.status === 409) {
      cy.log(`⚠️ Usuario ya existe: ${email}`);
    } else if (createResponse.status === 401 || createResponse.status === 403) {
      cy.log(`⚠️ No autorizado para crear usuario: ${email} - usando login directo`);
      // If we can't create users, just try to login with the expected credentials
      // This assumes the users already exist in the database
    } else {
      cy.log(`⚠️ Error creando usuario: ${createResponse.status} - ${createResponse.body?.detail || 'Unknown error'}`);
    }
  });
});

/**
 * Validar que el usuario está autenticado
 * La app usa cookies; comprobamos UI (dashboard/navbar) o que no estamos en login
 */
Cypress.Commands.add('assertIsAuthenticated', () => {
  cy.url().should('not.include', '/login');
  cy.get(
    '[data-testid="dashboard"], [data-testid="navigation-menu"], [data-testid="logout-button"]',
    { timeout: 8000 }
  ).should('exist');
  cy.log('✓ Usuario autenticado');
});

/**
 * Validar que el usuario NO está autenticado
 */
Cypress.Commands.add('assertIsNotAuthenticated', () => {
  cy.url().should('include', '/login');
  cy.get(
    '[data-testid="dashboard"], [data-testid="navigation-menu"], [data-testid="logout-button"]',
  ).should('not.exist');
  cy.log('✓ Usuario NO autenticado');
});

/**
 * Esperar y validar un endpoint específico
 * @param method Método HTTP
 * @param urlPattern Patrón de URL
 * @param timeout Timeout en ms
 */
Cypress.Commands.add(
  'waitForApi',
  (method: string, urlPattern: string, timeout: number = Cypress.env('apiTimeout')) => {
    cy.intercept(method, urlPattern).as('apiCall');
    cy.wait('@apiCall', { timeout }).then((intercept) => {
      expect(intercept.response?.statusCode).to.be.oneOf([200, 201, 204]);
      return cy.wrap(intercept.response?.body);
    });
  }
);

/**
 * Esperar respuesta de API con validación específica
 */
Cypress.Commands.add('waitForApiWithValidation', (alias: string, expectedStatus: number) => {
  cy.wait(`@${alias}`).then((intercept) => {
    expect(intercept.response?.statusCode).to.equal(expectedStatus);
    cy.log(`✓ API respuesta válida: ${expectedStatus}`);
  });
});

// ============================================================================
// MANEJO DE ELEMENTOS
// ============================================================================

/**
 * Click en un elemento con espera previa
 */
Cypress.Commands.add('safeClick', (selector: string, options?: any) => {
  cy.get(selector, { timeout: Cypress.env('uiTimeout') })
    .should('be.visible')
    .should('not.be.disabled')
    .click(options);
  cy.log(`✓ Click en: ${selector}`);
});

/**
 * Escribir con validación
 */
Cypress.Commands.add('safeType', (selector: string, text: string, options?: any) => {
  cy.get(selector, { timeout: Cypress.env('uiTimeout') })
    .should('be.visible')
    .clear()
    .type(text, { delay: 30, ...options });
  cy.log(`✓ Typing en: ${selector}`);
});

/**
 * Seleccionar opción en dropdown
 */
Cypress.Commands.add('selectOption', (selector: string, value: string) => {
  cy.get(selector).should('be.visible').select(value);
  cy.log(`✓ Seleccionada opción: ${value}`);
});

// ============================================================================
// VALIDACIÓN DE ELEMENTOS
// ============================================================================

/**
 * Validar que elemento existe y es visible
 */
Cypress.Commands.add('assertVisible', (selector: string) => {
  cy.get(selector, { timeout: Cypress.env('uiTimeout') }).should('be.visible');
  cy.log(`✓ Elemento visible: ${selector}`);
});

/**
 * Validar que elemento NO existe
 */
Cypress.Commands.add('assertNotExists', (selector: string) => {
  cy.get(selector).should('not.exist');
  cy.log(`✓ Elemento no existe: ${selector}`);
});

/**
 * Validar contenido de elemento
 */
Cypress.Commands.add('assertTextContent', (selector: string, text: string) => {
  cy.get(selector).should('contain', text);
  cy.log(`✓ Texto contenido: "${text}"`);
});

/**
 * Validar valor de input
 */
Cypress.Commands.add('assertInputValue', (selector: string, value: string) => {
  cy.get(selector).should('have.value', value);
  cy.log(`✓ Valor de input: "${value}"`);
});

// ============================================================================
// VALIDACIÓN DE API
// ============================================================================

/**
 * Validar respuesta de API
 * @param alias Alias del intercept
 * @param expectedStatus Status code esperado
 * @param bodyValidation Función de validación del body (opcional)
 */
Cypress.Commands.add(
  'assertApiResponse',
  (
    alias: string,
    expectedStatus: number,
    bodyValidation?: (body: any) => void
  ) => {
    cy.wait(`@${alias}`).then((intercept) => {
      expect(intercept.response?.statusCode).to.equal(expectedStatus);
      if (bodyValidation && intercept.response?.body) {
        bodyValidation(intercept.response.body);
      }
      cy.log(`✓ API Response válida: ${expectedStatus}`);
    });
  }
);

/**
 * Validar estructura de respuesta JSON
 */
Cypress.Commands.add('assertJsonSchema', (alias: string, schema: any) => {
  cy.wait(`@${alias}`).then((intercept) => {
    const body = intercept.response?.body;
    // Validación básica de propiedades
    Object.keys(schema).forEach((key) => {
      expect(body[key]).to.exist;
      if (schema[key]) {
        expect(body[key]).to.be.a(schema[key]);
      }
    });
    cy.log(`✓ JSON Schema válido`);
  });
});

// ============================================================================
// FLUJOS COMUNES
// ============================================================================

/**
 * Setup de usuario autenticado (login + validación)
 */
// Nota: la versión principal de setupAuthenticatedUser (con tipo de usuario)
// se define al inicio de este archivo. No redefinimos aquí para evitar
// duplicar lógica y romper los tests.

/**
 * Visitr página y esperar carga
 */
Cypress.Commands.add('visitAndWait', (path: string, timeout?: number) => {
  cy.visit(path);
  cy.get('body').should('be.visible');
  if (timeout) {
    cy.wait(timeout);
  }
  cy.log(`✓ Página cargada: ${path}`);
});

// ============================================================================
// VALIDACIÓN DE DATOS PERSISTENTES
// ============================================================================

/**
 * Validar que dato persiste en localStorage
 */
Cypress.Commands.add('assertLocalStorageItem', (key: string, value?: string) => {
  cy.window().then((win) => {
    const item = win.localStorage.getItem(key);
    expect(item).to.exist;
    if (value) {
      expect(item).to.equal(value);
    }
  });
  cy.log(`✓ localStorage.${key} existe`);
});

/**
 * Validar datos en base de datos via API
 */
Cypress.Commands.add(
  'assertDatabaseRecord',
  (apiEndpoint: string, expectedData: any, timeout?: number) => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiBaseUrl')}${apiEndpoint}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      failOnStatusCode: false,
      timeout: timeout || Cypress.env('apiTimeout'),
    }).then((response) => {
      expect(response.status).to.equal(200);
      const data = response.body;
      Object.keys(expectedData).forEach((key) => {
        expect(data[key]).to.equal(expectedData[key]);
      });
      cy.log(`✓ Registro en BD validado`);
    });
  }
);

// ============================================================================
// MANEJO DE ERRORES Y CASOS EDGE
// ============================================================================

/**
 * Intercept de error 500
 */
Cypress.Commands.add('mockServerError', (method: string, urlPattern: string) => {
  cy.intercept(method, urlPattern, {
    statusCode: 500,
    body: {
      detail: 'Internal Server Error',
    },
  }).as('serverError');
});

/**
 * Intercept de timeout/delay
 */
Cypress.Commands.add('mockSlowApi', (method: string, urlPattern: string, delayMs: number) => {
  cy.intercept(method, urlPattern, {
    delay: delayMs,
    statusCode: 200,
    body: {
      access_token: 'slow-token',
      token_type: 'bearer',
    },
  }).as('slowApi');
});

/**
 * Intercept de error de validación
 */
Cypress.Commands.add('mockValidationError', (method: string, urlPattern: string, fieldErrors: any) => {
  cy.intercept(method, urlPattern, {
    statusCode: 422,
    body: {
      detail: fieldErrors,
    },
  }).as('validationError');
});

// ============================================================================
// HELPER PARA DEBUG
// ============================================================================

/**
 * Log de estado actual
 */
/**
 * Logout via API (si hay token) y limpieza de localStorage
 */
Cypress.Commands.add('apiLogout', () => {
  const apiUrl = Cypress.env('apiBaseUrl');
  cy.window().then((win) => {
    const token = win.localStorage.getItem('auth_token');
    if (token) {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/logout`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      });
    }
    win.localStorage.removeItem('auth_token');
    win.localStorage.removeItem('user_data');
  });
  cy.log('✓ Logout realizado');
});

Cypress.Commands.add('debugState', () => {
  cy.window().then((win) => {
    cy.log('=== ESTADO ACTUAL ===');
    cy.log(`Token: ${win.localStorage.getItem('auth_token')?.substring(0, 20)}...`);
    cy.log(`URL: ${win.location.href}`);
  });
});

// ============================================================================
// EXTENDING CYPRESS TYPES
// ============================================================================
declare global {
  namespace Cypress {
    interface Chainable {
      apiLogin(email: string, password: string, options?: any): Chainable<void>;
      uiLogin(email: string, password: string): Chainable<void>;
      apiLogout(): Chainable<void>;
      assertIsAuthenticated(): Chainable<void>;
      assertIsNotAuthenticated(): Chainable<void>;
      waitForApi(method: string, urlPattern: string, timeout?: number): Chainable<any>;
      waitForApiWithValidation(alias: string, expectedStatus: number): Chainable<void>;
      safeClick(selector: string, options?: any): Chainable<void>;
      safeType(selector: string, text: string, options?: any): Chainable<void>;
      selectOption(selector: string, value: string): Chainable<void>;
      assertVisible(selector: string): Chainable<void>;
      assertNotExists(selector: string): Chainable<void>;
      assertTextContent(selector: string, text: string): Chainable<void>;
      assertInputValue(selector: string, value: string): Chainable<void>;
      assertApiResponse(alias: string, expectedStatus: number, bodyValidation?: (body: any) => void): Chainable<void>;
      assertJsonSchema(alias: string, schema: any): Chainable<void>;
      setupAuthenticatedUser(userType?: 'admin' | 'teacher' | 'student'): Chainable<void>;
      visitWithAuth(path?: string): Chainable<void>;
      visitAndWait(path: string, timeout?: number): Chainable<void>;
      assertLocalStorageItem(key: string, value?: string): Chainable<void>;
      assertDatabaseRecord(apiEndpoint: string, expectedData: any, timeout?: number): Chainable<void>;
      mockServerError(method: string, urlPattern: string): Chainable<void>;
      mockSlowApi(method: string, urlPattern: string, delayMs: number): Chainable<void>;
      mockValidationError(method: string, urlPattern: string, fieldErrors: any): Chainable<void>;
      debugState(): Chainable<void>;
    }
  }
}

export {};
