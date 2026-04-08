import { http } from "./http";

export type PeriodResponse = {
  id: number;
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
};

export type PeriodCreate = {
  code: string;
  name: string;
  start_date: string;
  end_date: string;
};

export type PeriodUpdate = {
  name?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
};

export async function listPeriods() {
  const { data } = await http.get<PeriodResponse[]>("/periods");
  return data;
}

export async function createPeriod(payload: PeriodCreate) {
  const { data } = await http.post<PeriodResponse>("/periods", payload);
  return data;
}

export async function updatePeriod(id: number, payload: PeriodUpdate) {
  const { data } = await http.put<PeriodResponse>(`/periods/${id}`, payload);
  return data;
}

export async function deactivatePeriod(id: number) {
  const { data } = await http.delete<PeriodResponse>(`/periods/${id}`);
  return data;
}

export async function activatePeriod(id: number) {
  const { data } = await http.put<PeriodResponse>(`/periods/${id}`, { is_active: true });
  return data;
}
