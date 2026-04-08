import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Table } from "../../components/Table";
import { Alert } from "../../components/Alert";
import { periodsService } from "../../services/periodsService";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/apiError";
import type { PeriodResponse } from "../../api/periods";

const createSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(3),
  start_date: z.string().min(8),
  end_date: z.string().min(8)
});

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(3).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional()
});

type CreateForm = z.infer<typeof createSchema>;
type UpdateForm = z.infer<typeof updateSchema>;

export function PeriodsPage() {
  const [alert, setAlert] = useState<{ message: string; variant: "success" | "error" } | null>(
    null
  );
  const { data: periods, error, isLoading, reload } = useFetch(periodsService.list, []);

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const updateForm = useForm<UpdateForm>({ resolver: zodResolver(updateSchema) });

  const handleCreate = async (values: CreateForm) => {
    try {
      await periodsService.create(values);
      setAlert({ message: "Periodo creado.", variant: "success" });
      createForm.reset();
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  const handleUpdate = async (values: UpdateForm) => {
    try {
      await periodsService.update(Number(values.id), {
        name: values.name || undefined,
        start_date: values.start_date || undefined,
        end_date: values.end_date || undefined
      });
      setAlert({ message: "Periodo actualizado.", variant: "success" });
      updateForm.reset();
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await periodsService.deactivate(id);
      setAlert({ message: "Periodo desactivado.", variant: "success" });
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await periodsService.activate(id);
      setAlert({ message: "Periodo activado.", variant: "success" });
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  return (
    <DashboardLayout>
      <div className="grid grid-2">
        <div className="card">
          <h2>Crear periodo</h2>
          {alert ? <Alert message={alert.message} type={alert.variant} /> : null}
          <form onSubmit={createForm.handleSubmit(handleCreate)} className="grid">
            <Input
              label="Código"
              {...createForm.register("code")}
              error={createForm.formState.errors.code?.message}
            />
            <Input
              label="Nombre"
              {...createForm.register("name")}
              error={createForm.formState.errors.name?.message}
            />
            <Input
              label="Fecha inicio (YYYY-MM-DD)"
              {...createForm.register("start_date")}
              error={createForm.formState.errors.start_date?.message}
            />
            <Input
              label="Fecha fin (YYYY-MM-DD)"
              {...createForm.register("end_date")}
              error={createForm.formState.errors.end_date?.message}
            />
            <Button type="submit">Crear</Button>
          </form>
        </div>
        <div className="card">
          <h2>Actualizar periodo</h2>
          <form onSubmit={updateForm.handleSubmit(handleUpdate)} className="grid">
            <Input
              label="ID de periodo"
              {...updateForm.register("id")}
              error={updateForm.formState.errors.id?.message}
            />
            <Input
              label="Nombre (opcional)"
              {...updateForm.register("name")}
              error={updateForm.formState.errors.name?.message}
            />
            <Input
              label="Fecha inicio (opcional)"
              {...updateForm.register("start_date")}
              error={updateForm.formState.errors.start_date?.message}
            />
            <Input
              label="Fecha fin (opcional)"
              {...updateForm.register("end_date")}
              error={updateForm.formState.errors.end_date?.message}
            />
            <Button type="submit" variant="secondary">
              Actualizar
            </Button>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Listado de periodos</h2>
        {error ? <Alert message={error} /> : null}
        {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <Table<PeriodResponse>
            caption="Listado de periodos"
            data={periods ?? []}
            columns={[
              { header: "ID", render: (row) => row.id },
              { header: "Código", render: (row) => row.code },
              { header: "Nombre", render: (row) => row.name },
              { header: "Inicio", render: (row) => row.start_date },
              { header: "Fin", render: (row) => row.end_date },
              { header: "Activo", render: (row) => (row.is_active ? "Sí" : "No") },
              {
                header: "Acciones",
                render: (row) => (
                  <div style={{ display: "flex", gap: "8px" }}>
                    {row.is_active ? (
                      <Button variant="danger" onClick={() => void handleDeactivate(row.id)}>
                        Desactivar
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
