import { http } from "./http";

export type GradeResponse = {
  id: number;
  enrollment_id: number;
  value: number;
  notes: string | null;
  created_at: string;
};

export type GradeCreate = {
  enrollment_id: number;
  value: number;
  notes?: string | null;
};

export type GradeUpdate = {
  value?: number;
  notes?: string | null;
};

export async function listGrades() {
  const { data } = await http.get<GradeResponse[]>("/grades");
  return data;
}

export async function createGrade(payload: GradeCreate) {
  const { data } = await http.post<GradeResponse>("/grades", payload);
  return data;
}

export async function updateGrade(id: number, payload: GradeUpdate) {
  const { data } = await http.put<GradeResponse>(`/grades/${id}`, payload);
  return data;
}
