import { http } from "./http";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export type UserResponse = {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  roles: string[];
};

export async function login(payload: LoginRequest) {
  const { data } = await http.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function logout() {
  await http.post("/auth/logout");
}

export async function getMe() {
  const { data } = await http.get<UserResponse>("/auth/me");
  return data;
}
