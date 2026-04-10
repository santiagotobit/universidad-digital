-- Ejecutar en PostgreSQL como usuario con permisos sobre public.subjects (p. ej. owner de la tabla).
-- Corrige: null value in column "id" of relation "subjects" violates not-null constraint
-- cuando la tabla se creó sin SERIAL/IDENTITY en id.

DO $fix$
DECLARE
  max_id bigint;
BEGIN
  IF pg_get_serial_sequence('public.subjects', 'id') IS NOT NULL THEN
    RAISE NOTICE 'subjects.id ya tiene secuencia asociada; no se hace nada.';
    RETURN;
  END IF;
  CREATE SEQUENCE IF NOT EXISTS subjects_id_seq;
  ALTER TABLE public.subjects
    ALTER COLUMN id SET DEFAULT nextval('subjects_id_seq');
  SELECT COALESCE(MAX(id), 0) INTO max_id FROM public.subjects;
  IF max_id = 0 THEN
    PERFORM setval('subjects_id_seq', 1, false);
  ELSE
    PERFORM setval('subjects_id_seq', max_id);
  END IF;
  ALTER SEQUENCE subjects_id_seq OWNED BY public.subjects.id;
END
$fix$;

-- Tabla tasks (mismo problema si id no tiene secuencia)
DO $fix_tasks$
DECLARE
  max_id bigint;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'tasks'
  ) THEN
    RETURN;
  END IF;
  IF pg_get_serial_sequence('public.tasks', 'id') IS NOT NULL THEN
    RAISE NOTICE 'tasks.id ya tiene secuencia asociada; no se hace nada.';
    RETURN;
  END IF;
  CREATE SEQUENCE IF NOT EXISTS tasks_id_seq;
  ALTER TABLE public.tasks
    ALTER COLUMN id SET DEFAULT nextval('tasks_id_seq');
  SELECT COALESCE(MAX(id), 0) INTO max_id FROM public.tasks;
  IF max_id = 0 THEN
    PERFORM setval('tasks_id_seq', 1, false);
  ELSE
    PERFORM setval('tasks_id_seq', max_id);
  END IF;
  ALTER SEQUENCE tasks_id_seq OWNED BY public.tasks.id;
END
$fix_tasks$;
