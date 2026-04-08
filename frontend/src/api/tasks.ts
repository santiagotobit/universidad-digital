import { http } from "./http";

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
  created_by?: number;
};

export type TaskCreate = {
  title: string;
  description?: string | null;
  priority?: string;
};

export type TaskUpdate = {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
};

export async function listTasks(params?: { search?: string; status?: string }) {
  const { data } = await http.get<Task[]>("/tasks", { params });
  return data;
}

export async function getTask(id: number) {
  const { data } = await http.get<Task>(`/tasks/${id}`);
  return data;
}

export async function createTask(payload: TaskCreate) {
  const { data } = await http.post<Task>("/tasks", payload);
  return data;
}

export async function updateTask(id: number, payload: TaskUpdate) {
  const { data } = await http.put<Task>(`/tasks/${id}`, payload);
  return data;
}
