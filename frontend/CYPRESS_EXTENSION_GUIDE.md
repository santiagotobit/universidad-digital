# Guía de Extensión - Suite E2E Cypress

Documento para agregar nuevos tests al suite profesional de Cypress.

---

## 🎯 Checklist antes de Escribir Tests

- [ ] Feature está implementada en frontend
- [ ] Endpoints están disponibles en backend
- [ ] ¿Requiere autenticación?
- [ ] ¿Hay rol-based access control?
- [ ] ¿Qué errores pueden ocurrir?
- [ ] ¿Cuál es el flujo de datos?

---

## 📝 Plantilla de Suite Completa

```typescript
import { PageObject } from '../../page-objects/PageObject';
import { ApiHelper } from '../../helpers/ApiHelper';
import { ValidationHelper } from '../../helpers/ValidationHelper';
import { TestDataHelper } from '../../helpers/TestDataHelper';
import { UiHelper } from '../../helpers/UiHelper';

/**
 * SUITE: Feature Name
 * 
 * Validaciones:
 * - Caso de uso 1
 * - Caso de uso 2
 * - Caso de error 1
 */
describe('Feature Suite', () => {
  const pageObject = new PageObject();

  beforeEach(() => {
    // Setup común para todos los tests
    cy.setupAuthenticatedUser();
    cy.visit('/feature-route');
    pageObject.verifyPageLoaded();
  });

  // ============================================================================
  // HAPPY PATH
  // ============================================================================

  it('SC-FEATURE-001: Descripción del primer caso exitoso', () => {
    // Arrange
    const testData = TestDataHelper.createValidData();
    cy.intercept('POST', '**/endpoint', { statusCode: 201 }).as('create');

    // Act
    pageObject.fillForm(testData);
    pageObject.submitForm();

    // Assert
    cy.assertApiResponse('create', 201);
    pageObject.verifySuccessMessage();
  });

  // ============================================================================
  // ERROR CASES
  // ============================================================================

  it('SC-FEATURE-002: Error case description', () => {
    // Arrange
    cy.mockServerError('POST', '**/endpoint');

    // Act
    pageObject.submitForm();

    // Assert
    cy.get('[data-testid="error-message"]').should('be.visible');
  });
});
```

---

## 🏗️ Crear Nueva Page Object

```typescript
// cypress/page-objects/NewFeaturePage.ts

/**
 * PAGE OBJECT: New Feature
 */
export class NewFeaturePage {
  // ============================================================================
  // SELECTORES
  // ============================================================================

  readonly container = '[data-testid="new-feature"]';
  readonly input = '[data-testid="input-field"]';
  readonly submitBtn = '[data-testid="submit-button"]';
  readonly errorMsg = '[data-testid="error-message"]';

  // ============================================================================
  // ACCIONES
  // ============================================================================

  fillInput(value: string) {
    cy.safeType(this.input, value);
  }

  submitForm() {
    cy.safeClick(this.submitBtn);
  }

  // ============================================================================
  // VALIDACIONES
  // ============================================================================

  verifyPageLoaded() {
    cy.assertVisible(this.container);
  }

  verifyErrorMessage() {
    cy.assertVisible(this.errorMsg);
  }

  verifySuccessMessage() {
    cy.get('[data-testid="success-message"]').should('be.visible');
  }
}
```

---

## 🛠️ Agregar Comando Personalizado

```typescript
// cypress/support/commands.ts - Agregar:

/**
 * Comando personalizado para nueva funcionalidad
 */
Cypress.Commands.add('customCommand', (param1: string, param2: string) => {
  cy.log(`✓ Command executed with ${param1} and ${param2}`);
  // Lógica del comando
});

// Typescript types
declare global {
  namespace Cypress {
    interface Chainable {
      customCommand(param1: string, param2: string): Chainable<void>;
    }
  }
}

export {};
```

---

## 🔧 Agregar Helper Utility

```typescript
// cypress/helpers/NewHelper.ts

export const NewHelper = {
  /**
   * Utilidad número 1
   */
  utility1: (param: string) => {
    // Implementation
  },

  /**
   * Utilidad número 2
   */
  utility2: (param: any) => {
    // Implementation
  },
};
```

---

## 📊 Estructuración de Código de Prueba

### ❌ EVITAR: Tests sin estructura

```typescript
it('test', () => {
  cy.visit('/page');
  cy.get('input').type('data');
  cy.get('button').click();
  cy.get('.success').should('exist');
});
```

### ✅ HACER: Tests bien estructurados

```typescript
it('SC-FEAT-001: User can submit form successfully', () => {
  // ✅ Arrange
  const formData = TestDataHelper.createValidFormData();
  cy.intercept('POST', '**/submit').as('submitForm');

  // ✅ Act
  const formPage = new FormPage();
  formPage.fillForm(formData);
  formPage.submitForm();

  // ✅ Assert
  cy.assertApiResponse('submitForm', 200);
  formPage.verifySuccessMessage();
});
```

---

## 🔗 Integración de Nuevas URL Routes

```typescript
// Cuando hay nueva ruta, actualizar en multiple places:

// 1. cypress.config.ts - si necesita variable de env
config.env = {
  ...config.env,
  newRoute: '/new-route',
};

// 2. Page Object para la ruta
export class NewRoutePage {
  visit() {
    cy.visit('/new-route');
  }
}

// 3. Test file
describe('New Route Suite', () => {
  beforeEach(() => {
    const page = new NewRoutePage();
    page.visit();
  });
});
```

---

## 🧪 Testing Diferentes Roles de Usuario

```typescript
describe('Feature with Role-Based Access', () => {
  it('Admin can access feature', () => {
    cy.fixture('users.json').then(users => {
      cy.apiLogin(users.validUser.email, users.validUser.password);
    });

    cy.visit('/admin-feature');
    cy.get('[data-testid="admin-content"]').should('be.visible');
  });

  it('Student cannot access admin feature', () => {
    cy.fixture('users.json').then(users => {
      cy.apiLogin(users.studentUser.email, users.studentUser.password);
    });

    cy.visit('/admin-feature', { failOnStatusCode: false });
    cy.url().should('not.include', '/admin-feature');
  });
});
```

---

## 📱 Testing Responsive Design

```typescript
describe('Responsive Design', () => {
  it('Works on mobile viewport (375x667)', () => {
    cy.viewport(375, 667);
    cy.visit('/page');
    cy.get('[data-testid="mobile-menu"]').should('be.visible');
  });

  it('Works on tablet viewport (768x1024)', () => {
    cy.viewport(768, 1024);
    cy.visit('/page');
    cy.get('[data-testid="tablet-layout"]').should('be.visible');
  });

  it('Works on desktop viewport (1920x1080)', () => {
    cy.viewport(1920, 1080);
    cy.visit('/page');
    cy.get('[data-testid="desktop-layout"]').should('be.visible');
  });
});
```

---

## 🔄 Testing Con Datos Variables

```typescript
describe('Data-Driven Tests', () => {
  const testCases = [
    { priority: 'low', color: 'blue' },
    { priority: 'medium', color: 'yellow' },
    { priority: 'high', color: 'red' },
  ];

  testCases.forEach(({ priority, color }) => {
    it(`Should render ${priority} priority with ${color} color`, () => {
      cy.visit('/tasks');

      cy.get('[data-testid="task-item"]')
        .filter(`:contains("${priority}")`)
        .should('have.css', 'border-color', color);
    });
  });
});
```

---

## 🔏 Testing Autenticación Específica

```typescript
describe('Authentication Variations', () => {
  it('Different token formats are validated', () => {
    const validTokens = [
      'eyJhbGci...short.token',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.very.long.token.here',
    ];

    validTokens.forEach(token => {
      cy.window().then(win => {
        win.localStorage.setItem('auth_token', token);
      });

      cy.visit('/dashboard');
      cy.assertIsAuthenticated();
    });
  });
});
```

---

## ⏱️ Testing con Delays Intencionales

```typescript
describe('Performance Testing', () => {
  it('Page loads within acceptable time', () => {
    cy.intercept('GET', '**/large-data', (req) => {
      const start = Date.now();
      req.reply((res) => {
        res.delay(500); // 500ms delay
        const duration = Date.now() - start;
        expect(duration).to.be.lessThan(10000); // 10s max
      });
    }).as('load');

    cy.visit('/page');
    cy.wait('@load');
  });
});
```

---

## 🧩 Reutilización de Patrones

### Patrón: Modal Dialog

```typescript
// Page Object
export class ModalPage {
  readonly modal = '[data-testid="modal"]';
  readonly closeBtn = '[data-testid="close-modal"]';
  readonly cancelBtn = '[data-testid="cancel-button"]';
  readonly submitBtn = '[data-testid="submit-button"]';

  verifyModalOpen() {
    cy.assertVisible(this.modal);
  }

  closeModal() {
    cy.safeClick(this.closeBtn);
  }

  verifyModalClosed() {
    cy.assertNotExists(this.modal);
  }
}

// Test
it('Modal closes on X click', () => {
  const modalPage = new ModalPage();
  openModal(); // función helper
  modalPage.verifyModalOpen();
  modalPage.closeModal();
  modalPage.verifyModalClosed();
});
```

### Patrón: Form Validation

```typescript
describe('Form Validation Pattern', () => {
  const formPage = new FormPage();

  const validationTests = [
    { field: 'email', invalid: 'not-an-email', error: 'Invalid email' },
    { field: 'password', invalid: 'short', error: 'Too short' },
    { field: 'name', invalid: '', error: 'Required' },
  ];

  validationTests.forEach(({ field, invalid, error }) => {
    it(`Should show error for invalid ${field}`, () => {
      formPage.fillField(field, invalid);
      formPage.blurField(field);
      cy.get(`[data-testid="error-${field}"]`).should('contain', error);
    });
  });
});
```

---

## 📈 Escalado del Suite

### Estructura para Múltiples Features

```
cypress/e2e/specs/
├── auth/
│   ├── login.cy.ts
│   ├── logout.cy.ts
│   └── token-refresh.cy.ts
├── tasks/
│   ├── create.cy.ts
│   ├── update.cy.ts
│   ├── delete.cy.ts
│   └── list.cy.ts
├── users/
│   ├── profile.cy.ts
│   ├── edit.cy.ts
│   └── avatar.cy.ts
└── integration/
    ├── full-user-flow.cy.ts
    └── admin-workflows.cy.ts
```

### Ejecución Selectiva

```bash
# Solo tests de login
npx cypress run --spec "**/auth/login.cy.ts"

# Solo tests de tasks
npx cypress run --spec "cypress/e2e/specs/tasks/**"

# Excluding integration tests
npx cypress run --spec "cypress/e2e/specs/**/!(integration)/**"
```

---

## 🚨 Debugging Avanzado

```typescript
it('Complex scenario with debug', () => {
  // Pausa la ejecución
  cy.pause();

  // Log con contexto
  cy.log('Starting user setup');

  cy.setupAuthenticatedUser().then(() => {
    cy.log('User setup complete');
  });

  // Inspeccionar elemento
  cy.get('[data-testid="form"]').then(($form) => {
    console.log('Form HTML:', $form.html());
    cy.log(`Form has ${$form.find('input').length} inputs`);
  });

  // Breakpoint condicional
  cy.get('body').then($body => {
    if ($body.find('[data-testid="error"]').length > 0) {
      cy.debug(); // Pausa si hay error
    }
  });
});
```

---

## ✅ Checklist Final

Antes de hacer commit de nuevos tests:

- [ ] Todos los tests pasan localmente
- [ ] Tests siguen patrón AAA (Arrange-Act-Assert)
- [ ] Usando Page Objects para selectores
- [ ] Usando Helpers para lógica reutilizable
- [ ] Sin `cy.wait(number)` - usar intercepts
- [ ] Código TypeScript válido y comentado
- [ ] Nombramiento de tests descriptivo (SC-FEATURE-001)
- [ ] Fixtures y datos en helpers
- [ ] Manejo de errores incluido
- [ ] Validación UI + API

---

## 🔗 Casos De Uso Comunes

### Case 1: Crear Recurso y Validar Persistencia

```typescript
it('SC-RESOURCE-001: Create and persist resource', () => {
  // Create
  cy.intercept('POST', '**/resources').as('create');
  pageObject.createResource(testData);
  cy.wait('@create');

  // Validate in list
  cy.intercept('GET', '**/resources').as('list');
  cy.reload();
  cy.wait('@list');
  pageObject.verifyResourceInList(testData.name);

  // Validate detail
  cy.intercept('GET', '**/resources/1').as('detail');
  pageObject.clickResource(testData.name);
  cy.wait('@detail');
  pageObject.verifyResourceDetails(testData);
});
```

### Case 2: Validar Permisos por Rol

```typescript
it('SC-PERMISSION-001: Enforce role-based access', () => {
  cy.fixture('users.json').then(users => {
    // Try as student
    cy.apiLogin(users.studentUser.email, users.studentUser.password);
    cy.visit('/admin', { failOnStatusCode: false });
    cy.url().should('not.include', '/admin');

    // Try as admin
    cy.apiLogin(users.validUser.email, users.validUser.password);
    cy.visit('/admin');
    cy.get('[data-testid="admin-panel"]').should('be.visible');
  });
});
```

---

¡Happy testing! Recuerda mantener los tests DRY (Don't Repeat Yourself) y escalables. 🚀
