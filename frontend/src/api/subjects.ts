import { http } from "./http";

export type SubjectResponse = {
  id: number;
  code: string;
  name: string;
  credits: number;
  is_active: boolean;
  created_at: string;
};

export type SubjectCreate = {
  code: string;
  name: string;
  credits: number;
};

export type SubjectUpdate = {
  name?: string;
  credits?: number;
  is_active?: boolean;
};

export async function listSubjects() {
  const { data } = await http.get<SubjectResponse[]>("/subjects");
  return data;
}

export async function createSubject(payload: SubjectCreate) {
  const { data } = await http.post<SubjectResponse>("/subjects", payload);
  return data;
}

export async function updateSubject(id: number, payload: SubjectUpdate) {
  const { data } = await http.put<SubjectResponse>(`/subjects/${id}`, payload);
  return data;
}

export async function deactivateSubject(id: number) {
  const { data } = await http.delete<SubjectResponse>(`/subjects/${id}`);
  return data;
}

export async function activateSubject(id: number) {
  const { data } = await http.put<SubjectResponse>(`/subjects/${id}`, { is_active: true });
  return data;
}
