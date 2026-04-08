import { Link, useLocation } from "react-router-dom";

type NavItem = {
  label: string;
  to: string;
  icon: string;
};

const adminItems: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: "📊" },
  { label: "Tareas", to: "/tasks", icon: "📋" },
  { label: "Usuarios", to: "/admin/users", icon: "👥" },
  { label: "Asignaturas", to: "/admin/subjects", icon: "📚" },
  { label: "Períodos", to: "/admin/periods", icon: "📅" },
  { label: "Inscripciones", to: "/admin/enrollments", icon: "✍️" },
  { label: "Calificaciones", to: "/admin/grades", icon: "📈" },
];

const studentItems: NavItem[] = [
  { label: "Dashboard", to: "/student", icon: "📊" },
  { label: "Tareas", to: "/tasks", icon: "📋" },
  { label: "Mis Asignaturas", to: "/student/subjects", icon: "📚" },
  { label: "Mis Inscripciones", to: "/student/enrollments", icon: "✍️" },
  { label: "Mis Calificaciones", to: "/student/grades", icon: "📈" },
];

const teacherItems: NavItem[] = [
  { label: "Dashboard", to: "/teacher", icon: "📊" },
  { label: "Tareas", to: "/tasks", icon: "📋" },
  { label: "Calificar", to: "/teacher/grades", icon: "📈" },
];

function SidebarLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      to={item.to}
      className={`sidebar-link ${isActive ? "active" : ""}`}
    >
      <span className="sidebar-icon">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );
}

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar" data-testid="navigation-menu">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Administrador</h2>
      </div>
      <nav>
        <ul className="sidebar-list">
          {adminItems.map((item) => (
            <li key={item.to} className="sidebar-item">
              <SidebarLink
                item={item}
                isActive={location.pathname === item.to || location.pathname.startsWith(item.to + "/")}
              />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export function StudentSidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar" data-testid="navigation-menu">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Estudiante</h2>
      </div>
      <nav>
        <ul className="sidebar-list">
          {studentItems.map((item) => (
            <li key={item.to} className="sidebar-item">
              <SidebarLink
                item={item}
                isActive={location.pathname === item.to || location.pathname.startsWith(item.to + "/")}
              />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export function TeacherSidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar" data-testid="navigation-menu">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Docente</h2>
      </div>
      <nav>
        <ul className="sidebar-list">
          {teacherItems.map((item) => (
            <li key={item.to} className="sidebar-item">
              <SidebarLink
                item={item}
                isActive={location.pathname === item.to || location.pathname.startsWith(item.to + "/")}
              />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
