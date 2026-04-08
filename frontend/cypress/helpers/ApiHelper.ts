/**
 * API HELPER
 * Utilidades para interactuar con la API
 */

export const ApiHelper = {
  /**
   * Realizar login via API y obtener token
   */
  login: (email: string, password: string) => {
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiBaseUrl')}/auth/login`,
      body: { email, password },
      failOnStatusCode: false,
    });
  },

  /**
   * Obtener información del usuario autenticado
   */
  getMe: () => {
    return cy.request({
      method: 'GET',
      url: `${Cypress.env('apiBaseUrl')}/auth/me`,
      failOnStatusCode: false,
    });
  },

  /**
   * Logout via API
   */
  logout: () => {
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiBaseUrl')}/auth/logout`,
      failOnStatusCode: false,
    });
  },

  /**
   * Crear una tarea via API
   */
  createTask: (taskData: any) => {
    const token = localStorage.getItem('auth_token');
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiBaseUrl')}/tasks`,
      body: taskData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      failOnStatusCode: false,
    });
  },

  /**
   * Obtener lista de tareas
   */
  getTasks: () => {
    const token = localStorage.getItem('auth_token');
    return cy.request({
      method: 'GET',
      url: `${Cypress.env('apiBaseUrl')}/tasks`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      failOnStatusCode: false,
    });
  },

  /**
   * Obtener tarea por ID
   */
  getTaskById: (taskId: number) => {
    const token = localStorage.getItem('auth_token');
    return cy.request({
      method: 'GET',
      url: `${Cypress.env('apiBaseUrl')}/tasks/${taskId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      failOnStatusCode: false,
    });
  },

  /**
   * Actualizar tarea
   */
  updateTask: (taskId: number, taskData: any) => {
    const token = localStorage.getItem('auth_token');
    return cy.request({
      method: 'PUT',
      url: `${Cypress.env('apiBaseUrl')}/tasks/${taskId}`,
      body: taskData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      failOnStatusCode: false,
    });
  },

  /**
   * Eliminar tarea
   */
  deleteTask: (taskId: number) => {
    const token = localStorage.getItem('auth_token');
    return cy.request({
      method: 'DELETE',
      url: `${Cypress.env('apiBaseUrl')}/tasks/${taskId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      failOnStatusCode: false,
    });
  },

  /**
   * Ejecutar solicitud genérica con token
   */
  request: (options: Cypress.RequestOptions) => {
    const token = localStorage.getItem('auth_token');
    const headers = options.headers || {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return cy.request({
      ...options,
      headers,
      failOnStatusCode: false,
    });
  },
};
