import { useEffect } from "react";
import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../hooks/useToast";
import { getTeacherStats, type TeacherStats } from "../../services/statsService";
import { StatCard } from "../../components/StatCard";
import { Spinner } from "../../components/Spinner";
import { Alert } from "../../components/Alert";
import { Table } from "../../components/Table";
import { Users, BookOpen, AlertCircle } from "lucide-react";
import "../../styles/stats.css";

export function TeacherDashboard() {
  const { addToast } = useToast();
  const { data: stats, isLoading, error, execute } = useAsync<TeacherStats>(
    () => getTeacherStats(),
    {
      onError: (error) => addToast(error, "error"),
    }
  );

  useEffect(() => {
    execute();
  }, []);

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <Alert
        type="error"
        title="Error"
        message={error}
        onClose={() => execute()}
      />
    );
  }

  if (!stats) {
    return (
      <Alert
        type="info"
        title="Sin datos"
        message="No se encontraron estatísticas disponibles"
      />
    );
  }

  return (
    <div className="dashboard-container" data-testid="dashboard">
      <div className="dashboard-header">
        <h1>Mi Panel de Docente</h1>
        <p>Aquí puedes ver tu carga académica y calificaciones pendientes</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Estudiantes"
          value={stats.total_students}
          icon={<Users size={24} />}
          color="primary"
        />
        <StatCard
          title="Asignaturas"
          value={stats.total_subjects}
          icon={<BookOpen size={24} />}
          color="success"
        />
        <StatCard
          title="Calificaciones Pendientes"
          value={stats.pending_grades}
          icon={<AlertCircle size={24} />}
          color={stats.pending_grades > 0 ? "warning" : "success"}
          trend={stats.pending_grades > 0 ? "negative" : "positive"}
        />
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h3>👥 Resumen Docente</h3>
          <p>
            Estás enseñando a {stats.total_students} estudiante
            {stats.total_students !== 1 ? "s" : ""} en{" "}
            {stats.total_subjects} asignatura
            {stats.total_subjects !== 1 ? "s" : ""}.
          </p>
          <p>
            {stats.pending_grades > 0 ? (
              <>
                Tienes <strong>{stats.pending_grades}</strong> calificación
                {stats.pending_grades !== 1 ? "es" : ""} pendiente
                {stats.pending_grades !== 1 ? "s" : ""} por registrar.
              </>
            ) : (
              <>¡Todas las calificaciones han sido registradas!</>
            )}
          </p>
        </div>

        <div className="info-card">
          <h3>⚡ Acciones Rápidas</h3>
          {stats.pending_grades > 0 ? (
            <p style={{ color: "#e74c3c", fontWeight: "500" }}>
              ⚠️ Tienes calificaciones pendientes. La regularidad en las
              calificaciones es importante para los estudiantes.
            </p>
          ) : (
            <p style={{ color: "#27ae60", fontWeight: "500" }}>
              ✓ Todas las calificaciones están al día.
            </p>
          )}

          <ul style={{ marginTop: "1rem", fontSize: "0.95rem", color: "#666" }}>
            <li>✓ Revisa las inscripciones regularmente</li>
            <li>✓ Mantén las calificaciones actualizadas</li>
            <li>✓ Comunícate con los estudiantes si es necesario</li>
          </ul>
        </div>
      </div>

      <section className="dashboard-details">
        <div className="details-card">
          <h2>Asignaturas asignadas</h2>
          {stats.assigned_subjects.length === 0 ? (
            <p>No tienes asignaturas asignadas.</p>
          ) : (
            <Table
              caption="Asignaturas asignadas"
              data={stats.assigned_subjects}
              columns={[
                { header: "ID", render: (subject) => subject.id },
                { header: "Código", render: (subject) => subject.code },
                { header: "Nombre", render: (subject) => subject.name },
                { header: "Créditos", render: (subject) => subject.credits },
                {
                  header: "Activa",
                  render: (subject) => (subject.is_active ? "Sí" : "No"),
                },
              ]}
            />
          )}
        </div>

        <div className="details-card">
          <h2>Estudiantes asignados</h2>
          {stats.assigned_students.length === 0 ? (
            <p>No hay estudiantes asignados todavía.</p>
          ) : (
            <Table
              caption="Estudiantes asignados"
              data={stats.assigned_students}
              columns={[
                { header: "ID", render: (student) => student.id },
                { header: "Nombre", render: (student) => student.full_name },
                { header: "Email", render: (student) => student.email },
              ]}
            />
          )}
        </div>

        <div className="details-card">
          <h2>Calificaciones</h2>
          {stats.grades.length === 0 ? (
            <p>No hay calificaciones registradas aún.</p>
          ) : (
            <Table
              caption="Calificaciones del docente"
              data={stats.grades}
              columns={[
                { header: "ID", render: (grade) => grade.id },
                { header: "Estudiante", render: (grade) => grade.student_name },
                { header: "Asignatura", render: (grade) => grade.subject_name },
                { header: "Nota", render: (grade) => (grade.value ?? "-") },
                { header: "Notas", render: (grade) => grade.notes ?? "-" },
              ]}
            />
          )}
        </div>
      </section>
    </div>
  );
}
