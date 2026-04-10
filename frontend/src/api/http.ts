import axios from "axios";

function resolveApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  const fallback = "/api";
  if (!raw) return fallback;
  // Mismo host distinto puerto (3000 vs 8000) es otro origen: la cookie HttpOnly+Lax no viaja en XHR.
  // En dev, usar siempre el proxy de Vite para que cookie y credenciales sean mismo origen.
  if (
    import.meta.env.DEV &&
    /^https?:\/\/(localhost|127\.0\.0\.1):8000\/?$/i.test(raw.replace(/\/+$/, ""))
  ) {
    return fallback;
  }
  return raw;
}

const apiBaseUrl = resolveApiBaseUrl();

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
      const path = `${error?.config?.baseURL ?? ""}${error?.config?.url ?? ""}`;
      // /auth/me al arrancar sin sesión es 401 esperado; no disparar logout global.
      if (!path.includes("/auth/me")) {
        onUnauthorized();
      }
    }
    // No redirigir a /500: ocultaba el cuerpo del error y el mensaje en la UI (p. ej. crear asignatura).
    if (import.meta.env.DEV) {
      const cfg = error?.config;
      const res = error?.response;
      const url = `${cfg?.baseURL ?? ""}${cfg?.url ?? ""}`;
      const payload = res?.data;
      const detail =
        payload && typeof payload === "object"
          ? JSON.stringify(payload)
          : payload ?? error?.message;
      console.error("[API]", cfg?.method?.toUpperCase(), url, res?.status ?? error?.code, detail);
    }
    return Promise.reject(error);
  }
);
