# Frontend Testing Guide

Este proyecto utiliza un sistema completo de pruebas automatizadas para componentes React, siguiendo las mejores prácticas de la industria.

## Filosofía de Testing

- **Comportamiento observable**: Las pruebas validan lo que el usuario ve e interactúa, no el estado interno.
- **Interacciones realistas**: Usamos `user-event` para simular acciones del usuario.
- **Accesibilidad**: Todas las pruebas incluyen validación de roles, labels y navegación por teclado.
- **Patrón AAA**: Arrange-Act-Assert en cada test.

## Estructura de Pruebas

```
src/tests/
├── setup/           # Configuración global de testing
│   └── setup.ts     # Import de jest-dom
├── unit/            # Pruebas de comportamiento básico del componente aislado
├── interaction/     # Pruebas de interacciones del usuario
├── functional/      # Pruebas de cambios en la UI tras interacción
└── fixtures/        # Datos de prueba reutilizables
```

### setup/
Contiene la configuración global que se ejecuta antes de cada test suite. Aquí importamos `@testing-library/jest-dom` para matchers adicionales como `toBeInTheDocument()`.

### unit/
Pruebas que validan el render inicial, contenido visible, accesibilidad básica y props requeridas. No simulan interacciones, solo verifican el estado inicial.

### interaction/
Pruebas que simulan acciones del usuario como typing, clicking, submitting. Usan `userEvent` para interacciones realistas.

### functional/
Pruebas que verifican cambios en la interfaz tras interacciones, como habilitar/deshabilitar botones, mostrar errores, actualizar estilos.

### fixtures/
Datos de prueba compartidos, como arrays de tareas mock.

## Configuración

- **Vitest**: Framework de testing rápido con soporte nativo para ESM.
- **React Testing Library**: Para renderizar componentes y queries por roles.
- **user-event**: Para interacciones realistas del usuario.
- **jsdom**: Entorno DOM para tests.

## Mocks

### vi.fn() para callbacks
Usa `vi.fn()` para mockear callbacks como `onCreateTask`, `onToggle`, `onDelete`.

```typescript
const mockOnCreateTask = vi.fn();
render(<TaskForm onCreateTask={mockOnCreateTask} />);
```

### vi.mock() para módulos
Para mockear módulos externos como axios:

```typescript
vi.mock('axios', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));
```

### Mocks para async
Si un callback es async:

```typescript
const mockAsyncCallback = vi.fn().mockResolvedValue('success');
```

## Buenas Prácticas Aplicadas

- `screen` en lugar de `container` para queries.
- Queries por rol antes que por texto.
- `await` en todas las interacciones.
- Tests legibles con nombres descriptivos.
- Independencia entre tests (no compartir estado).
- Evitar over-testing (no probar implementación interna).

## Accesibilidad

- Roles correctos (`form`, `list`, `button`, `checkbox`).
- Labels asociados con `htmlFor` y `aria-describedby`.
- Navegación por teclado simulada con `userEvent.tab()`.
- `aria-label` en elementos interactivos.

## Casos Cubiertos

### TaskForm
- Input vacío (botón disabled).
- Texto válido (submit y limpieza).
- Texto largo (manejo de strings largos).
- Espacios en blanco (no submit).
- Múltiples submits.
- Submit por Enter.
- Navegación por teclado.

### TaskList
- Lista vacía.
- Múltiples tareas.
- Toggle completado (UI y llamadas).
- Eliminación.
- Checkboxes checked/unchecked.
- Navegación por teclado.

## Ejecutar Tests

```bash
npm test          # Modo watch
npm test -- --run # Una sola ejecución
```

## Usando IA como Copiloto

### Generar casos faltantes
**Prompt:** "Genera pruebas unitarias para el componente TaskForm en React Testing Library, enfocándote en accesibilidad y roles ARIA. Usa Vitest y user-event."

### Detectar huecos de cobertura
**Prompt:** "Analiza este componente TaskList y sugiere pruebas faltantes para edge cases como tareas con caracteres especiales, navegación por teclado completa, y manejo de errores."

### Simplificar tests largos
**Prompt:** "Refactoriza este test largo en pruebas más pequeñas y enfocadas, manteniendo el patrón AAA y usando helpers reutilizables."

### Detectar duplicación
**Prompt:** "Revisa estos archivos de test y sugiere extracción de helpers o fixtures para reducir duplicación de código."

## Cobertura de Edge Cases

- Inputs con caracteres especiales (emojis, caracteres unicode).
- Navegación por teclado completa (tab, enter, space).
- Manejo de foco y blur.
- Estados de loading (si aplica).
- Errores de red simulados.
- Validaciones complejas.

Este sistema proporciona un modelo académico equivalente a testing profesional en equipos React.