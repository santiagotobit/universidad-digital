import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Button } from "../../components/Button";
import { Select } from "../../components/Select";
import { Table } from "../../components/Table";
import { Alert } from "../../components/Alert";
import { enrollmentsService } from "../../services/enrollmentsService";
import { usersService } from "../../services/usersService";
import { subjectsService } from "../../services/subjectsService";
import { periodsService } from "../../services/periodsService";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/apiError";
import type { EnrollmentResponse } from "../../api/enrollments";

const createSchema = z.object({
  user_id: z.string().min(1),
  subject_id: z.string().min(1),
  period_id: z.string().min(1)
});

type CreateForm = z.infer<typeof createSchema>;

export function EnrollmentsPage() {
  const [alert, setAlert] = useState<{ message: string; variant: "success" | "error" } | null>(
    null
  );
  const { data: enrollments, error, isLoading, reload } = useFetch(enrollmentsService.list, []);
  const { data: users } = useFetch(usersService.list, []);
  const { data: subjects } = useFetch(subjectsService.list, []);
  const { data: periods } = useFetch(periodsService.list, []);

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  const userOptions =
    users?.map((user) => ({ value: String(user.id), label: `${user.full_name} (#${user.id})` })) ??
    [];
  const subjectOptions =
    subjects?.map((subject) => ({
      value: String(subject.id),
      label: `${subject.name} (#${subject.id})`
    })) ?? [];
  const periodOptions =
    periods?.map((period) => ({
      value: String(period.id),
      label: `${period.name} (#${period.id})`
    })) ?? [];

  const handleCreate = async (values: CreateForm) => {
    try {
      await enrollmentsService.create({
        user_id: Number(values.user_id),
        subject_id: Number(values.subject_id),
        period_id: Number(values.period_id)
      });
      setAlert({ message: "Inscripción creada.", variant: "success" });
      createForm.reset();
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await enrollmentsService.deactivate(id);
      setAlert({ message: "Inscripción cancelada.", variant: "success" });
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await enrollmentsService.activate(id);
      setAlert({ message: "Inscripción activada.", variant: "success" });
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  return (
    <DashboardLayout>
      <div className="card">
        <h2>Crear inscripción</h2>
        {alert ? <Alert message={alert.message} type={alert.variant} /> : null}
        <form onSubmit={createForm.handleSubmit(handleCreate)} className="grid">
          <Select
            label="Estudiante"
            options={[{ value: "", label: "Selecciona un estudiante" }, ...userOptions]}
            {...createForm.register("user_id")}
            error={createForm.formState.errors.user_id?.message}
          />
          <Select
            label="Materia"
            options={[{ value: "", label: "Selecciona una materia" }, ...subjectOptions]}
            {...createForm.register("subject_id")}
            error={createForm.formState.errors.subject_id?.message}
          />
          <Select
            label="Periodo"
            options={[{ value: "", label: "Selecciona un periodo" }, ...periodOptions]}
            {...createForm.register("period_id")}
            error={createForm.formState.errors.period_id?.message}
          />
          <Button type="submit">Crear</Button>
        </form>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Listado de inscripciones</h2>
        {error ? <Alert message={error} /> : null}
        {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <Table<EnrollmentResponse>
            caption="Listado de inscripciones"
            data={enrollments ?? []}
            columns={[
              { header: "ID", render: (row) => row.id },
              { header: "Estudiante", render: (row) => row.user_id },
              { header: "Materia", render: (row) => row.subject_id },
              { header: "Periodo", render: (row) => row.period_id },
              { header: "Activo", render: (row) => (row.is_active ? "Sí" : "No") },
              {
                header: "Acciones",
                render: (row) => (
                  <div style={{ display: "flex", gap: "8px" }}>
                    {row.is_active ? (
                      <Button variant="danger" onClick={() => void handleDeactivate(row.id)}>
                        Cancelar
                      </Button>
                    ) : (
                      <Button variant="success" onClick={() => void handleActivate(row.id)}>
                        Activar
                      </Button>
                    )}
                  </div>
                )
              }
            ]}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
