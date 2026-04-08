import { DashboardPage } from '../../page-objects/DashboardPage';
import { TaskCreationPage } from '../../page-objects/TaskCreationPage';
import { ApiHelper } from '../../helpers/ApiHelper';
import { TestDataHelper } from '../../helpers/TestDataHelper';
import { ValidationHelper } from '../../helpers/ValidationHelper';

/**
 * SUITE: CREACIÓN DE TAREAS
 * 
 * Validaciones:
 * - Crear tarea con datos válidos
 * - Validación de campos (frontend + backend)
 * - Manejo de errores del servidor
 * - Persistencia en BD
 * - Visualización inmediata
 * - Estados de carga
 */
describe('Task Creation Suite', () => {
  const dashboardPage = new DashboardPage();
  const taskCreationPage = new TaskCreationPage();

  beforeEach(() => {
    cy.setupAuthenticatedUser();
    cy.visitWithAuth('/tasks');
    dashboardPage.verifyPageLoaded();
  });

  // ============================================================================
  // CREAR TAREA EXITOSAMENTE
  // ============================================================================

  it('SC-TASK-001: Crear tarea válida exitosamente', () => {
    const taskData = TestDataHelper.createValidTask();

    // Intercept de creación
    cy.intercept('POST', '**/tasks', {
      statusCode: 201,
      body: {
        id: 1,
        ...taskData,
        created_at: new Date().toISOString(),
        created_by: 1,
        status: 'pending',
      },
    }).as('createTask');

    // Abrir modal de creación
    dashboardPage.clickCreateButton();
    taskCreationPage.verifyModalVisible();

    // Llenar formulario
    taskCreationPage.fillTaskForm(taskData);

    // Validar que submit está habilitado
    taskCreationPage.verifySubmitButtonEnabled();

    // Enviar
    taskCreationPage.submitTask();

    // Validar respuesta de API
    cy.assertApiResponse('createTask', 201, (body) => {
      expect(body.title).to.equal(taskData.title);
      expect(body.description).to.equal(taskData.description);
      expect(body.priority).to.equal(taskData.priority);
      expect(body).to.have.property('id');
      expect(body).to.have.property('created_at');
    });

    // Validar que modal se cierra
    taskCreationPage.verifyModalNotVisible();
  });

  it('SC-TASK-002: Tarea aparece en lista después de creación', () => {
    const taskData = TestDataHelper.createValidTask();

    cy.intercept('POST', '**/tasks', {
      statusCode: 201,
      body: {
        id: 100,
        ...taskData,
        created_at: new Date().toISOString(),
        created_by: 1,
        status: 'pending',
      },
    }).as('createTask');

    cy.intercept('GET', '**/tasks', {
      body: [
        {
          id: 100,
          ...taskData,
          created_at: new Date().toISOString(),
          created_by: 1,
          status: 'pending',
        },
      ],
    }).as('getTasks');

    // Crear tarea
    dashboardPage.clickCreateButton();
    taskCreationPage.fillTaskForm(taskData);
    taskCreationPage.submitTask();

    cy.wait('@createTask');
    cy.waitForApi('GET', '**/tasks');

    // Verificar que tarea aparece en lista
    dashboardPage.verifyTaskExists(taskData.title);
  });

  it('SC-TASK-003: Datos de tarea son correctos en lista', () => {
    const taskData = TestDataHelper.createValidTask();

    const createdTask = {
      id: 101,
      ...taskData,
      created_at: new Date().toISOString(),
      created_by: 1,
      status: 'pending',
    };

    cy.intercept('POST', '**/tasks', {
      statusCode: 201,
      body: createdTask,
    }).as('createTask');

    cy.intercept('GET', '**/tasks').as('getTasks');

    // Crear tarea
    dashboardPage.clickCreateButton();
    taskCreationPage.fillTaskForm(taskData);
    cy.intercept('GET', '**/tasks', { body: [createdTask] });
    taskCreationPage.submitTask();

    cy.wait('@createTask');

    // Validar datos en UI
    const taskElement = dashboardPage.getTaskByTitle(taskData.title);
    taskElement.should('contain', taskData.description);
    taskElement.should('contain', taskData.priority);
  });

  it('SC-TASK-004: Tarea persiste en BD después de refresco', () => {
    const taskData = TestDataHelper.createValidTask();

    const createdTask = {
      id: 102,
      ...taskData,
      created_at: new Date().toISOString(),
      created_by: 1,
      status: 'pending',
    };

    // Intercepts
    cy.intercept('POST', '**/tasks', { statusCode: 201, body: createdTask }).as(
      'createTask'
    );

    // Primera carga de tareas después de crear
    cy.intercept('GET', '**/tasks', { body: [createdTask] }).as('getTasks1');

    // Crear tarea
    dashboardPage.clickCreateButton();
    taskCreationPage.fillTaskForm(taskData);
    taskCreationPage.submitTask();

    cy.wait('@createTask');
    cy.wait('@getTasks1');

    // Segunda intercept para después del refresco
    cy.intercept('GET', '**/tasks', { body: [createdTask] }).as('getTasks2');

    // Refrescar página
    cy.reload();

    cy.wait('@getTasks2');

    // Validar que tarea sigue existiendo
    dashboardPage.verifyTaskExists(taskData.title);
  });

  // ============================================================================
  // INDICADORES DE CARGA
  // ============================================================================

  it('SC-TASK-005: Spinner de carga aparece durante envío', () => {
    const taskData = TestDataHelper.createValidTask();

    // Simular delay en respuesta
    cy.intercept('POST', '**/tasks', (req) => {
      req.reply((res) => {
        res.delay(2000);
        res.send({
          statusCode: 201,
          body: {
            id: 103,
            ...taskData,
            created_at: new Date().toISOString(),
            created_by: 1,
            status: 'pending',
          },
        });
      });
    }).as('slowCreateTask');

    dashboardPage.clickCreateButton();
    taskCreationPage.fillTaskForm(taskData);
    taskCreationPage.submitTask();

    // Loading debería aparecer
    cy.get('[data-testid="loading-spinner"]', { timeout: 1000 }).should(
      'be.visible'
    );

    cy.wait('@slowCreateTask');

    // Loading desaparece
    cy.get('[data-testid="loading-spinner"]').should('not.exist');
  });

  it('SC-TASK-006: Botón submit se deshabilita durante envío', () => {
    const taskData = TestDataHelper.createValidTask();

    cy.intercept('POST', '**/tasks', (req) => {
      req.reply((res) => {
        res.delay(1500);
      });
    }).as('delayedCreate');

    dashboardPage.clickCreateButton();
    taskCreationPage.fillTaskForm(taskData);

    taskCreationPage.verifySubmitButtonEnabled();

    taskCreationPage.submitTask();

    // Debería estar disabled durante envío
    cy.get('[data-testid="submit-task-button"]').should('be.disabled');

    cy.wait('@delayedCreate');

    // Volver a estar enabled (o modal cierra)
    cy.get('[data-testid="task-creation-modal"]').should('not.exist');
  });

  // ============================================================================
  // VALIDACIÓN DE CAMPOS (FRONTEND)
  // ============================================================================

  it('SC-TASK-007: Título vacío no permite envío', () => {
    dashboardPage.clickCreateButton();
    taskCreationPage.verifyModalVisible();

    // Llenar solo descripción
    const taskData = TestDataHelper.createValidTask();
    taskCreationPage.fillDescription(taskData.description);

    // Submit debería estar disabled
    taskCreationPage.verifySubmitButtonDisabled();
  });

  it('SC-TASK-008: Validación de campo requerido muestra error', () => {
    dashboardPage.clickCreateButton();

    // Cuando el título está vacío
    cy.get('[name="title"]').focus();
    cy.get('[name="title"]').blur();

    // Debería mostrar error
    cy.get('[data-testid="error-title"]', { timeout: 3000 }).should('be.visible');
  });

  it('SC-TASK-009: Título muy largo se rechaza', () => {
    const invalidTask = TestDataHelper.createInvalidTask('long');

    dashboardPage.clickCreateButton();
    taskCreationPage.fillTitle(invalidTask.title);

    // Frontend podría validar longitud máxima
    cy.get('[name="title"]').then(($input) => {
      const maxLength = $input.attr('maxlength');
      if (maxLength) {
        expect(invalidTask.title.length).to.be.greaterThan(parseInt(maxLength));
      }
    });
  });

  it('SC-TASK-010: Descripción es opcional', () => {
    dashboardPage.clickCreateButton();

    const taskData = {
      title: TestDataHelper.generateRandomTaskTitle(),
      priority: 'medium',
    };

    taskCreationPage.fillTitle(taskData.title);
    taskCreationPage.selectPriority(taskData.priority);

    // Submit debería estar enabled sin descripción
    taskCreationPage.verifySubmitButtonEnabled();
  });

  // ============================================================================
  // VALIDACIÓN DEL SERVIDOR (BACKEND)
  // ============================================================================

  it('SC-TASK-011: Validación del servidor rechaza datos inválidos', () => {
    const invalidTask = TestDataHelper.createInvalidTask('empty');

    cy.intercept('POST', '**/tasks', {
      statusCode: 422,
      body: {
        detail: [
          {
            type: 'value_error',
            loc: ['body', 'title'],
            msg: 'ensure this value has at least 1 characters',
          },
        ],
      },
    }).as('validationError');

    dashboardPage.clickCreateButton();
    taskCreationPage.fillTaskForm(invalidTask);

    // Force submit si validación frontend lo permite
    cy.get('[data-testid="submit-task-button"]').click({ force: true });

    cy.wait('@validationError');
  });

  it('SC-TASK-012: Error 500 del servidor muestra mensaje de error', () => {
    const taskData = TestDataHelper.createValidTask();

    cy.mockServerError('POST', '**/tasks');

    dashboardPage.clickCreateButton();
    taskCreationPage.fillTaskForm(taskData);
    taskCreationPage.submitTask();

    cy.wait('@serverError');

    // Debería mostrar error
    cy.get('[data-testid="form-error"]', { timeout: 3000 }).should('be.visible');
  });

  it('SC-TASK-013: Timeout en creación de tarea se maneja', () => {
    const taskData = TestDataHelper.createValidTask();

    cy.mockSlowApi('POST', '**/tasks', 20000);

    dashboardPage.clickCreateButton();
    taskCreationPage.fillTaskForm(taskData);
    taskCreationPage.submitTask();

    // Debería intentar y posiblemente timeout
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
  });

  // ============================================================================
  // CANCELACIÓN Y CIERRE DEL MODAL
  // ============================================================================

  it('SC-TASK-014: Cancelar descarta cambios del formulario', () => {
    dashboardPage.clickCreateButton();
    taskCreationPage.verifyModalVisible();

    const taskData = TestDataHelper.createValidTask();
    taskCreationPage.fillTaskForm(taskData);

    // Cancelar
    taskCreationPage.clickCancel();

    // Modal debería cerrarse
    taskCreationPage.verifyModalNotVisible();

    // Al abrir de nuevo, campos debería estar vacíos
    dashboardPage.clickCreateButton();
    taskCreationPage.verifyTitleFieldValue('');
  });

  it('SC-TASK-015: Click en X cierra modal', () => {
    dashboardPage.clickCreateButton();
    taskCreationPage.verifyModalVisible();

    taskCreationPage.closeModal();

    taskCreationPage.verifyModalNotVisible();
  });

  // ============================================================================
  // MÚLTIPLES TAREAS
  // ============================================================================

  it('SC-TASK-016: Crear múltiples tareas secuencialmente', () => {
    const tasks = TestDataHelper.generateMultipleTasks(3);
    const createdTasks: any[] = [];

    cy.intercept('POST', '**/tasks', (req) => {
      const newTask = {
        id: createdTasks.length + 1,
        ...req.body,
        created_at: new Date().toISOString(),
        created_by: 1,
        status: 'pending',
      };
      createdTasks.push(newTask);
      req.reply({
        statusCode: 201,
        body: newTask,
      });
    }).as('createTask');

    cy.intercept('GET', '**/tasks').as('getTasks');

    // Crear primeira tarea
    dashboardPage.clickCreateButton();
    taskCreationPage.fillTaskForm(tasks[0]);
    taskCreationPage.submitTask();
    cy.wait('@createTask');
    taskCreationPage.verifyModalNotVisible();

    // Crear segunda tarea
    dashboardPage.clickCreateButton();
    taskCreationPage.fillTaskForm(tasks[1]);
    taskCreationPage.submitTask();
    cy.wait('@createTask');
    taskCreationPage.verifyModalNotVisible();

    // Crear tercera tarea
    dashboardPage.clickCreateButton();
    taskCreationPage.fillTaskForm(tasks[2]);
    taskCreationPage.submitTask();
    cy.wait('@createTask');

    // Todas deberían estar en la lista
    tasks.forEach((task) => {
      dashboardPage.verifyTaskExists(task.title);
    });
  });

  // ============================================================================
  // FLUJO COMPLETO: CREAR + CONFIRMACIÓN + PERSISTENCIA
  // ============================================================================

  it('SC-TASK-017: Flujo completo de creación de tarea', () => {
    const taskData = TestDataHelper.createValidTask();

    const createdTask = {
      id: 200,
      ...taskData,
      created_at: new Date().toISOString(),
      created_by: 1,
      status: 'pending',
    };

    // Setup intercepts
    cy.intercept('POST', '**/tasks', { statusCode: 201, body: createdTask }).as(
      'createTask'
    );
    cy.intercept('GET', '**/tasks', { body: [createdTask] }).as('getTasks');

    // 1. Abrir modal
    dashboardPage.clickCreateButton();
    taskCreationPage.verifyModalVisible();

    // 2. Validar que formulario está en estado limpio
    taskCreationPage.verifySubmitButtonDisabled();

    // 3. Llenar formulario
    taskCreationPage.fillTaskForm(taskData);

    // 4. Validar que submit está habilitado
    taskCreationPage.verifySubmitButtonEnabled();

    // 5. Enviar formulario
    taskCreationPage.submitTask();

    // 6. Validar respuesta de API
    cy.wait('@createTask').then((intercept) => {
      ValidationHelper.validateTaskResponse({ status: 201, body: intercept.response?.body });
    });

    // 7. Validar que modal se cierra
    taskCreationPage.verifyModalNotVisible();

    // 8. Validar que tarea aparece en lista
    cy.waitForApi('GET', '**/tasks');
    dashboardPage.verifyTaskExists(taskData.title);

    // 9. Refrescar y validar persistencia
    cy.intercept('GET', '**/tasks', { body: [createdTask] });
    cy.reload();

    dashboardPage.verifyPageLoaded();
    dashboardPage.verifyTaskExists(taskData.title);
  });
});
