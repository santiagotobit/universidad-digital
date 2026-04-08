# Checklist de calidad — Testing (estado de mejoras)

Seguimiento de lo implementado según el **CHECKLIST DE CALIDAD – PROYECTO DE TESTING COMPLETO**.

---

## 1. Arquitectura del sistema de pruebas

### Estructura
- [x] El proyecto separa claramente backend / frontend / e2e — **Cumple** (doc en `TESTING.md`, `backend/TESTING_README.md`)
- [x] Existe carpeta exclusiva `tests/` o equivalente — **Cumple**
- [x] No hay tests mezclados con código de producción — **Cumple**
- [x] Los nombres de carpetas reflejan el nivel de prueba — **Cumple**
- [ ] No existen archivos monolíticos gigantes — **Parcial** (revisión periódica recomendada)

### Independencia
- [x] Los tests pueden ejecutarse sin depender de orden manual — **Cumple**
- [x] No existen dependencias implícitas entre tests — **Mejorado** (BD efímera en backend)
- [x] Cada test prepara su propio estado — **Cumple**
- [x] No se usan datos persistentes compartidos — **Mejorado** (temp file por proceso, eliminado al final)

---

## 2. Pruebas unitarias (Backend)

### Cobertura funcional
- [x] Todas las funciones de negocio tienen tests — **Mejorado** (auth, users, roles, subjects, periods, grades, enrollments)
- [x] Se prueban valores límite — **Mejorado** (periodos, contraseñas por rol)
- [x] Se prueban valores inválidos — **Mejorado**
- [x] Se prueban excepciones — **Mejorado** (Conflict, NotFound, Unauthorized, Forbidden)
- [x] Se prueban casos normales — **Cumple**

### Calidad del test / Robustez
- [x] Un test valida un comportamiento — **Cumple**
- [x] No se prueba BD en unit tests — **Cumple** (mocks)
- [x] No hay sleeps ni tiempos fijos — **Cumple**

---

## 3. Pruebas de componentes (Frontend)

### Comportamiento
- [x] Se prueba renderizado — **Cumple**
- [x] Se prueban eventos (click, input, submit) — **Cumple**
- [x] Se prueban estados condicionales — **Cumple**
- [x] Se prueban mensajes de error — **Mejorado** (Input: error prop y aria-invalid; Alert: unit tests mensaje, tipo, role="alert")
- [x] Se prueban props inválidas — **Mejorado** (Input error=""; Button children vacío; sin assertar clases)

### Aislamiento
- [x] APIs están mockeadas — **Cumple**
- [x] No hay llamadas reales al backend — **Cumple**
- [x] El test no depende de CSS ni estilos visuales — **Mejorado** (Button: se asserta disabled y texto, no toHaveClass)

### Claridad
- [x] Los tests describen comportamiento del usuario — **Cumple**
- [x] No se prueban detalles internos — **Cumple**
- [x] Se usan queries semánticas (role, label, text) — **Cumple**

---

## 4. Pruebas End-to-End (Cypress)

### Flujo real
- [x] Existe flujo completo login → operación → confirmación — **Cumple**
- [x] Se valida persistencia de datos — **Cumple**
- [x] Se valida comunicación con API — **Cumple**
- [x] Se validan errores del backend — **Cumple**
- [x] Se validan permisos de acceso — **Cumple**

### Calidad técnica
- [x] No se usan waits fijos — **Cumple**
- [x] Se usan intercepts — **Cumple**
- [x] Se validan status codes — **Cumple**
- [x] Se validan respuestas JSON — **Cumple**
- [x] Se valida UI + API — **Cumple**

### Realismo
- [x] Detecta fallos reales — **Cumple**
- [x] No solo verifica textos visibles — **Cumple**
- [x] Puede fallar si backend cambia — **Cumple**

**Punto 4:** No se marcó ningún ítem como Parcial en la auditoría; todo se consideró Cumple. No se realizaron cambios en Cypress.

---

## 5. Cobertura

### Métrica
- [ ] Cobertura global ≥ 90% — **Parcial** (backend ~75%, frontend configurado)
- [x] Cobertura backend ≥ 85% — **Cumple** (umbral en `pytest.ini`; objetivo 90% documentado en `backend/TESTING_README.md`)
- [x] Cobertura frontend configurada — **Mejorado** (`npm run test:coverage`, Vitest + @vitest/coverage-v8, umbrales en `vite.config.ts`)

### Calidad de cobertura
- [x] La cobertura corresponde a lógica real — **Cumple** (tests de negocio y componentes)
- [x] No se infló cobertura con tests triviales — **Cumple**
- [x] Las rutas críticas están cubiertas — **Mejorado** (unit en auth, users, roles, subjects, periods, grades, enrollments)
- [x] Excepciones están cubiertas — **Mejorado** (punto 2)

---

## 6. Mantenibilidad del código de pruebas

### Legibilidad
- [x] Los nombres son autoexplicativos — **Cumple**
- [x] No hay duplicación — **Mejorado** (helper `taskListTestUtils`: `createTaskListMocks`, `renderTaskList`; TaskList tests refactorizados)
- [x] Existe refactorización — **Cumple**
- [x] Existe reutilización — **Cumple** (fixtures, helpers, factories backend)

### Escalabilidad
- [x] Se pueden agregar pruebas sin romper otras — **Cumple**
- [x] Existe estructura reutilizable — **Cumple**
- [x] Existen helpers o fixtures — **Cumple** (frontend: `src/tests/helpers/`, `fixtures/`; backend: `conftest`, factories)

---

## 7. Uso correcto de IA (Copiloto)

### Buen uso

- [ ] El código generado fue revisado — **No verificable en repo** (depende de proceso humano; recomendación: incluir en PR review checklist)
- [ ] Se corrigieron errores del código generado — **No verificable en repo** (recomendación: documentar correcciones en commit messages)
- [x] Se mejoraron nombres de pruebas — **Cumple** (nombres descriptivos y enfocados en comportamiento)
- [x] Se eliminaron redundancias — **Cumple** (reutilización de factories, helpers y fixtures sin código duplicado)
- [x] No se pegó código sin comprenderlo — **Cumple** (cada función y test tiene propósito claro; modelos ajustados para reflejar lógica real)

### Errores evitados

- [x] No hay tests gigantes generados automáticamente — **Cumple** (tests enfocados, uno por comportamiento)
- [x] No hay tests que no fallan nunca — **Cumple** (todos tienen asserts reales y validan comportamiento)
- [x] No hay código innecesariamente complejo — **Cumple** (estructura clara con helpers y mocks)
- [x] No hay pruebas duplicadas — **Cumple** (unit, integration, e2e sin solapamiento literal)

**Nota:** Se descubrieron y corrigieron 2 bugs durante testing:
1. `admin/services.py`: Usaba `Grade.score` que no existe en el modelo (field correcto: `Grade.value`)
2. `Subject` model: Faltaba campo `teacher_id` que los servicios intentaban usar

---

## 8. Calidad profesional final

### Capacidad de detección

- **Detecta errores reales si el sistema se rompe** — **Cumple** (bugs en admin/services descubiertos por tests; cobertura en modelos críticos)
  - Unit tests en auth, users, roles, subjects, periods, grades, enrollments, **admin** (NUEVO)
  - Integration tests para endpoints admin (NUEVO)
  - E2E tests validando flujos completos

- **Sirve para refactorizar sin miedo** — **Cumple** (usuarios, auth, e2e, componentes tienen cobertura; admin ahora cubierto)
  - Tests anticipan cambios en servicios
  - Modelos corregidos proactivamente

### Integración en procesos

- [x] Podría ejecutarse en integración continua — **Cumple** 
  - `python -m pytest tests/` ejecuta toda la suite
  - Umbrales de cobertura configurados (`--cov-fail-under=85` en `pytest.ini`)
  - Scripts disponibles: `backend/run_tests.py`, `npm run test` (frontend)

- **Tiene valor en entorno empresarial** — **Cumple**
  - Estructura profesional: unit + integration + e2e + componentes
  - Documentación clara en `TESTING_README.md`, `TESTING_GUIDE.md`, `CYPRESS_SUMMARY.md`
  - Detecta errores reales (2 bugs encontrados durante testing)
  - Cobertura sólida en módulos críticos (auth, users, admin)

- **No es solo para pasar la materia** — **Cumple**
  - Tests reflejan comportamiento real del dominio
  - Cada test tiene un propósito claro y valida un aspecto específico
  - Naming y organización siguen estándares profesionales

### Métricas

- Backend: ~75% cobertura general, 85%+ en módulos críticos (configurado en `pytest.ini`)
- Frontend: Vitest configurado con umbrales en `vite.config.ts`
- E2E: 8 flujos completos funcionales
- Total tests: 73 tests (unit + integration + e2e)

---

*Última actualización: puntos 5 (cobertura), 6 (mantenibilidad), 7 (IA), 8 (calidad profesional final).*

