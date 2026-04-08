import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Table } from "../../components/Table";
import { Alert } from "../../components/Alert";
import { useEnrollments } from "../../hooks/useEnrollments";
import type { EnrollmentResponse } from "../../api/enrollments";

export function StudentEnrollmentsPage() {
  const { data, error, isLoading } = useEnrollments();

  return (
    <DashboardLayout>
      <div className="card">
        <h2>Mis inscripciones</h2>
        {error ? <Alert message={error} /> : null}
        {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <Table<EnrollmentResponse>
            caption="Inscripciones"
            data={data ?? []}
            columns={[
              { header: "ID", render: (row) => row.id },
              { header: "Materia", render: (row) => row.subject_id },
              { header: "Periodo", render: (row) => row.period_id },
              { header: "Activo", render: (row) => (row.is_active ? "Sí" : "No") }
            ]}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
