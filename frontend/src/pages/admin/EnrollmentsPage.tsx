import { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
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
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterActive, setFilterActive] = useState("");

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
  const teacherOptions =
    users
      ?.filter((user) => user.roles.includes("Docente"))
      .map((user) => ({ value: String(user.id), label: `${user.full_name} (#${user.id})` })) ??
    [];

  const userMap = useMemo(
    () => new Map(users?.map((user) => [user.id, user]) ?? []),
    [users]
  );

  const subjectMap = useMemo(
    () => new Map(subjects?.map((subject) => [subject.id, subject]) ?? []),
    [subjects]
  );

  const periodMap = useMemo(
    () => new Map(periods?.map((period) => [period.id, period]) ?? []),
    [periods]
  );

  const filteredEnrollments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (enrollments ?? []).filter((enrollment) => {
      const studentName = userMap.get(enrollment.user_id)?.full_name ?? `#${enrollment.user_id}`;
      const subject = subjectMap.get(enrollment.subject_id);
      const subjectName = subject?.name ?? `#${enrollment.subject_id}`;
      const periodName = periodMap.get(enrollment.period_id)?.name ?? `#${enrollment.period_id}`;
      const teacherName = subject?.teacher_id
        ? userMap.get(subject.teacher_id)?.full_name ?? `#${subject.teacher_id}`
        : "Sin docente";

      const matchesSearch =
        !term ||
        studentName.toLowerCase().includes(term) ||
        subjectName.toLowerCase().includes(term) ||
        periodName.toLowerCase().includes(term) ||
        teacherName.toLowerCase().includes(term) ||
        String(enrollment.id).includes(term);

      const matchesSubject = !filterSubject || String(enrollment.subject_id) === filterSubject;
      const matchesPeriod = !filterPeriod || String(enrollment.period_id) === filterPeriod;
      const matchesTeacher = !filterTeacher || String(subject?.teacher_id ?? "") === filterTeacher;
      const matchesActive =
        filterActive === "" ||
        (filterActive === "active" && enrollment.is_active) ||
        (filterActive === "inactive" && !enrollment.is_active);

      return matchesSearch && matchesSubject && matchesPeriod && matchesTeacher && matchesActive;
    });
  }, [enrollments, filterActive, filterPeriod, filterSubject, filterTeacher, search, subjectMap, periodMap, userMap]);

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
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <Input
            label="Buscar"
            placeholder="Buscar por estudiante, materia, docente o periodo..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ minWidth: 240, flex: 1 }}
          />
          <Select
            label="Materia"
            value={filterSubject}
            onChange={(event) => setFilterSubject(event.target.value)}
            options={[{ value: "", label: "Todas las materias" }, ...subjectOptions]}
          />
          <Select
            label="Periodo"
            value={filterPeriod}
            onChange={(event) => setFilterPeriod(event.target.value)}
            options={[{ value: "", label: "Todos los periodos" }, ...periodOptions]}
          />
          <Select
            label="Docente"
            value={filterTeacher}
            onChange={(event) => setFilterTeacher(event.target.value)}
            options={[{ value: "", label: "Todos los docentes" }, ...teacherOptions]}
          />
          <Select
            label="Estado"
            value={filterActive}
            onChange={(event) => setFilterActive(event.target.value)}
            options={[
              { value: "", label: "Todos" },
              { value: "active", label: "Activas" },
              { value: "inactive", label: "Canceladas" }
            ]}
          />
        </div>

        {error ? <Alert message={error} /> : null}
        {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <>
            <p style={{ marginBottom: 12, color: "#555" }}>
              Mostrando {filteredEnrollments.length} de {enrollments?.length ?? 0} inscripciones.
            </p>
            <Table<EnrollmentResponse>
              caption="Listado de inscripciones"
              data={filteredEnrollments}
              columns={[
                { header: "ID", render: (row) => row.id },
                {
                  header: "Estudiante",
                  render: (row) => userMap.get(row.user_id)?.full_name ?? `#${row.user_id}`
                },
                {
                  header: "Materia",
                  render: (row) => subjectMap.get(row.subject_id)?.name ?? `#${row.subject_id}`
                },
                {
                  header: "Docente",
                  render: (row) => {
                    const subject = subjectMap.get(row.subject_id);
                    return subject?.teacher_id
                      ? userMap.get(subject.teacher_id)?.full_name ?? `#${subject.teacher_id}`
                      : "Sin docente";
                  }
                },
                {
                  header: "Periodo",
                  render: (row) => periodMap.get(row.period_id)?.name ?? `#${row.period_id}`
                },
                {
                  header: "Inscripción",
                  render: (row) => new Date(row.enrolled_at).toLocaleString()
                },
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
