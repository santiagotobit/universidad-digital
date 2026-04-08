import { EmptyState } from "../../components/EmptyState";
import { DashboardLayout } from "../../layouts/DashboardLayout";

export function UnauthorizedDashboard() {
  return (
    <DashboardLayout>
      <EmptyState
        title="Acceso Denegado"
        description="No tienes permisos para acceder al panel de administración. Contacta con un administrador."
        icon="🔒"
      />
    </DashboardLayout>
  );
}
