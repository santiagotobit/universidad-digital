import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { AdminSidebar, StudentSidebar, TeacherSidebar } from "../components/Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

  const renderSidebar = () => {
    if (user?.roles.includes("Administrador")) {
      return <AdminSidebar />;
    }
    if (user?.roles.includes("Docente")) {
      return <TeacherSidebar />;
    }
    return <StudentSidebar />;
  };

  return (
    <div className="layout-dashboard">
      <aside className="layout-dashboard-sidebar">
        {renderSidebar()}
      </aside>
      <div className="layout-dashboard-main">
        <main className="container" data-testid="dashboard">
          {children}
        </main>
      </div>
    </div>
  );
}
