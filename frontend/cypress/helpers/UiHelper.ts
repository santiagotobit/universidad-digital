/**
 * UI HELPER
 * Utilidades para interacciones con la UI
 */

export const UiHelper = {
  /**
   * Verificar que elemento está visible
   */
  isElementVisible: (selector: string) => {
    return cy.get(selector).then(($el) => {
      return $el.is(':visible');
    });
  },

  /**
   * Obtener valor de input
   */
  getInputValue: (selector: string) => {
    return cy.get(selector).then(($el) => {
      return ($el.val() as string) || '';
    });
  },

  /**
   * Obtener texto de elemento
   */
  getElementText: (selector: string) => {
    return cy.get(selector).then(($el) => {
      return $el.text();
    });
  },

  /**
   * Contar elementos
   */
  countElements: (selector: string) => {
    return cy.get(selector).then(($el) => {
      return $el.length;
    });
  },

  /**
   * Esperar a que elemento sea visible
   */
  waitForElement: (selector: string, timeout = Cypress.env('uiTimeout')) => {
    cy.get(selector, { timeout }).should('be.visible');
  },

  /**
   * Esperar a que elemento desaparezca
   */
  waitForElementToDisappear: (selector: string, timeout = 10000) => {
    cy.get(selector, { timeout }).should('not.exist');
  },

  /**
   * Scroll a elemento
   */
  scrollToElement: (selector: string) => {
    cy.get(selector).scrollIntoView().should('be.visible');
  },

  /**
   * Simular enfoque en elemento
   */
  focusElement: (selector: string) => {
    cy.get(selector).focus();
  },

  /**
   * Simular blur en elemento
   */
  blurElement: (selector: string) => {
    cy.get(selector).blur();
  },

  /**
   * Hacer hover en elemento
   */
  hoverElement: (selector: string) => {
    cy.get(selector).trigger('mouseenter');
  },

  /**
   * Hacer unhover
   */
  unhoverElement: (selector: string) => {
    cy.get(selector).trigger('mouseleave');
  },

  /**
   * Verificar atributo
   */
  verifyAttribute: (selector: string, attribute: string, expectedValue: string) => {
    cy.get(selector).should('have.attr', attribute, expectedValue);
  },

  /**
   * Verificar clase
   */
  verifyClass: (selector: string, className: string) => {
    cy.get(selector).should('have.class', className);
  },

  /**
   * Verificar que no tiene clase
   */
  verifyNotClass: (selector: string, className: string) => {
    cy.get(selector).should('not.have.class', className);
  },

  /**
   * Click en elemento dentro de lista
   */
  clickElementInList: (selector: string, itemText: string) => {
    cy.get(selector).contains(itemText).click();
  },

  /**
   * Obtener todos los textos de elementos
   */
  getAllTexts: (selector: string) => {
    return cy.get(selector).then(($elements) => {
      return $elements.map((i, el) => $(el).text()).get();
    });
  },

  /**
   * Double click
   */
  doubleClick: (selector: string) => {
    cy.get(selector).dblclick();
  },

  /**
   * Right click
   */
  rightClick: (selector: string) => {
    cy.get(selector).rightclick();
  },
};
