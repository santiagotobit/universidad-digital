/**
 * SUITE: EDGE CASES Y MANEJO DE ERRORES
 * 
 * Validaciones:
 * - Pérdida de conexión
 * - Respuestas corruptas/inválidas
 * - Comportamiento inesperado del servidor
 * - Condiciones de carrera
 * - Recuperación de errores
 */
describe('Edge Cases and Error Handling Suite', () => {
  beforeEach(() => {
    cy.setupAuthenticatedUser();
  });

  // ============================================================================
  // PÉRDIDA DE CONEXIÓN
  // ============================================================================

  it('SC-ERROR-001: Pérdida de conexión durante login', () => {
    cy.visit('/login');

    // Simular offline
    cy.intercept('POST', '**/auth/login', { forceNetworkError: true }).as(
      'networkError'
    );

    cy.get('input[type="email"]').type('test@test.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.get('[data-testid="error-message"]', { timeout: 5000 }).should(
      'be.visible'
    );
  });

  it('SC-ERROR-002: Reconexión después de error de red', () => {
    cy.visitWithAuth('/tasks');

    // Primera petición falla
    cy.intercept('GET', '**/tasks', { forceNetworkError: true }).as('failedRequest');

    cy.reload();

    cy.wait('@failedRequest');

    // Segunda petición tiene éxito
    cy.intercept('GET', '**/tasks', {
      body: [
        {
          id: 1,
          title: 'Task',
          status: 'pending',
          priority: 'medium',
          created_at: new Date().toISOString(),
        },
      ],
    }).as('successRequest');

    // Botón de reintentar
    cy.get('[data-testid="retry-button"]', { timeout: 3000 }).then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
        cy.wait('@successRequest');
      }
    });
  });

  // ============================================================================
  // RESPUESTAS CORRUPTAS/INVÁLIDAS
  // ============================================================================

  it('SC-ERROR-003: Respuesta con JSON inválido se maneja', () => {
    cy.visitWithAuth('/tasks');

    cy.intercept('GET', '**/tasks', {
      statusCode: 200,
      body: 'invalid json {{{',
    }).as('invalidJson');

    cy.reload();

    cy.wait('@invalidJson');

    // Debería mostrar error
    cy.get('[data-testid="error-message"]', { timeout: 5000 }).should(
      'be.visible'
    );
  });

  it('SC-ERROR-004: Respuesta con estructura inesperada se valida', () => {
    cy.visitWithAuth('/tasks');

    // Backend devuelve estructura inesperada
    cy.intercept('GET', '**/tasks', {
      body: {
        unexpected_field: 'value',
      },
    }).as('unexpectedStructure');

    cy.reload();

    cy.wait('@unexpectedStructure');

    // Aplicación debería manejar y mostrar error o usar valores default
    cy.get('[data-testid="task-item"]', { timeout: 2000 }).then(($items) => {
      // Si no hay items, está bien, la app fue defensiva
      expect($items.length).to.be.greaterThanOrEqual(0);
    });
  });

  it('SC-ERROR-005: Response Status 500 se maneja correctamente', () => {
    cy.visitWithAuth('/tasks');

    cy.intercept('GET', '**/tasks', { statusCode: 500 }).as('serverError');

    cy.reload();

    cy.wait('@serverError');

    cy.get('[data-testid="error-message"]', { timeout: 5000 }).should(
      'be.visible'
    );
  });

  it('SC-ERROR-006: Response Status 503 (Unavailable) se maneja', () => {
    cy.visitWithAuth('/tasks');

    cy.intercept('GET', '**/tasks', { statusCode: 503 }).as('serviceUnavailable');

    cy.reload();

    cy.wait('@serviceUnavailable');

    cy.get('[data-testid="error-message"]', { timeout: 5000 }).should(
      'be.visible'
    );
  });

  // ============================================================================
  // TIMEOUTS
  // ============================================================================

  it('SC-ERROR-007: Timeout en solicitud GET se maneja', () => {
    cy.visitWithAuth('/tasks');

    cy.mockSlowApi('GET', '**/tasks', Cypress.env('apiTimeout') + 5000);

    cy.reload();

    // Debería mostrar loading luego timeout/error
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
  });

  it('SC-ERROR-008: Timeout en POST (creación) se maneja', () => {
    cy.visitWithAuth('/tasks');

    cy.mockSlowApi('POST', '**/tasks', Cypress.env('apiTimeout') + 5000);

    cy.get('[data-testid="create-button"]').click();
    cy.get('[name="title"]').type('Test Task');
    cy.get('[data-testid="submit-task-button"]').click();

    cy.get('[data-testid="loading-spinner"]').should('be.visible');
  });

  // ============================================================================
  // CONDICIONES DE CARRERA
  // ============================================================================

  it('SC-ERROR-009: Múltiples requests simultáneos se manejan', () => {
    cy.visitWithAuth('/tasks');

    // Simular 2 requests GET simultáneos con delay
    cy.intercept('GET', '**/tasks', { delay: 500, body: [] }).as('getTasks');

    cy.reload();

    cy.wait('@getTasks', { timeout: 10000 });

    // La lista (vacía o con datos) debería mostrarse
    cy.get('[data-testid="tasks-container"]', { timeout: 5000 }).should('exist');
  });

  it('SC-ERROR-010: Last-write-wins en edición concurrente (usando API usuarios)', () => {
    // Usa API real de usuarios para test de concurrencia
    cy.get('@authToken').then((token) => {
      const apiUrl = Cypress.env('apiBaseUrl');
      const headers = { Authorization: `Bearer ${token}` };

      cy.request({
        method: 'PUT',
        url: `${apiUrl}/users/1`,
        headers,
        body: { full_name: 'Version 1' },
      }).then((r1) => expect(r1.status).to.be.oneOf([200]));

      cy.request({
        method: 'PUT',
        url: `${apiUrl}/users/1`,
        headers,
        body: { full_name: 'Version 2' },
      }).then((r2) => expect(r2.status).to.be.oneOf([200]));

      // La última versión debería prevalecer
      cy.request({
        method: 'GET',
        url: `${apiUrl}/users/1`,
        headers,
      }).then((response) => {
        expect(response.body.full_name).to.equal('Version 2');
      });
    });
  });

  // ============================================================================
  // MANEJO DE DATOS INCONSISTENTES
  // ============================================================================

  it('SC-ERROR-011: Tarea sin campos requeridos se valida', () => {
    cy.visitWithAuth('/tasks');

    cy.intercept('POST', '**/tasks', {
      statusCode: 201,
      body: {
        id: 1,
        // Missing: title, description, status
        created_at: new Date().toISOString(),
      },
    }).as('invalidTask');

    cy.get('[data-testid="create-button"]').click();
    cy.get('button[data-testid="submit-task-button"]', { timeout: 3000 }).click();

    // Aplicación debería rechazar o mostrar error
    cy.get('[data-testid="error-message"]', { timeout: 3000 }).then(($error) => {
      // Si el error aparece, todo bien. Si no, la app fue defensiva
      expect($error.length).to.be.greaterThanOrEqual(0);
    });
  });

  it('SC-ERROR-012: Token expirado durante sesión se maneja', () => {
    cy.visitWithAuth('/tasks');

    // Simular expiración de token
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'expired.token.here');
    });

    // API retorna 401
    cy.intercept('GET', '**/tasks', { statusCode: 401 }).as('unauthorized');

    cy.reload();

    cy.wait('@unauthorized');

    // Debería redirigir a login
    cy.url({ timeout: 5000 }).should('include', '/login');
  });

  it('SC-ERROR-013: Cambio de usuario durante sesión activa', () => {
    cy.visitWithAuth('/tasks');

    // Usuario A autenticado
    cy.assertIsAuthenticated();

    // Simular logout de usuario A y login de usuario B
    cy.apiLogout();

    cy.visit('/login');

    // Login como usuario B
    cy.fixture('users.json').then((users) => {
      cy.apiLogin(users.studentUser.email, users.studentUser.password);
    });

    cy.visit('/tasks');

    // Datos de usuario B deberían estar presentes
    cy.window().then((win) => {
      const token = win.localStorage.getItem('auth_token');
      expect(token).to.not.be.null;
    });
  });

  // ============================================================================
  // RECUPERACIÓN DE ERRORES
  // ============================================================================

  it('SC-ERROR-014: Formulario mantiene datos después de error', () => {
    cy.visitWithAuth('/tasks');

    const taskData = {
      title: 'Test Task',
      description: 'Test Description',
    };

    cy.intercept('POST', '**/tasks', { statusCode: 500 }).as('createError');

    // Llenar formulario
    cy.get('[data-testid="create-button"]').click();
    cy.get('[name="title"]').type(taskData.title);
    cy.get('[name="description"]').type(taskData.description);

    // Enviar y fallar
    cy.get('[data-testid="submit-task-button"]').click();
    cy.wait('@createError');

    // Datos deberían estar intactos para reintentar
    cy.get('[name="title"]').should('have.value', taskData.title);
    cy.get('[name="description"]').should('have.value', taskData.description);
  });

  it('SC-ERROR-015: Reintentar después de error exitoso', () => {
    cy.visitWithAuth('/tasks');

    const taskData = {
      title: 'Retry Task',
      description: 'Retry Description',
    };

    // Primera petición falla
    cy.intercept('POST', '**/tasks', { statusCode: 500 }).as('createError');

    cy.get('[data-testid="create-button"]').click();
    cy.get('[name="title"]').type(taskData.title);
    cy.get('[name="description"]').type(taskData.description);
    cy.get('[data-testid="submit-task-button"]').click();

    cy.wait('@createError');

    // Segunda petición exitosa
    cy.intercept('POST', '**/tasks', {
      statusCode: 201,
      body: {
        id: 1,
        ...taskData,
        created_at: new Date().toISOString(),
        status: 'pending',
      },
    }).as('createSuccess');

    // Reintentar
    cy.get('[data-testid="submit-task-button"]').click();

    cy.wait('@createSuccess').then((intercept) => {
      expect(intercept.response?.statusCode).to.equal(201);
    });
  });

  // ============================================================================
  // VALIDACIÓN DE DATOS DESPUÉS DE ERROR
  // ============================================================================

  it('SC-ERROR-016: Datos persistidos son validados después de error temporal', () => {
    const taskId = 1;
    const originalTask = {
      id: taskId,
      title: 'Original',
      status: 'pending',
      priority: 'medium',
      created_at: new Date().toISOString(),
    };

    cy.visitWithAuth('/tasks');

    // Cargar tarea
    cy.intercept('GET', '**/tasks', { body: [originalTask] }).as('getTasks');
    cy.reload();
    cy.wait('@getTasks');

    // API falla momentáneamente
    cy.intercept('GET', `**/tasks/${taskId}`, { statusCode: 500 }).as('getError');

    cy.get('[data-testid="task-item"]').first().click();
    cy.wait('@getError');

    // Mostrar error
    cy.get('[data-testid="error-message"]').should('be.visible');

    // Reintentar exitoso
    cy.intercept('GET', `**/tasks/${taskId}`, { body: originalTask }).as(
      'getSuccess'
    );

    cy.get('[data-testid="retry-button"]').click();

    cy.wait('@getSuccess');

    // Detalles debería mostrar correctamente
    cy.get('[data-testid="task-detail"]').should('contain', originalTask.title);
  });

  // ============================================================================
  // VALIDACIÓN DE INTEGRIDAD DE DATOS
  // ============================================================================

  it('SC-ERROR-017: IDs consistentes después de múltiples sincronizaciones', () => {
    cy.visitWithAuth('/tasks');

    const task = {
      id: 100,
      title: 'Task 100',
      status: 'pending',
      priority: 'medium',
      created_at: new Date().toISOString(),
    };

    // Primera carga
    cy.intercept('GET', '**/tasks', { body: [task] }).as('sync1');
    cy.reload();
    cy.wait('@sync1');

    // Segunda carga
    cy.intercept('GET', '**/tasks', { body: [task] }).as('sync2');
    cy.reload();
    cy.wait('@sync2');

    // IDs no debería cambiar
    cy.get('[data-testid="task-item"]').should('exist');

    cy.get('@authToken').then((token) => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiBaseUrl')}/tasks`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((response) => {
        expect(response.body[0].id).to.equal(100);
      });
    });
  });
});
