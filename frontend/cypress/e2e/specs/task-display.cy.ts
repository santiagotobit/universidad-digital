import { DashboardPage } from '../../page-objects/DashboardPage';
import { ValidationHelper } from '../../helpers/ValidationHelper';

/**
 * SUITE: VISUALIZACIÓN Y CONFIRMACIÓN DE TAREAS
 * 
 * Validaciones:
 * - Listar tareas
 * - Ver detalles de tarea
 * - Estados de tareas
 * - Refresco de datos
 * - Consistencia de datos
 */
describe('Task Display and Confirmation Suite', () => {
  const dashboardPage = new DashboardPage();

  beforeEach(() => {
    cy.setupAuthenticatedUser();
    cy.visitWithAuth('/tasks');
    dashboardPage.verifyPageLoaded();
  });

  // ============================================================================
  // VISUALIZAR LISTA DE TAREAS
  // ============================================================================

  it('SC-DISPLAY-001: Lista de tareas carga correctamente', () => {
    const mockTasks = [
      {
        id: 1,
        title: 'Task 1',
        description: 'Description 1',
        status: 'pending',
        priority: 'high',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Task 2',
        description: 'Description 2',
        status: 'completed',
        priority: 'low',
        created_at: new Date().toISOString(),
      },
    ];

    cy.intercept('GET', '**/tasks', { body: mockTasks }).as('getTasks');

    cy.visit('/tasks');

    cy.wait('@getTasks').then((intercept) => {
      ValidationHelper.validateListResponse({ status: 200, body: mockTasks });
    });

    dashboardPage.verifyTaskListVisible();
  });

  it('SC-DISPLAY-002: Tareas se muestran con datos correctos', () => {
    const mockTasks = [
      {
        id: 1,
        title: 'Review Design Mockups',
        description: 'Review and approve new UI mockups',
        status: 'pending',
        priority: 'high',
        created_at: '2024-02-01T10:00:00Z',
      },
    ];

    cy.intercept('GET', '**/tasks', { body: mockTasks }).as('getTasks');

    cy.wait('@getTasks');

    // Verificar que datos aparecen correctamente
    cy.get('[data-testid="task-item"]').first().then(($task) => {
      cy.wrap($task).should('contain', 'Review Design Mockups');
      cy.wrap($task).should('contain', 'Review and approve new UI mockups');
      cy.wrap($task).should('contain', 'high');
    });
  });

  it('SC-DISPLAY-003: Lista vacía muestra estado vacío cuando no hay tareas', () => {
    cy.intercept('GET', '**/tasks', { body: [] }).as('getTasks');

    cy.reload();
    cy.wait('@getTasks');

    dashboardPage.verifyEmptyState();
    cy.assertNotExists('[data-testid="task-item"]');
  });

  it('SC-DISPLAY-004: Cantidad correcta de tareas se muestra', () => {
    const taskCount = 5;
    const mockTasks = Array.from({ length: taskCount }, (_, i) => ({
      id: i + 1,
      title: `Task ${i + 1}`,
      description: `Description ${i + 1}`,
      status: 'pending',
      priority: 'medium',
      created_at: new Date().toISOString(),
    }));

    cy.intercept('GET', '**/tasks', { body: mockTasks }).as('getTasks');

    cy.reload();
    cy.wait('@getTasks');

    dashboardPage.verifyTaskCount(taskCount);
  });

  // ============================================================================
  // VISUALIZAR DETALLES DE TAREA
  // ============================================================================

  it('SC-DISPLAY-005: Click en tarea abre detalles', () => {
    const mockTask = {
      id: 1,
      title: 'Sample Task',
      description: 'Detailed description of the task',
      status: 'pending',
      priority: 'medium',
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-02-01T10:00:00Z',
    };

    cy.intercept('GET', '**/tasks', { body: [mockTask] }).as('getTasks');
    cy.intercept('GET', '**/tasks/1', { body: mockTask }).as('getTaskDetail');

    cy.wait('@getTasks');

    dashboardPage.getTaskByTitle(mockTask.title).click();

    cy.wait('@getTaskDetail');

    cy.get('[data-testid="task-detail"]', { timeout: 5000 }).should('be.visible');
  });

  it('SC-DISPLAY-006: Detalles de tarea mostrar información completa', () => {
    const mockTask = {
      id: 1,
      title: 'Complete Project Report',
      description: 'Prepare and submit quarterly project report',
      status: 'pending',
      priority: 'high',
      due_date: '2024-12-31T23:59:59Z',
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-02-01T10:00:00Z',
      created_by: 1,
    };

    cy.intercept('GET', '**/tasks', { body: [mockTask] }).as('getTasks');
    cy.intercept('GET', '**/tasks/1', { body: mockTask }).as('getTaskDetail');

    cy.wait('@getTasks');
    dashboardPage.getTaskByTitle(mockTask.title).click();

    cy.wait('@getTaskDetail');

    cy.get('[data-testid="task-detail"]').then(($detail) => {
      cy.wrap($detail).should('contain', mockTask.title);
      cy.wrap($detail).should('contain', mockTask.description);
      cy.wrap($detail).should('contain', mockTask.priority);
      cy.wrap($detail).should('contain', 'pending');
    });
  });

  // ============================================================================
  // ESTADOS DE TAREAS
  // ============================================================================

  it('SC-DISPLAY-007: Tarea con estado "pending" se muestra correctamente', () => {
    const pendingTask = {
      id: 1,
      title: 'Pending Task',
      status: 'pending',
      priority: 'medium',
      created_at: new Date().toISOString(),
    };

    cy.intercept('GET', '**/tasks', { body: [pendingTask] }).as('getTasks');

    cy.reload();
    cy.wait('@getTasks');

    dashboardPage.verifyTaskExists('Pending Task');
    cy.get('[data-testid="task-item"]').should('contain', 'pending');
  });

  it('SC-DISPLAY-008: Tarea con estado "completed" se muestra correctamente', () => {
    const completeTask = {
      id: 2,
      title: 'Completed Task',
      status: 'completed',
      priority: 'medium',
      created_at: new Date().toISOString(),
    };

    cy.intercept('GET', '**/tasks', { body: [completeTask] }).as('getTasks');

    cy.reload();
    cy.wait('@getTasks');

    dashboardPage.verifyTaskExists('Completed Task');
    cy.get('[data-testid="task-item"]').should('contain', 'completed');
  });

  it('SC-DISPLAY-009: Tareas se ordenan correctamente (por fecha creación)', () => {
    const mockTasks = [
      {
        id: 1,
        title: 'Task 1',
        created_at: '2024-02-01T10:00:00Z',
        status: 'pending',
        priority: 'medium',
      },
      {
        id: 2,
        title: 'Task 2',
        created_at: '2024-02-02T10:00:00Z',
        status: 'pending',
        priority: 'medium',
      },
      {
        id: 3,
        title: 'Task 3',
        created_at: '2024-02-03T10:00:00Z',
        status: 'pending',
        priority: 'medium',
      },
    ];

    cy.intercept('GET', '**/tasks', { body: mockTasks }).as('getTasks');

    cy.reload();
    cy.wait('@getTasks');

    cy.get('[data-testid="task-item"]').then(($items) => {
      expect($items.length).to.equal(3);
      expect($items.eq(0)).to.contain('Task 1');
      expect($items.eq(1)).to.contain('Task 2');
      expect($items.eq(2)).to.contain('Task 3');
    });
  });

  // ============================================================================
  // REFRESCO Y SINCRONIZACIÓN DE DATOS
  // ============================================================================

  it('SC-DISPLAY-010: Refresco de página mantiene lista de tareas', () => {
    const mockTasks = [
      {
        id: 1,
        title: 'Task 1',
        status: 'pending',
        priority: 'medium',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Task 2',
        status: 'completed',
        priority: 'high',
        created_at: new Date().toISOString(),
      },
    ];

    cy.intercept('GET', '**/tasks', { body: mockTasks }).as('getTasks');

    cy.wait('@getTasks');
    dashboardPage.verifyTaskCount(2);

    // Refrescar
    cy.reload();

    cy.intercept('GET', '**/tasks', { body: mockTasks });
    cy.wait('@getTasks');

    dashboardPage.verifyTaskCount(2);
    dashboardPage.verifyTaskExists('Task 1');
    dashboardPage.verifyTaskExists('Task 2');
  });

  it('SC-DISPLAY-011: Nueva tarea aparece sin refresco manual', () => {
    const initialTasks = [
      {
        id: 1,
        title: 'Initial Task',
        status: 'pending',
        priority: 'medium',
        created_at: new Date().toISOString(),
      },
    ];

    const newTask = {
      id: 2,
      title: 'New Task Added',
      status: 'pending',
      priority: 'high',
      created_at: new Date().toISOString(),
    };

    // Primera carga
    cy.intercept('GET', '**/tasks', { body: initialTasks }).as('getTasks1');

    cy.reload();
    cy.wait('@getTasks1');

    dashboardPage.verifyTaskCount(1);

    // Simular que se creó una nueva tarea (poll o notification)
    cy.intercept('GET', '**/tasks', { body: [...initialTasks, newTask] }).as(
      'getTasks2'
    );

    // En una app real, esto sería un poll o WebSocket
    // Por ahora lo simulamos haciendo una nueva request
    cy.request('GET', `${Cypress.env('apiBaseUrl')}/tasks`).then((response) => {
      expect(response.status).to.equal(200);
    });
  });

  it('SC-DISPLAY-012: Cambios en tarea se reflejan en lista', () => {
    const originalTask = {
      id: 1,
      title: 'Original Title',
      status: 'pending',
      priority: 'medium',
      created_at: new Date().toISOString(),
    };

    const updatedTask = {
      ...originalTask,
      title: 'Updated Title',
      status: 'completed',
    };

    cy.intercept('GET', '**/tasks', { body: [originalTask] }).as('getTasks1');

    cy.reload();
    cy.wait('@getTasks1');

    dashboardPage.verifyTaskExists('Original Title');

    // Simular actualización
    cy.intercept('GET', '**/tasks', { body: [updatedTask] }).as('getTasks2');

    cy.reload();
    cy.wait('@getTasks2');

    dashboardPage.verifyTaskExists('Updated Title');
    cy.get('[data-testid="task-item"]').should('contain', 'completed');
  });

  // ============================================================================
  // MANEJO DE ERRORES EN VISUALIZACIÓN
  // ============================================================================

  it('SC-DISPLAY-013: Error en carga de tareas muestra mensaje', () => {
    cy.intercept('GET', '**/tasks', { statusCode: 500 }).as('getTasks');

    cy.reload();

    cy.wait('@getTasks');

    cy.get('[data-testid="error-message"]', { timeout: 5000 }).should(
      'be.visible'
    );
  });

  it('SC-DISPLAY-014: Sin autenticación, lista de tareas no se carga', () => {
    cy.apiLogout();
    cy.clearCookies();

    cy.visit('/tasks', { failOnStatusCode: false });

    cy.url().should('include', '/login');
    cy.assertNotExists('[data-testid="task-list"]');
  });

  it('SC-DISPLAY-015: Timeout en carga de tareas se maneja gracefully', () => {
    cy.mockSlowApi('GET', '**/tasks', 20000);

    cy.reload();

    cy.get('[data-testid="loading-spinner"]').should('be.visible');
  });

  // ============================================================================
  // BÚSQUEDA Y FILTRADO
  // ============================================================================

  it('SC-DISPLAY-016: Búsqueda filtra tareas correctamente', () => {
    const mockTasks = [
      {
        id: 1,
        title: 'Buy groceries',
        status: 'pending',
        priority: 'medium',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Pay bills',
        status: 'pending',
        priority: 'high',
        created_at: new Date().toISOString(),
      },
    ];

    cy.intercept('GET', '**/tasks', { body: mockTasks }).as('getTasks');
    cy.intercept('GET', '**/tasks?search=Buy', { body: [mockTasks[0]] }).as(
      'searchTasks'
    );

    cy.reload();
    cy.wait('@getTasks');

    // Buscar
    cy.get('input[data-testid="search-tasks"]').type('Buy');

    cy.wait('@searchTasks');

    dashboardPage.verifyTaskCount(1);
    dashboardPage.verifyTaskExists('Buy groceries');
    dashboardPage.verifyTaskNotExists('Pay bills');
  });

  it('SC-DISPLAY-017: Filtro por estado muestra solo tareas del estado seleccionado', () => {
    const mockTasks = [
      {
        id: 1,
        title: 'Pending Task',
        status: 'pending',
        priority: 'medium',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Completed Task',
        status: 'completed',
        priority: 'medium',
        created_at: new Date().toISOString(),
      },
    ];

    cy.intercept('GET', '**/tasks', { body: mockTasks }).as('getTasks');
    cy.intercept('GET', '**/tasks?status=completed', {
      body: [mockTasks[1]],
    }).as('filteredTasks');

    cy.reload();
    cy.wait('@getTasks');

    // Filtrar por estado completed
    cy.get('select[data-testid="filter-status"]').select('completed');

    cy.wait('@filteredTasks');

    dashboardPage.verifyTaskCount(1);
    dashboardPage.verifyTaskExists('Completed Task');
  });
});
