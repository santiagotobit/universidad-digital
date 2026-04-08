/**
 * PAGE OBJECT: Login Page
 * Encapsula los selectores y acciones de la página de login
 */
export class LoginPage {
  // Selectores
  readonly emailInput = 'input[type="email"]';
  readonly passwordInput = 'input[type="password"]';
  readonly submitButton = 'button[type="submit"]';
  readonly errorMessage = '[data-testid="error-message"]';
  readonly loginForm = '[data-testid="login-form"]';
  readonly rememberMeCheckbox = 'input[type="checkbox"]';
  readonly forgotPasswordLink = 'a[href="/forgot-password"]';

  // Acciones
  fillEmail(email: string) {
    cy.safeType(this.emailInput, email);
  }

  fillPassword(password: string) {
    cy.safeType(this.passwordInput, password);
  }

  fillCredentials(email: string, password: string) {
    this.fillEmail(email);
    this.fillPassword(password);
  }

  submitLogin() {
    cy.safeClick(this.submitButton);
  }

  login(email: string, password: string) {
    this.fillCredentials(email, password);
    this.submitLogin();
  }

  toggleRememberMe() {
    cy.safeClick(this.rememberMeCheckbox);
  }

  clickForgotPassword() {
    cy.safeClick(this.forgotPasswordLink);
  }

  // Validaciones
  verifyPageLoaded() {
    cy.assertVisible(this.loginForm);
  }

  verifyErrorMessage(expectedError: string) {
    cy.assertTextContent(this.errorMessage, expectedError);
  }

  verifyErrorMessageNotVisible() {
    cy.assertNotExists(this.errorMessage);
  }

  verifyInputError(fieldSelector: string, expectedError: string) {
    cy.get(`${fieldSelector} + [data-testid="field-error"]`)
      .should('be.visible')
      .should('contain', expectedError);
  }

  verifySubmitButtonState(disabled: boolean) {
    if (disabled) {
      cy.get(this.submitButton).should('be.disabled');
    } else {
      cy.get(this.submitButton).should('not.be.disabled');
    }
  }

  verifyEmailInputState(disabled: boolean) {
    if (disabled) {
      cy.get(this.emailInput).should('be.disabled');
    } else {
      cy.get(this.emailInput).should('not.be.disabled');
    }
  }
}
