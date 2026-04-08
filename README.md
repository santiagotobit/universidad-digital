## Universidad Digital

API y frontend para gestión académica universitaria con FastAPI y React (Vite).

### Estructura del repositorio

- **`backend/`** — API FastAPI, SQLAlchemy, PostgreSQL en producción.
- **`frontend/`** — SPA React; las peticiones HTTP usan Axios con `baseURL` configurable.

---

## Variables de entorno del frontend

En Vite, **solo las variables cuyo nombre empieza por `VITE_` se exponen al código del navegador**. El resto no están disponibles en `import.meta.env`.

### `VITE_API_BASE_URL` (la importante)

Define la **URL base del backend** donde Axios enviará las peticiones (login, usuarios, etc.).

| Entorno | Valor típico | Comportamiento |
|--------|----------------|----------------|
| **Desarrollo local** (sin definir) | *(vacío)* | En código se usa el valor por defecto `"/api"`. El servidor de Vite (`npm run dev`, puerto definido en `vite.config.ts`, p. ej. 3000) hace **proxy** de `/api` hacia `http://localhost:8000`, así el navegador sigue siendo same-origin y las cookies funcionan bien. |
| **Producción** | URL absoluta del API | Ejemplo: `https://universidad-api.onrender.com` — **sin barra final**. Debe coincidir con el servicio donde corre FastAPI. |

**Detalles importantes:**

1. **Se inyecta en tiempo de build**, no en runtime. Si cambias `VITE_API_BASE_URL` en Vercel o Render, hace falta **volver a desplegar** (nuevo build) para que el bundle lleve el valor nuevo.
2. El cliente usa rutas relativas al host del API (por ejemplo `/auth/login`). Por eso la base debe ser el **origen del API** (esquema + host + puerto si aplica), no una ruta tipo `/api` en el servidor del front, salvo que tu API esté realmente montada bajo ese prefijo (este proyecto no usa prefijo `/api` en FastAPI).
3. **HTTPS**: en producción usa siempre `https://...` para el API.

Ejemplo en **Vercel** (Settings → Environment Variables):

- Name: `VITE_API_BASE_URL`
- Value: `https://tu-servicio-api.onrender.com`

Ejemplo en **Render** (sitio estático o build del front):

- Key: `VITE_API_BASE_URL`
- Value: la URL pública del Web Service del backend.

### Archivo local opcional: `frontend/.env`

Puedes crear `frontend/.env` (no subir secretos reales al repo; añádelo a `.gitignore` si contiene datos sensibles):

```env
# Solo para desarrollo local; Vite carga VITE_* automáticamente
VITE_API_BASE_URL=http://localhost:8000
```

Si lo dejas sin definir, en local suele bastar el proxy `/api` → `8000`.

---

## Variables de entorno del backend

El backend lee variables con prefijo **`APP_`** (y algunos alias sin prefijo donde se indica). También puede cargar un fichero **`.env`** en el directorio desde el que arranca el proceso (en Docker suele ser el `WORKDIR` del contenedor, p. ej. `/app`).

| Variable | Obligatoria en producción | Descripción |
|----------|---------------------------|-------------|
| `APP_ENV` | Recomendada: `production` | Si es `production`, se exigen JWT y CORS, y las cookies van con opciones más restrictivas. |
| `APP_DATABASE_URL` o `DATABASE_URL` | Sí | Cadena SQLAlchemy a PostgreSQL. El código acepta URLs tipo `postgres://` / `postgresql://` (p. ej. Render) y las normaliza a `postgresql+psycopg://`. |
| `APP_JWT_SECRET` | Sí | Secreto para firmar tokens JWT. Debe ser largo y aleatorio; guárdalo solo en el servidor. |
| `APP_CORS_ORIGINS` | Sí | Orígenes permitidos para el navegador, separados por comas. Debe incluir **exactamente** el origen del frontend (incluido `https://` y sin path). Ejemplo: `https://tu-app.vercel.app,https://www.tudominio.com` |
| `APP_JWT_EXPIRATION` | No | Minutos de vida del token (por defecto 60). |
| `APP_COOKIE_SECURE` | No | En producción el código fuerza cookies seguras cuando `APP_ENV=production`. |
| `APP_COOKIE_SAMESITE` | No | Valores típicos: `lax`, `strict`, `none`. Si front y API están en **dominios distintos** y usas cookies entre sitios, puede hacer falta `none` y **HTTPS** en ambos. |

**Producción (`APP_ENV=production`):** si falta `APP_JWT_SECRET` o `APP_CORS_ORIGINS`, la aplicación **no arranca** (comportamiento definido en `backend/app/main.py`).

---

## Cómo encajan front y back (CORS y cookies)

1. El navegador solo envía peticiones “con credenciales” (cookies) a orígenes que el **API** autoriza en **CORS**. Por eso `APP_CORS_ORIGINS` debe listar el origen del front (por ejemplo `https://mi-app.vercel.app`).
2. El front llama al API en `VITE_API_BASE_URL`. Ese host debe ser el mismo que configuraste en CORS como origen permitido **del lado del cliente** no: CORS es “qué origen del *navegador* puede hablar con el API”; el valor es la URL del **sitio web del usuario**, no la del API.
3. Si despliegas el front en un dominio y el API en otro, revisa en el navegador (pestaña Red / consola) errores de CORS o de cookies; a veces hace falta ajustar `APP_COOKIE_SAMESITE` y usar siempre HTTPS.

Orden práctico recomendado:

1. Desplegar el **backend** y anotar su URL pública (`https://...`).
2. Configurar **`APP_CORS_ORIGINS`** con la URL del front (cuando ya la tengas).
3. Desplegar el **frontend** con **`VITE_API_BASE_URL`** apuntando a la URL del paso 1.
4. Si cambias dominio del front, actualiza CORS en el back y redeploy del back; si cambias URL del API, actualiza `VITE_API_BASE_URL` y redeploy del front.

---

## Desplegar el backend (Render con Docker)

Este repo incluye `backend/Dockerfile`. El comando usa el puerto `PORT` que inyecta Render.

### Opción A — Blueprint (`render.yaml`)

1. En [Render](https://render.com): **New** → **Blueprint**.
2. Conecta el repositorio y selecciona el archivo `render.yaml`.
3. Tras el primer despliegue, en el servicio **Web** del API revisa variables:
   - `APP_DATABASE_URL` suele enlazarse a la base de datos creada por el blueprint.
   - `APP_JWT_SECRET`: el blueprint puede generar una; puedes sustituirla por un secreto propio.
   - `APP_CORS_ORIGINS`: edítala y pon los orígenes del front (se creó como `sync: false` para que la rellenes en el panel).
4. Anota la URL pública del servicio (algo como `https://universidad-api.onrender.com`).

### Opción B — Web Service manual

1. **New** → **Web Service** → conecta el repo.
2. **Runtime**: Docker.
3. **Dockerfile path**: `backend/Dockerfile` — **Root directory** / contexto: `backend` si Render lo pide como directorio del Dockerfile.
4. Añade una base **PostgreSQL** y copia la **Internal Database URL** o usa la variable de entorno que Render asigne.
5. Variables de entorno mínimas:
   - `APP_ENV` = `production`
   - `APP_DATABASE_URL` = *(cadena de conexión de Postgres; con prefijo `APP_` o `DATABASE_URL` según cómo la pegues)*
   - `APP_JWT_SECRET` = *(secreto largo)*
   - `APP_CORS_ORIGINS` = *(URLs del front, separadas por comas)*

Comprueba que el servicio responde en `/docs` (documentación OpenAPI de FastAPI).

---

## Desplegar el frontend

### Vercel

1. Importa el repo en [Vercel](https://vercel.com).
2. **Root Directory**: `frontend`.
3. Build: por defecto `npm run build`; salida: `dist` (coherente con `frontend/vercel.json` si lo usas).
4. Añade **`VITE_API_BASE_URL`** = URL HTTPS del backend (sin `/` al final).
5. Despliega. Cada push a la rama de producción genera un nuevo build.

### Render (sitio estático)

1. **New** → **Static Site** o usa el bloque del `render.yaml` llamado `universidad-web`.
2. **Build command**: `cd frontend && npm ci && npm run build`.
3. **Publish directory**: `frontend/dist`.
4. Variable de entorno de build: **`VITE_API_BASE_URL`** = URL del API.
5. Tras obtener la URL del sitio (p. ej. `https://universidad-web.onrender.com`), **vuelve al servicio del backend** y añade ese origen en **`APP_CORS_ORIGINS`** (y redeploy del API si hace falta).

---

## Desarrollo local rápido

**Backend** (desde `backend/`):

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
# Configura APP_DATABASE_URL o DATABASE_URL a tu PostgreSQL local
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend** (desde `frontend/`):

```bash
npm install
npm run dev
```

Con el proxy por defecto, el front en desarrollo usa `/api` y llega al backend en el puerto configurado en `vite.config.ts`.

**Docker Compose** (raíz del repo): levanta Postgres, API y nginx con el front; revisa `docker-compose.yml` para puertos y `VITE_API_BASE_URL` del build del contenedor del front.

---

### Backend — estructura por dominio (SRP)

```
backend/app/
├── core/
├── users/
├── roles/
├── subjects/
├── periods/
├── enrollments/
└── grades/
```

Cada dominio incluye `models.py`, `schemas.py`, `services.py` y `routes.py`.

### Endpoints principales

```
GET/POST    /users
GET/PUT     /users/{id}
DELETE      /users/{id}

GET/POST    /roles
GET/PUT     /roles/{id}
DELETE      /roles/{id}

GET/POST    /subjects
GET/PUT     /subjects/{id}
DELETE      /subjects/{id}

GET/POST    /periods
GET/PUT     /periods/{id}
DELETE      /periods/{id}

GET/POST    /enrollments
GET/PUT     /enrollments/{id}
DELETE      /enrollments/{id}

GET/POST    /grades
GET/PUT     /grades/{id}
DELETE      /grades/{id}
```

### Requisitos

- Backend: dependencias en `backend/requirements.txt`.
- Frontend: Node 20 recomendado; dependencias en `frontend/package.json`.
