# 🎓 Guía de Testing - Universidad Digital

## ✅ Cómo Testear la Aplicación

### 1. **Iniciar Backend**
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. **Iniciar Frontend**
```bash
cd frontend
npm install  # Si no lo has hecho
npm run dev
```

Accede a: `http://localhost:5173`

---

## 🔐 Crear Usuario Administrador (opcional)

Si aún no tienes un usuario administrador, necesitarás crearlo desde **PostgreSQL** o a través del endpoint:

### Opción A: Usando Python directamente

```python
# En backend/
python

from app.core.database import SessionLocal, init_db
from app.users.models import User
from app.core.security import hash_password
from app.roles.models import Role

init_db()
db = SessionLocal()

# Crear usuario
user = User(
    email="admin@example.com",
    full_name="Admin",
    hashed_password=hash_password("Admin@123456")
)
db.add(user)
db.commit()

# Asignar rol
admin_role = db.query(Role).filter(Role.name == "Administrador").first()
if admin_role:
    user.roles.append(admin_role)
    db.commit()

print("✅ Usuario creado exitosamente")
db.close()
```

### Opción B: Usando SQL directo en PostgreSQL

```sql
-- Primero, busca el ID del rol Administrador
SELECT id FROM roles WHERE name = 'Administrador';

-- Luego inserta el usuario (reemplaza ADMIN_ROLE_ID)
INSERT INTO users (email, full_name, hashed_password, is_active)
VALUES ('admin@example.com', 'Admin User', '$2b$12$...hash...', true);

-- Asigna el rol
INSERT INTO user_roles (user_id, role_id)
VALUES ((SELECT id FROM users WHERE email = 'admin@example.com'), ADMIN_ROLE_ID);
```

---

## 📝 Credenciales de Testing

**Email:** `admin@example.com`  
**Contraseña:** `Admin@123456`

---

## 🧪 Test de Funcionalidades

### Login
1. Abre http://localhost:5173/login
2. Ingresa credenciales de administrador
3. Deberías redirigirte al dashboard

### Dashboard Admin (Estadísticas)
1. Una vez logueado como admin
2. Accede a `/admin`
3. Deberías ver:
   - Total de usuarios
   - Total de asignaturas
   - Total de períodos
   - Períodos activos
   - Total de inscripciones
   - Total de calificaciones
   - Usuarios recientes

### Logout con confirmación
1. Haz clic en el botón "Cerrar sesión" en la navbar
2. Deberá aparecer un diálogo de confirmación
3. Elige "Cerrar sesión" para confirmar

### Notificaciones Toast
Las notificaciones aparecerán automáticamente cuando:
- Haya errores en las peticiones
- Se complete una acción exitosamente

---

## 🐛 Troubleshooting

### Error 401 Unauthorized
- **Causa:** No estás logueado
- **Solución:** Inicia sesión con credenciales válidas

### Error 403 Forbidden
- **Causa:** No eres administrador
- **Solución:** Asegúrate de que el usuario tenga el rol "Administrador"

### Error de CORS
- **Causa:** Frontend y backend en puertos diferentes
- **Solución:** Verifica que `VITE_API_BASE_URL=http://127.0.0.1:8000`

### Base de datos vacía
- **Causa:** No hay datos en la base de datos
- **Solución:** Los endpoints crearán datos automáticamente al interactuar

---

## 📱 Caracteres de Testing Recomendados

- **Email:** `usuario@ejemplo.com`
- **Contraseña mínima:** 8 caracteres
- **Nombre:** Mínimo 2 caracteres

---

## 🚀 Próximas Mejoras Recomendadas

- [ ] Validación frontend mejorada
- [ ] Paginación en tablas
- [ ] Filtros de búsqueda
- [ ] Exportar datos a Excel/PDF
- [ ] Gráficos de estadísticas
