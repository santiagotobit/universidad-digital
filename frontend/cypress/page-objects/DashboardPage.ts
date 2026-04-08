/**
 * PAGE OBJECT: Dashboard Page
 * Encapsula los selectores y acciones del dashboard
 */
export class DashboardPage {
  // Selectores
  readonly mainContainer = '[data-testid="dashboard"]';
  readonly userGreeting = '[data-testid="user-greeting"]';
  readonly logoutButton = 'button[data-testid="logout-button"]';
  readonly navigationMenu = '[data-testid="navigation-menu"]';
  readonly createButton = 'button[data-testid="create-button"]';
  readonly loadingSpinner = '[data-testid="loading-spinner"]';
  readonly taskList = '[data-testid="task-list"]';
  readonly emptyState = '[data-testid="empty-state"]';
  readonly tasksContainer = '[data-testid="tasks-container"]';

  // Acciones
  verifyPageLoaded() {
    cy.assertVisible(this.mainContainer);
  }

  getGreeting() {
    return cy.get(this.userGreeting);
  }

  clickLogout() {
    cy.safeClick(this.logoutButton);
    // Confirmar en el diálogo de confirmación
    cy.get('.modal-footer').contains('button', 'Cerrar sesión').click();
  }

  clickCreateButton() {
    cy.safeClick(this.createButton);
  }

  navigateTo(section: string) {
    cy.get(`${this.navigationMenu} a[href="/${section}"]`).click();
  }

  waitForContentLoad() {
    cy.get(this.loadingSpinner).should('not.exist');
    cy.get(this.mainContainer).should('be.visible');
  }

  // Validaciones
  verifyUserGreeting(userName: string) {
    cy.assertTextContent(this.userGreeting, userName);
  }

  verifyTaskListVisible() {
    cy.assertVisible(this.taskList);
  }

  verifyEmptyState() {
    cy.assertVisible(this.emptyState);
  }

  verifyNoLoadingSpinner() {
    cy.assertNotExists(this.loadingSpinner);
  }

  verifyTaskCount(expectedCount: number) {
    cy.get(`${this.tasksContainer} [data-testid="task-item"]`).should(
      'have.length',
      expectedCount
    );
  }

  verifyTaskExists(taskTitle: string) {
    cy.get(`${this.tasksContainer} [data-testid="task-item"]`)
      .should('contain', taskTitle);
  }

  getTaskByTitle(taskTitle: string) {
    return cy.get(`${this.tasksContainer}`)
      .contains('[data-testid="task-item"]', taskTitle);
  }

  verifyTaskNotExists(taskTitle: string) {
    cy.get(`${this.tasksContainer} [data-testid="task-item"]`)
      .should('not.contain', taskTitle);
  }
}
