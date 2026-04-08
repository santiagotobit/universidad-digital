## Universidad Digital Backend - Endurecimiento

Backend preparado para producción con configuración segura por ambientes, control de acceso avanzado y protección OWASP.

### Perfiles de ambiente

- `development`: configuración flexible y orígenes locales permitidos.
- `production`: secretos obligatorios, cookies seguras y CORS restringido.

### Variables de entorno requeridas

```
APP_ENV=production
APP_DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/universidad
APP_JWT_SECRET=********
APP_JWT_EXPIRATION=60
APP_COOKIE_SECURE=true
APP_COOKIE_SAMESITE=lax
APP_CORS_ORIGINS=https://frontend-produccion.com
```

### Seguridad aplicada

- Hash seguro con bcrypt (passlib).
- JWT firmado con expiración configurable.
- Cookies HttpOnly para sesión.
- Revocación de tokens en logout.
- Manejo centralizado de errores con mensajes seguros.
- CORS controlado por ambiente.

### Flujo de autenticación

1. `POST /auth/login` recibe credenciales.
2. Se genera JWT y se guarda en cookie HttpOnly.
3. Rutas protegidas validan token y roles.
4. `POST /auth/logout` revoca token y elimina cookie.

### Control por rol y ownership

Roles base:
- Administrador: acceso total.
- Docente: acceso a recursos académicos.
- Estudiante: acceso a sus propios datos.

Ownership implementado:
- Estudiante solo lista/consulta sus inscripciones y calificaciones.
- Validación en `services` y dependencias de seguridad.

### CORS por ambiente

- Dev: `http://localhost:3000`.
- Prod: orígenes explícitos definidos en `APP_CORS_ORIGINS`.
- Métodos permitidos: `GET, POST, PUT, DELETE, OPTIONS`.
- Headers permitidos: `Authorization, Content-Type`.

### Recomendaciones de despliegue

- Usar `APP_ENV=production`.
- Definir `APP_JWT_SECRET` fuerte y rotarlo.
- Forzar HTTPS y `APP_COOKIE_SECURE=true`.
- Ejecutar migraciones con Alembic antes del despliegue.

### Próximos pasos

- Tests de autorización y ownership.
- Auditoría OWASP Top 10 periódica.
