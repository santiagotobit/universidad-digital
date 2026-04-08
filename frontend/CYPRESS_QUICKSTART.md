# Quick Start - Cypress E2E Testing Suite

Instrucciones paso a paso para ejecutar el suite de pruebas E2E.

---

## ⚡ Inicio Rápido (5 minutos)

### 1. Terminal 1 - Backend

```bash
cd backend
python -m uvicorn app.main:app --reload
# Esperado: ✓ Uvicorn running on http://127.0.0.1:8000
```

### 2. Terminal 2 - Frontend Dev Server

```bash
cd frontend
npm install  # Primera vez solamente
npm run dev
# Esperado: ✓ VITE v5.4.8 ready in 123 ms
# ✓ Local:  http://localhost:5173/
```

### 3. Terminal 3 - Cypress Tests

```bash
cd frontend

# Opción A: Modo interactivo (recomendado para desarrollo)
npm run e2e:open

# Opción B: Headless (CI/CD)
npm run e2e

# Opción C: Específico archivo
npx cypress run --spec "cypress/e2e/specs/authentication.cy.ts"
```

---

## 📋 Verificación de Instalación

### Paso 1: Validar Node.js

```powershell
node --version    # Debe ser >= 18.0.0
npm --version     # Debe ser >= 9.0.0
```

### Paso 2: Instalar Dependencias

```bash
cd frontend
npm install
```

### Paso 3: Verificar Cypress

```bash
npx cypress --version
# Output: 13.6.6
```

### Paso 4: Validar Backend

```bash
curl http://localhost:8000/docs
# Debe devolver documentación de OpenAPI
```

### Paso 5: Validar Frontend

```bash
curl http://localhost:5173
# Debe devolver HTML del SPA
```

---

## 🚀 Ejecutar Tests

### Opción 1: Modo Interactivo (Recomendado para Desarrollo)

```bash
npm run e2e:open
```

**En la ventana de Cypress:**
1. Seleccionar navegador (Chrome recomendado)
2. Clickear en spec file (ej: `authentication.cy.ts`)
3. Tests ejecutarán en tiempo real
4. Ver logs, screenshots e inspeccionar elementos

**Ventajas:**
- ✅ Debug visual
- ✅ Ejecutar tests individuales
- ✅ Ver ejecución en tiempo real
- ✅ Inspeccionar elementos

### Opción 2: Headless (Para CI/CD)

```bash
npm run e2e
```

**Output esperado:**
```
Running: authentication.cy.ts (1/5)
  Authentication Suite
    ✓ SC-AUTH-001: Login exitoso con credenciales válidas
    ✓ SC-AUTH-002: Post-login: datos de usuario cargados
    ...

5 passing (45s)
```

### Opción 3: Spec Individual

```bash
npx cypress run --spec "cypress/e2e/specs/authentication.cy.ts"
npx cypress run --spec "cypress/e2e/specs/task-creation.cy.ts"
npx cypress run --spec "**/error-handling.cy.ts"
```

### Opción 4: Por Navegador

```bash
npm run e2e:chrome      # Ejecutar en Chrome
npm run e2e:firefox     # Ejecutar en Firefox
npm run e2e:headless    # Headless sin UI
```

---

## 📊 Ver Resultados

### Videos de Ejecución

```bash
# Ver videos generados
ls cypress/videos/
```

Abre en navegador:
```
cypress/videos/authentication.cy.ts.mp4
```

### Screenshots (En Caso de Fallo)

```bash
# Ver screenshots
ls cypress/screenshots/
```

### Logs en Consola

```bash
# Los logs aparecen en el terminal donde ejecutaste cypress run
# Buscar: ✓ o ✗ al inicio de cada test
```

---

## 🔍 Debug de Tests

### Ejecutar con Debug

```bash
npx cypress run --spec "cypress/e2e/specs/authentication.cy.ts" --debug
```

### Pausar Ejecución en Test

```typescript
// En el test file:
it('SC-001: Test with pause', () => {
  cy.pause();  // Pausa aquí
  cy.visit('/page');
});
```

### Ver Inspector de Elementos

```bash
npm run e2e:open
# Clickear en Test → Click en elemento → Inspector
```

---

## 📊 Estructura de Salida

Después de ejecutar `npm run e2e`, se crean:

```
cypress/
├── screenshots/           # Screenshots si hay fallos
├── videos/               # Video de cada test
├── downloads/            # Archivos descargados en tests
└── results/              # Reportes (si se configura)
```

---

## ✅ Tests Incluidos

| Suite | Tests | Descripción |
|-------|-------|-------------|
| **authentication.cy.ts** | 16 | Login, logout, validación credenciales |
| **navigation.cy.ts** | 18 | Acceso rutas, navegación, permisos |
| **task-creation.cy.ts** | 17 | Crear tareas, validaciones, persistencia |
| **task-display.cy.ts** | 17 | Listar tareas, detalles, filtrado |
| **error-handling.cy.ts** | 17 | Errores, timeouts, reconexión |
| **TOTAL** | **85** | Suite profesional completa |

---

## 🛠️ Configuración de Variables de Entorno

### 1. Crear `.env.cypress` en frontend/

```bash
cd frontend
cat > .env.cypress << 'EOF'
VITE_API_BASE_URL=http://localhost:8000
CYPRESS_BASE_URL=http://localhost:5173
TEST_USER_EMAIL=admin@test.com
TEST_USER_PASSWORD=password123
NODE_ENV=test
EOF
```

### 2. Verificar valores en `cypress.config.ts`

```typescript
// Debería mostrar:
config.env = {
  apiBaseUrl: "http://localhost:8000",
  appBaseUrl: "http://localhost:5173",
  testUserEmail: "admin@test.com",
  testUserPassword: "password123"
}
```

---

## 🐛 Solución de Problemas Comunes

### ❌ "Cannot connect to backend"

```bash
# Verificar que backend está running
curl http://localhost:8000/docs

# Si no funciona, iniciar backend en otra terminal
cd backend
python -m uvicorn app.main:app --reload
```

### ❌ "Port 5173 already in use"

```bash
# Terminar el proceso
# En Windows:
taskkill /F /IM node.exe

# Luego:
npm run dev
```

### ❌ "Timeout waiting for request"

1. Asegurar backend está running
2. Aumentar timeout en `cypress.config.ts`:
   ```typescript
   defaultCommandTimeout: 15000,
   requestTimeout: 15000,
   ```
3. Ejecutar otra vez

### ❌ "Element not found"

```bash
# Ver logs en Cypress:
npm run e2e:open
# → Clickear en test fallido
# → Ver logs en la esquina derecha
# → Usar selector tool para inspeccionar
```

### ❌ "Screenshot failed"

```bash
# Crear carpeta si no existe
mkdir -p cypress/screenshots
mkdir -p cypress/videos
```

---

## 📈 Mejores Prácticas

### 1. Ejecutar Tests Frecuentemente

```bash
# En desarrollo
npm run e2e:open
# Dejar corriendo en modo watch

# Antes de commit
npm run e2e
```

### 2. Verificar Logs del Backend

**Terminal del backend debe mostrar:**
```
INFO:     POST /auth/login HTTP/1.1 200
INFO:     GET /tasks HTTP/1.1 200
```

### 3. Verificar Logs del Frontend

**Terminal del frontend debe mostrar:**
```
[vite] ✓ built in 234ms
[vite] HMAC invalidated by http://localhost:5173/src/pages/Dashboard.tsx
```

### 4. Mantener Datos de Testing

```bash
# El archivo .env.cypress contiene credenciales de test
# No comitear credenciales reales
# Usar variables de entorno diferentes en CI
```

---

## 🔄 Ciclo de Trabajo Típico

```bash
# 1. Terminal 1 - Backend
cd backend && python -m uvicorn app.main:app --reload

# 2. Terminal 2 - Frontend Dev
cd frontend && npm run dev

# 3. Terminal 3 - Tests (mantener abierto)
cd frontend && npm run e2e:open

# 4. Desarrollar feature
# → Modificar código en frontend/src
# → Tests se ejecutan automáticamente en Cypress

# 5. Antes de commit
npm run e2e  # Ejecutar headless

# 6. Los videos quedan en cypress/videos/
```

---

## 📝 Adicionar Nuevos Tests

### Pasos

1. **Crear spec file:**
   ```bash
   touch cypress/e2e/specs/nueva-feature.cy.ts
   ```

2. **Escribir test:**
   ```typescript
   describe('Nueva Feature Suite', () => {
     it('SC-NEW-001: Descripción', () => {
       cy.visit('/new-feature');
       // ... test code
     });
   });
   ```

3. **Ejecutar:**
   ```bash
   npm run e2e:open
   # → Seleccionar nueva-feature.cy.ts
   ```

---

## 🎯 Comandos Útiles

```bash
# Listar todos los tests disponibles
npx cypress run --dry-run

# Ejecutar con filter
npx cypress run --spec "**/auth*"

# Ejecutar solo tests que fallan
npx cypress run --only-failed

# Ejecutar con configuración custom
npx cypress run --config baseUrl=http://staging.com

# Ejecutar con env vars
npx cypress run --env testUser=admin@test.com

# Limpiar cache
npx cypress cache clear

# Ver versión
npx cypress --version
```

---

## 📞 Ayuda Rápida

### Backend no responde

```powershell
# En terminal del backend:
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend no carga

```powershell
# En terminal del frontend:
cd frontend
npm install  # Si falta algo
npm run dev  # Debe estar en puerto 5173
```

### Cypress se congela

```bash
# Terminar Cypress
Ctrl + C

# Limpiar cache
npx cypress cache clear

# Reiniciar
npm run e2e:open
```

### Ver qué endpoints se llaman

En `npm run e2e:open`:
- Ir a Network tab
- Ver peticiones GET/POST/PUT/DELETE
- Verificar que retornan status 200/201/204

---

## ✅ Checklist Final

Antes de comenzar:

- [ ] Backend running en http://localhost:8000
- [ ] Frontend running en http://localhost:5173
- [ ] Node.js >= 18.x instalado
- [ ] npm >= 9.x instalado
- [ ] `npm install` ejecutado en /frontend
- [ ] `.env.cypress` existe con credenciales correctas
- [ ] Puedo acceder a http://localhost:5173 en navegador

Si todo está ✓, ejecutar:

```bash
cd frontend
npm run e2e:open
```

¡Happy testing! 🚀

---

## 🔗 Recursos

- [Cypress Documentation](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Debugging](https://docs.cypress.io/guides/guides/debugging)
- [Network Requests](https://docs.cypress.io/guides/guides/network-requests)

