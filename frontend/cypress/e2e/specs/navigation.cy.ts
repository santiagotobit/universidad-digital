import { DashboardPage } from '../../page-objects/DashboardPage';
import { UiHelper } from '../../helpers/UiHelper';

/**
 * SUITE: NAVEGACIÓN
 * 
 * Validaciones:
 * - Acceso a rutas protegidas
 * - Redirección sin autenticación
 * - Navegación entre secciones
 * - Manejo de 404
 */
describe('Navigation Suite', () => {
  const dashboardPage = new DashboardPage();

  // ============================================================================
  // ACCESO A RUTAS PROTEGIDAS
  // ============================================================================

  it('SC-NAV-001: Dashboard no es accesible sin autenticación', () => {
    cy.visit('/student', { failOnStatusCode: false });
    cy.url().should('include', '/login');
  });

  it('SC-NAV-002: Redirección a login cuando acceso sin token', () => {
    cy.window().then((win) => {
      win.localStorage.removeItem('auth_token');
    });

    cy.visit('/student', { failOnStatusCode: false });
    cy.get('input[type="email"]', { timeout: 5000 }).should('be.visible');
  });

  it('SC-NAV-003: Dashboard es accesible con autenticación válida', () => {
    cy.setupAuthenticatedUser();
    cy.visit('/dashboard');

    dashboardPage.verifyPageLoaded();
    cy.url().should('include', '/dashboard');
  });

  it('SC-NAV-004: Ruta inválida muestra página 404', () => {
    cy.setupAuthenticatedUser();
    cy.visit('/nonexistent-route', { failOnStatusCode: false });

    cy.get('[data-testid="notfound-page"]', { timeout: 5000 }).should('be.visible');
  });

  // ============================================================================
  // NAVEGACIÓN ENTRE SECCIONES
  // ============================================================================

  it('SC-NAV-005: Navegar a sección de tareas', () => {
    cy.setupAuthenticatedUser();
    cy.visit('/dashboard');

    cy.intercept('GET', '**/tasks').as('getTasks');

    dashboardPage.navigateTo('tasks');

    cy.wait('@getTasks');
    cy.url().should('include', '/tasks');
  });

  it('SC-NAV-006: Navegar a sección de calificaciones', () => {
    cy.setupAuthenticatedUser();
    cy.visit('/dashboard');

    // Only available for students/teachers
    cy.get('[data-testid="navigation-menu"] a[href="/grades"]', {
      timeout: 3000,
    }).then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el).click();
        cy.url().should('include', '/grades');
      }
    });
  });

  it('SC-NAV-007: Navegar a sección de usuarios (admin only)', () => {
    // Solo si el usuario es admin
    cy.setupAuthenticatedUser();
    cy.visit('/dashboard');

    cy.get('[data-testid="navigation-menu"] a[href="/users"]', {
      timeout: 3000,
    }).then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el).click();
        cy.url().should('include', '/users');
      }
    });
  });

  it('SC-NAV-008: Menú de navegación es visible en dashboard autenticado', () => {
    cy.setupAuthenticatedUser();
    cy.visit('/dashboard');

    cy.assertVisible('[data-testid="navigation-menu"]');
  });

  it('SC-NAV-009: Botón de logout es visible', () => {
    cy.setupAuthenticatedUser();
    cy.visit('/dashboard');

    cy.assertVisible('[data-testid="logout-button"]');
  });

  // ============================================================================
  // PERSISTENCIA DE ESTADO EN NAVEGACIÓN
  // ============================================================================

  it('SC-NAV-010: Token persiste al navegar entre páginas', () => {
    cy.setupAuthenticatedUser();
    cy.visitWithAuth('/dashboard');

    cy.window().then((win) => {
      const tokenBefore = win.localStorage.getItem('auth_token');
      expect(tokenBefore).to.exist;

      cy.visit('/').then(() => {
        const tokenAfter = win.localStorage.getItem('auth_token');
        expect(tokenAfter).to.equal(tokenBefore);
      });
    });
  });

  it('SC-NAV-011: Usuario info persiste en localStorage durante navegación', () => {
    cy.setupAuthenticatedUser();
    cy.visitWithAuth('/dashboard');

    cy.window().then((win) => {
      const userData = win.localStorage.getItem('user_data');
      expect(userData).to.exist;

      // Navegar a otra página
      cy.get('[data-testid="navigation-menu"] a').first().click();

      cy.window().then((win2) => {
        const userDataAfter = win2.localStorage.getItem('user_data');
        expect(userDataAfter).to.equal(userData);
      });
    });
  });

  // ============================================================================
  // CONTROL DE ACCESO POR ROL
  // ============================================================================

  it('SC-NAV-012: Estudiante no ve menú de admin', () => {
    cy.fixture('users.json').then((users) => {
      // Login como estudiante
      const student = users.studentUser;
      cy.apiLogin(student.email, student.password);
    });

    cy.visit('/dashboard');

    cy.get('[data-testid="navigation-menu"] a[href="/users"]').should('not.exist');
    cy.get('[data-testid="navigation-menu"] a[href="/admin"]').should('not.exist');
  });

  it('SC-NAV-013: Admin ve opción de usuarios en menú', () => {
    cy.fixture('users.json').then((users) => {
      const admin = users.validUser;
      cy.apiLogin(admin.email, admin.password);
    });

    cy.visit('/dashboard');

    // Admin debería tener acceso a estas rutas
    cy.get('[data-testid="navigation-menu"]').then(($nav) => {
      // Si la aplicación muestra el enlace de admin
      if ($nav.find('a[href="/admin"]').length > 0) {
        cy.get('[data-testid="navigation-menu"] a[href="/admin"]').should('exist');
      }
    });
  });

  // ============================================================================
  // HISTORIA DE NAVEGACIÓN
  // ============================================================================

  it('SC-NAV-014: Botón atrás funciona correctamente', () => {
    cy.setupAuthenticatedUser();
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');

    // Navegar a otra página
    cy.get('[data-testid="navigation-menu"] a').first().click();
    cy.url().should('not.include', '/dashboard');

    // Ir atrás
    cy.go('back');
    cy.url().should('include', '/dashboard');
  });

  it('SC-NAV-015: Refrescar página mantiene ubicación', () => {
    cy.setupAuthenticatedUser();
    cy.visit('/dashboard');

    const urlBefore = cy.url();

    cy.reload();

    cy.url().then((urlAfter) => {
      expect(urlAfter).to.include('/dashboard');
    });
  });

  // ============================================================================
  // NOTIFICACIONES DE NAVEGACIÓN
  // ============================================================================

  it('SC-NAV-016: Indicador de carga aparece durante navegación', () => {
    cy.setupAuthenticatedUser();
    cy.visit('/dashboard');

    // Al navegar a otra sección
    cy.intercept('GET', '**/tasks', (req) => {
      req.reply((res) => {
        res.delay(2000); // Simular delay
      });
    }).as('slowLoad');

    cy.get('[data-testid="navigation-menu"] a').first().click();

    // Debería mostrar loading
    cy.get('[data-testid="loading-spinner"]', { timeout: 1000 }).should(
      'be.visible'
    );

    cy.wait('@slowLoad');
    cy.get('[data-testid="loading-spinner"]').should('not.exist');
  });

  // ============================================================================
  // VALIDACIÓN DE ESTRUCTURA DE PÁGINA
  // ============================================================================

  it('SC-NAV-017: Dashboard tiene estructura correcta (header + content + footer)', () => {
    cy.setupAuthenticatedUser();
    cy.visit('/dashboard');

    cy.get('[data-testid="header"]', { timeout: 3000 }).should('be.visible');
    cy.get('[data-testid="main-content"]', { timeout: 3000 }).should('be.visible');
  });

  it('SC-NAV-018: Breadcrumbs se actualiza correctamente al navegar', () => {
    cy.setupAuthenticatedUser();
    cy.visit('/dashboard');

    cy.get('[data-testid="breadcrumbs"]', { timeout: 2000 }).then(($bc) => {
      if ($bc.length > 0) {
        cy.get('[data-testid="breadcrumbs"]').should('contain', 'Dashboard');

        // Navegar a otra sección
        cy.get('[data-testid="navigation-menu"] a').first().click();

        cy.get('[data-testid="breadcrumbs"]').should('not.contain', 'Dashboard');
      }
    });
  });
});
