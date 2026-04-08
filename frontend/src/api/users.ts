import { http } from "./http";
import type { UserResponse } from "./auth";

export type UserCreate = {
  email: string;
  full_name: string;
  password: string;
  role_ids: number[];
};

export type UserUpdate = {
  full_name?: string;
  password?: string;
  is_active?: boolean;
  role_ids?: number[];
};

export async function listUsers() {
  const { data } = await http.get<UserResponse[]>("/users");
  return data;
}

export async function createUser(payload: UserCreate) {
  const { data } = await http.post<UserResponse>("/users", payload);
  return data;
}

export async function updateUser(id: number, payload: UserUpdate) {
  const { data } = await http.put<UserResponse>(`/users/${id}`, payload);
  return data;
}

export async function deactivateUser(id: number) {
  const { data } = await http.delete<UserResponse>(`/users/${id}`);
  return data;
}
