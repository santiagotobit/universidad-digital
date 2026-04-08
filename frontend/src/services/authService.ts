import * as authApi from "../api/auth";

export async function login(email: string, password: string) {
  const response = await authApi.login({ email, password });
  // Token is automatically stored in httpOnly cookie by backend
  return response;
}

export async function logout() {
  await authApi.logout();
}

export async function getCurrentUser() {
  return authApi.getMe();
}
