import { useEffect } from "react";
import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../hooks/useToast";
import { getStudentStats } from "../../services/statsService";
import { StatCard } from "../../components/StatCard";
import { Spinner } from "../../components/Spinner";
import { Alert } from "../../components/Alert";
import { Table } from "../../components/Table";
import { BookOpen, FileText, TrendingUp, Clock } from "lucide-react";
import "../../styles/stats.css";

interface StudentStats {
  total_enrollments: number;
  total_grades: number;
  average_grade: number | null;
  current_subjects: number;
  enrolled_subjects?: StudentSubject[];
  grades?: StudentGrade[];
}

interface StudentSubject {
  id: number;
  code: string;
  name: string;
  credits: number;
  is_active: boolean;
}

interface StudentGrade {
  id: number;
  subject_name: string;
  value: number | null;
  notes: string | null;
}

export function StudentDashboard() {
  const { addToast } = useToast();
  const { data: stats, isLoading, error, execute } = useAsync<StudentStats>(
    () => getStudentStats(),
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

  const averageGrade = stats.average_grade
    ? parseFloat((stats.average_grade as any).toFixed(2))
    : 0;

  return (
    <div className="dashboard-container" data-testid="dashboard">
      <div className="dashboard-header">
        <h1>Mi Panel de Estudiante</h1>
        <p>Aquí puedes ver tu progreso académico</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Inscripciones Activas"
          value={stats.total_enrollments}
          icon={<Clock size={24} />}
          color="primary"
        />
        <StatCard
          title="Asignaturas Actuales"
          value={stats.current_subjects}
          icon={<BookOpen size={24} />}
          color="success"
        />
        <StatCard
          title="Calificaciones Registradas"
          value={stats.total_grades}
          icon={<FileText size={24} />}
          color="warning"
        />
        <StatCard
          title="Promedio General"
          value={averageGrade.toFixed(2)}
          icon={<TrendingUp size={24} />}
          color="info"
          trend={averageGrade >= 3.5 ? "positive" : "negative"}
        />
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h3>📋 Resumen Académico</h3>
          <p>
            Tienes {stats.total_enrollments} inscripción
            {stats.total_enrollments !== 1 ? "es" : ""} activa
            {stats.total_enrollments !== 1 ? "s" : ""} y estás cursando{" "}
            {stats.current_subjects} asignatura
            {stats.current_subjects !== 1 ? "s" : ""}.
          </p>
          <p>
            Tienes {stats.total_grades} calificacion
            {stats.total_grades !== 1 ? "es" : ""} registrada
            {stats.total_grades !== 1 ? "s" : ""} con un promedio de{" "}
            <strong>{averageGrade.toFixed(2)}</strong>.
          </p>
        </div>

        <div className="info-card">
          <h3>💡 Recomendaciones</h3>
          {averageGrade >= 4.5 ? (
            <p>¡Excelente desempeño! Mantén este nivel de dedicación.</p>
          ) : averageGrade >= 3.5 ? (
            <p>Buen trabajo. Puedes mejorar algunos cursos con más dedicación.</p>
          ) : (
            <p>
              Te recomendamos buscar apoyo académico para mejorar tu desempeño
              en los cursos.
            </p>
          )}

          <ul style={{ marginTop: "1rem", fontSize: "0.95rem", color: "#666" }}>
            <li>✓ Revisa tus calificaciones regularmente</li>
            <li>✓ No pierdas los plazos de entrega</li>
            <li>✓ Comunícate con tus docentes si tienes dudas</li>
          </ul>
        </div>
      </div>

      <section className="dashboard-details">
        <div className="details-card">
          <h2>Asignaturas inscritas</h2>
          {(stats.enrolled_subjects?.length ?? 0) === 0 ? (
            <p>No tienes asignaturas inscritas.</p>
          ) : (
            <Table
              caption="Asignaturas inscritas"
              data={stats.enrolled_subjects || []}
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
          <h2>Mis calificaciones</h2>
          {(stats.grades?.length ?? 0) === 0 ? (
            <p>No hay calificaciones registradas aún.</p>
          ) : (
            <Table
              caption="Calificaciones del estudiante"
              data={stats.grades || []}
              columns={[
                { header: "ID", render: (grade) => grade.id },
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
