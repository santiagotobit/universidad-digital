import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export const http = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  // Cloud SQL / red remota: varias consultas seguidas pueden superar 10s.
  timeout: 45000,
});

http.interceptors.request.use((config) => {
  // Si hay token en localStorage (ej. Cypress), enviarlo como Bearer
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    // 503 = BD u otro servicio caído: mostrar el mensaje del backend, no la página genérica /500
    const st = error?.response?.status;
    if (st !== undefined && st >= 500 && st !== 503) {
      window.location.assign("/500");
    }
    return Promise.reject(error);
  }
);
