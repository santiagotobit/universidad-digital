/**
 * PAGE OBJECT: Task Creation Modal/Form
 * Encapsula los selectores y acciones para crear una tarea
 */
export class TaskCreationPage {
  // Selectores
  readonly modal = '[data-testid="task-creation-modal"]';
  readonly titleInput = 'input[name="title"]';
  readonly descriptionInput = 'textarea[name="description"]';
  readonly prioritySelect = 'select[name="priority"]';
  readonly dueDateInput = 'input[name="due_date"]';
  readonly submitButton = 'button[data-testid="submit-task-button"]';
  readonly cancelButton = 'button[data-testid="cancel-button"]';
  readonly errorMessage = '[data-testid="form-error"]';
  readonly fieldErrors = '[data-testid="field-error"]';
  readonly successMessage = '[data-testid="success-message"]';
  readonly closeButton = 'button[aria-label="Close"]';

  // Acciones
  fillTitle(title: string) {
    cy.safeType(this.titleInput, title);
  }

  fillDescription(description: string) {
    cy.safeType(this.descriptionInput, description);
  }

  selectPriority(priority: string) {
    cy.selectOption(this.prioritySelect, priority);
  }

  fillDueDate(date: string) {
    cy.safeType(this.dueDateInput, date);
  }

  fillTaskForm(taskData: {
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
  }) {
    this.fillTitle(taskData.title);
    if (taskData.description) {
      this.fillDescription(taskData.description);
    }
    if (taskData.priority) {
      this.selectPriority(taskData.priority);
    }
    if (taskData.due_date) {
      this.fillDueDate(taskData.due_date);
    }
  }

  submitTask() {
    cy.safeClick(this.submitButton);
  }

  clickCancel() {
    cy.safeClick(this.cancelButton);
  }

  closeModal() {
    cy.safeClick(this.closeButton);
  }

  // Validaciones
  verifyModalVisible() {
    cy.assertVisible(this.modal);
  }

  verifyModalNotVisible() {
    cy.assertNotExists(this.modal);
  }

  verifySubmitButtonDisabled() {
    cy.get(this.submitButton).should('be.disabled');
  }

  verifySubmitButtonEnabled() {
    cy.get(this.submitButton).should('not.be.disabled');
  }

  verifyTitleFieldValue(expectedValue: string) {
    cy.assertInputValue(this.titleInput, expectedValue);
  }

  verifyFieldError(fieldName: string, errorMessage: string) {
    cy.get(`[data-testid="error-${fieldName}"]`)
      .should('be.visible')
      .should('contain', errorMessage);
  }

  verifySuccessMessage(message: string) {
    cy.assertVisible(this.successMessage);
    cy.assertTextContent(this.successMessage, message);
  }

  verifyFormError(errorText: string) {
    cy.assertTextContent(this.errorMessage, errorText);
  }

  verifyTitleInputFocused() {
    cy.get(this.titleInput).should('have.focus');
  }
}
