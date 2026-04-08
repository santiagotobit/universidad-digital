## README_FRONTEND - Universidad Digital

### 1. Objetivo

Este frontend consume el backend real de Universidad Digital (FastAPI) y aplica:

- Rutas protegidas por rol
- Autenticación real (JWT / Cookies HttpOnly)
- Formularios validados
- Accesibilidad WCAG 2.1 AA
- Seguridad y hardening OWASP Frontend

### 2. Estructura de carpetas

```
frontend/
 ├── src/
 │   ├── api/            # Cliente Axios, interceptores, endpoints
 │   ├── auth/           # Tokens en memoria
 │   ├── components/     # UI reusable
 │   ├── pages/          # Vistas por rol/caso de uso
 │   ├── layouts/        # Layouts base
 │   ├── hooks/          # Hooks personalizados
 │   ├── context/        # Estado global de auth
 │   ├── services/       # Lógica de negocio frontend
 │   ├── routes/         # Rutas públicas y protegidas
 │   ├── utils/          # Helpers y sanitización
 │   ├── styles/         # Estilos globales
 │   └── main.tsx
 └── package.json
```

### 3. Variables de entorno

Crear `frontend/.env` basado en `frontend/.env.example`:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 4. Instalación y ejecución

```
cd frontend
npm install
npm run dev
```

La app se levanta en `http://localhost:3000`.

### 5. Flujo de autenticación

1) Login en `/auth/login` devuelve JWT.
2) El token se guarda solo en **memoria** (no LocalStorage).
3) Axios usa interceptores para adjuntar `Authorization` si existe token.
4) Si el backend usa cookie HttpOnly, se envía con `withCredentials`.
5) `/auth/me` valida la sesión y retorna roles.

### 6. Seguridad aplicada (OWASP Frontend)

- Sin LocalStorage para JWT.
- Interceptores centralizados de Axios.
- Manejo de sesión expirada (401 -> logout).
- Sanitización básica de entradas (evita XSS simple).
- Errores controlados y mensajes limpios.
- Variables sensibles solo en `.env`.

### 7. Accesibilidad (WCAG 2.1 AA)

- Formularios con `label` asociado a `input`.
- Mensajes de error con `role="alert"`.
- Navegación con teclado (HTML semántico).
- Contraste base alto en botones y alertas.
- Estructura semántica con `main`, `header`, `nav`.

Limitaciones conocidas:
- Las tablas no usan paginación ni ordenamiento aún.
- El modal es básico (no gestiona foco interno).

### 8. Auditoría final (resumen)

**Calidad de código**
- SoC y SRP aplicados (api, servicios, pages, components).
- Tipado estricto TypeScript.
- Componentes reutilizables con props tipadas.

**Seguridad**
- Tokens solo en memoria.
- Interceptores con manejo de 401.
- Sin exposición de detalles internos.

**Accesibilidad**
- Inputs con labels.
- Alertas con `role="alert"`.
- Navegación visible y semántica.

**UX**
- Mensajes claros en formularios.
- Flujos por rol separados.

### 9. Rutas disponibles

Públicas:
- `/login`
- `/denied`
- `/500`

Protegidas:
- `/admin` y subsecciones
- `/teacher` y subsecciones
- `/student` y subsecciones
