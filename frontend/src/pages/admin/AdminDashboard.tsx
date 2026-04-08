import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { StatCard } from "../../components/StatCard";
import { Spinner } from "../../components/Spinner";
import { Alert } from "../../components/Alert";
import { getDashboardStats, type DashboardStats } from "../../services/statsService";
import { useToast } from "../../hooks/useToast";

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setShowError(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        let message = "Error al cargar estadísticas";

        if (err instanceof Error) {
          const response = (err as any).response;
          if (response?.status === 403) {
            message = "No tienes permisos para acceder a las estadísticas. Asegúrate de ser administrador.";
          } else if (response?.status === 401) {
            message = "No estás autenticado. Por favor inicia sesión primero.";
          } else {
            message = err.message;
          }
        }

        setError(message);
        addToast(message, "error");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStats();
  }, [addToast]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="loading">
          <Spinner size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout>
        <div className="page-header">
          <h1 className="page-title">📊 Panel Administrador</h1>
          <p className="page-subtitle">Resumen de la gestión académica</p>
        </div>

        {error && showError && (
          <Alert
            message={error}
            type="error"
            onClose={() => setShowError(false)}
          />
        )}
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">📊 Panel Administrador</h1>
        <p className="page-subtitle">Resumen de la gestión académica</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-4">
        <StatCard
          title="Total Usuarios"
          value={stats.total_users}
          icon="👥"
          color="primary"
        />
        <StatCard
          title="Asignaturas"
          value={stats.total_subjects}
          icon="📚"
          color="info"
        />
        <StatCard
          title="Períodos"
          value={stats.total_periods}
          icon="📅"
          color="warning"
        />
        <StatCard
          title="Períodos Activos"
          value={stats.active_periods}
          icon="✅"
          color="success"
        />
      </div>

      <div className="grid grid-3 mt-3">
        <StatCard
          title="Inscripciones"
          value={stats.total_enrollments}
          icon="✍️"
          color="primary"
        />
        <StatCard
          title="Calificaciones"
          value={stats.total_grades}
          icon="📈"
          color="success"
        />
      </div>

      {/* Quick Actions */}
      <div className="card mt-3">
        <h2 className="card-title">Acciones Rápidas</h2>
        <div className="page-actions" style={{ gap: 12 }}>
          <Link to="/admin/users" className="button">
            👥 Gestionar Usuarios
          </Link>
          <Link to="/admin/subjects" className="button button-secondary">
            📚 Gestionar Asignaturas
          </Link>
          <Link to="/admin/periods" className="button button-secondary">
            📅 Gestionar Períodos
          </Link>
          <Link to="/admin/enrollments" className="button button-secondary">
            ✍️ Gestionar Inscripciones
          </Link>
          <Link to="/admin/grades" className="button button-secondary">
            📈 Gestionar Calificaciones
          </Link>
        </div>
      </div>

      {/* Recent Users */}
      {stats.recent_users && stats.recent_users.length > 0 && (
        <div className="card mt-3">
          <h2 className="card-title">Usuarios Recientes</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_users.slice(0, 5).map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.roles.join(", ")}</td>
                    <td>
                      <Link to="/admin/users" className="button button-small">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
