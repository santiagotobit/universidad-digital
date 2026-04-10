import * as authApi from "../api/auth";

const AUTH_TOKEN_KEY = "auth_token";

export async function login(email: string, password: string) {
  const response = await authApi.login({ email, password });
  // Cookie HttpOnly la pone el backend; además guardamos Bearer para cuando el API no es mismo origen (p. ej. :8000 directo).
  if (typeof window !== "undefined" && response.access_token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
  }
  return response;
}

export async function logout() {
  try {
    await authApi.logout();
  } finally {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }
}

export async function getCurrentUser() {
  return authApi.getMe();
}
