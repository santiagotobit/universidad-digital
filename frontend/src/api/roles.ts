import { http } from "./http";

export type RoleResponse = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
};

export async function listRoles() {
  const { data } = await http.get<RoleResponse[]>("/roles");
  return data;
}
