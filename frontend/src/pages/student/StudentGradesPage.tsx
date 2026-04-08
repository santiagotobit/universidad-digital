import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Table } from "../../components/Table";
import { Alert } from "../../components/Alert";
import { useGrades } from "../../hooks/useGrades";
import type { GradeResponse } from "../../api/grades";

export function StudentGradesPage() {
  const { data, error, isLoading } = useGrades();

  return (
    <DashboardLayout>
      <div className="card">
        <h2>Mis calificaciones</h2>
        {error ? <Alert message={error} /> : null}
        {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <Table<GradeResponse>
            caption="Calificaciones"
            data={data ?? []}
            columns={[
              { header: "ID", render: (row) => row.id },
              { header: "Inscripción", render: (row) => row.enrollment_id },
              { header: "Nota", render: (row) => row.value },
              { header: "Notas", render: (row) => row.notes ?? "-" }
            ]}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
