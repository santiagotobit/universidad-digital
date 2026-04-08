/**
 * PAGE OBJECT BASE
 * Clase base para todas las page objects con métodos comunes
 */
export class BasePage {
  readonly baseUrl = Cypress.env('appBaseUrl');
  readonly apiBaseUrl = Cypress.env('apiBaseUrl');

  visit(path: string) {
    cy.visitAndWait(path);
  }

  getCurrentUrl() {
    return cy.url();
  }

  waitForElement(selector: string, timeout?: number) {
    cy.get(selector, { timeout: timeout || Cypress.env('uiTimeout') }).should(
      'be.visible'
    );
  }

  expectUrlToBe(expectedUrl: string) {
    cy.url().should('include', expectedUrl);
  }

  expectUrlNotToBe(unexpectedUrl: string) {
    cy.url().should('not.include', unexpectedUrl);
  }

  verifyPageTitle(title: string) {
    cy.title().should('contain', title);
  }

  scrollToElement(selector: string) {
    cy.get(selector).scrollIntoView();
  }

  waitForLoadingToComplete() {
    cy.get('[data-testid="loading-spinner"]', { timeout: 100 }).should(
      'not.exist'
    );
  }
}
