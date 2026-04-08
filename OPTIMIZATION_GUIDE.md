# 📊 Dashboard Optimization - Developer Documentation

## Overview
En esta iteración hemos completado la optimización del sistema con dashboards personalizados para cada rol de usuario (Admin, Estudiante, Docente).

---

## 🆕 Features Implementadas

### 1. **Hook `useAsync` Reutilizable**
Ubicación: `frontend/src/hooks/useAsync.ts`

Un hook personalizado que maneja estados asincronos (loading, error, data) de manera consistente.

```tsx
const { data, isLoading, error, execute, retry } = useAsync<T>(asyncFunction, options);
```

**Características:**
- Auto-reintento con `retry()` method
- Callbacks opcionales: `onError` y `onSuccess`
- Estado completo incluye: data, isLoading, error

---

### 2. **StudentDashboard Mejorado**
Ubicación: `frontend/src/pages/student/StudentDashboard.tsx`

**Estadísticas mostradas:**
- 📚 Inscripciones Activas
- 📖 Asignaturas Actuales
- 📝 Calificaciones Registradas
- 🎯 Promedio General

**Características:**
- Indicador de trend (↑ positivo, ↓ negativo)
- Información académica personalized
- Recomendaciones basadas en desempeño
- Manejo de errores y loading states

**Lógica de recomendaciones:**
```
- Promedio >= 4.5: "¡Excelente desempeño!"
- Promedio >= 3.5: "Buen trabajo"
- Promedio < 3.5: "Buscar apoyo académico"
```

---

### 3. **TeacherDashboard Completo**
Ubicación: `frontend/src/pages/teacher/TeacherDashboard.tsx`

**Estadísticas mostradas:**
- 👥 Total de Estudiantes
- 📚 Asignaturas a Cargo
- ⚠️ Calificaciones Pendientes

**Características:**
- Indicador de urgencia para calificaciones pendientes (rojo/verde)
- Sistema de alertas visibles
- Acciones rápidas sugeridas
- Estadísticas en tiempo real

---

### 4. **Backend API Endpoints Nuevos**

#### `GET /admin/student/stats`
Retorna estadísticas del estudiante autenticado.
```json
{
  "total_enrollments": 3,
  "total_grades": 12,
  "average_grade": 4.2,
  "current_subjects": 2
}
```

#### `GET /admin/teacher/stats`
Retorna estadísticas del docente autenticado.
```json
{
  "total_students": 34,
  "total_subjects": 2,
  "pending_grades": 5
}
```

**Validaciones de rol:**
- `/admin/student/stats` → Solo usuarios con rol "Estudiante"
- `/admin/teacher/stats` → Solo usuarios con rol "Docente"

---

### 5. **Frontend Service Functions**
Ubicación: `frontend/src/services/statsService.ts`

```tsx
export async function getStudentStats(): Promise<StudentStats>
export async function getTeacherStats(): Promise<TeacherStats>
```

Ambas utilizan error handling consistente con la utilidad `getErrorMessage()` del proyecto.

---

### 6. **Mejoras de Componentes**

#### StatCard Component Mejorado
- Acepta tanto `string` como `ReactNode` para icons
- Prop `trend` ahora es `"positive" | "negative"`
- Icon es opcional y reactive

#### Alert Component Extendido
- Añadido soporte para `title`
- Props ahora: `type`, `message`, `title`, `onClose`
- Renderizado condicional de title y message

---

## 📁 Estructura de Archivos

```
frontend/src/
├── hooks/
│   ├── useToast.ts
│   ├── useAuth.ts
│   └── useAsync.ts ✨ NUEVO
├── pages/
│   ├── admin/
│   │   └── AdminDashboard.tsx
│   ├── student/
│   │   └── StudentDashboard.tsx ✨ MEJORADO
│   └── teacher/
│       └── TeacherDashboard.tsx ✨ MEJORADO
├── services/
│   └── statsService.ts ✨ EXTENDIDO
└── styles/
    ├── stats.css
    ├── global.css
    └── components.css

backend/app/
└── admin/
    ├── routes.py ✨ 2 ENDPOINTS NUEVOS
    ├── schemas.py ✨ 2 SCHEMAS NUEVOS
    └── services.py ✨ 2 FUNCTIONS NUEVAS
```

---

## 🔧 Configuración Necesaria

### Variables de Entorno (.env)
```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### TypeScript Type Definitions
Archivo creado: `frontend/src/vite-env.d.ts`
- Define tipos para `import.meta.env`
- Incluye `VITE_API_BASE_URL`

---

## 🚀 Uso de los Dashboards

### 1. **Para Estudiantes**
```
1. Login como Estudiante
2. Redirección automática a /student
3. Ver: inscripciones, asignaturas, promedio
4. Recibir recomendaciones personalizadas
```

### 2. **Para Docentes**
```
1. Login como Docente
2. Redirección automática a /teacher
3. Ver: estudiantes a cargo, asignaturas, pendientes
4. Priorizar calificaciones pendientes
```

### 3. **Para Administradores**
```
1. Login como Administrador
2. Redirección automática a /admin
3. Ver: estadísticas del sistema completo
4. Gestionar usuarios, asignaturas, períodos
```

---

## 📊 Flujo de Datos

### Frontend → Backend
```
useAsync() → execute()
         ↓
    statsService.ts
         ↓
    axios.get("/admin/student/stats")
         ↓
    HTTP Request con JWT en headers
```

### Backend → Frontend
```
FastAPI endpoint (/admin/student/stats)
         ↓
    verify_role_name() → check role
         ↓
    get_student_stats(db, user_id)
         ↓
    SQLAlchemy queries
         ↓
    Response: StudentStatsResponse (Pydantic)
```

---

## 🔒 Security Notes

### Role-Based Access Control (RBAC)
```python
# Backend validation
role_names = [role.name for role in user.roles]
if "Estudiante" not in role_names:
    raise HTTPException(status_code=403)
```

### JWT Authentication
- HttpOnly cookies para seguridad
- Auto-refresh via refresh token
- Validación en cada request

---

## ✅ Testing

### Frontend Build
```bash
cd frontend
npm run build
```

### Backend Tests
```bash
cd backend
python -m pytest
```

### Manual Testing
```
1. Login con diferentes roles
2. Verificar redirección correcta
3. Confirmar datos se cargan
4. Probar error states
```

---

## 📝 Próximos Pasos (Opcionales)

- [ ] Añadir gráficos con chart library (Recharts/Chart.js)
- [ ] Implementar filtros por período/asignatura
- [ ] Agregar export PDF de estadísticas
- [ ] Notificaciones en tiempo real
- [ ] Metrics tracking/analytics
- [ ] Caché local con IndexedDB

---

## 🐛 Troubleshooting

### Error: "403 Forbidden"
- Verificar que el usuario tiene el rol correcto
- Revisar JWT en cookies
- Confirmar role_names match en backend

### Error: "Module not found"
- Verificar paths relativos en imports
- Confirmar archivos existen
- Limpiar node_modules: `rm -r node_modules && npm install`

### CSS Warnings
- Normales durante build
- No afectan funcionamiento
- Pueden ignorarse si no causan visual bugs

---

## 📚 Referencias

- [Vite Documentation](https://vitejs.dev)
- [React Hooks](https://react.dev/reference/react)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

