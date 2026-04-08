import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Table } from "../../components/Table";
import { Alert } from "../../components/Alert";
import { useSubjects } from "../../hooks/useSubjects";
import type { SubjectResponse } from "../../api/subjects";

export function StudentSubjectsPage() {
  const { data, error, isLoading } = useSubjects();

  return (
    <DashboardLayout>
      <div className="card">
        <h2>Materias disponibles</h2>
        {error ? <Alert message={error} /> : null}
        {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <Table<SubjectResponse>
            caption="Materias"
            data={data ?? []}
            columns={[
              { header: "Código", render: (row) => row.code },
              { header: "Nombre", render: (row) => row.name },
              { header: "Créditos", render: (row) => row.credits }
            ]}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
