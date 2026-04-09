import axios, { type AxiosError } from "axios";

type ApiDetail = string | { msg?: string }[];

export function getErrorMessage(error: unknown, fallback = "Ocurrió un error inesperado.") {
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError<{ detail?: ApiDetail }>;
    if (ax.code === "ECONNABORTED") {
      return "Tiempo de espera agotado: el servidor o la base de datos tardaron demasiado (suele pasar con Cloud SQL desde local). Prueba de nuevo o revisa la red.";
    }
    if (ax.code === "ERR_NETWORK" || ax.message === "Network Error") {
      return "No se pudo conectar con el API. ¿Está el backend en marcha (puerto 8000) y el frontend usando el proxy /api?";
    }
    if (!ax.response) {
      return "Sin respuesta del servidor. Revisa que uvicorn esté activo y que no haya un firewall bloqueando.";
    }
    const data = ax.response.data;
    const detail = typeof data === "object" && data !== null ? (data as { detail?: ApiDetail }).detail : undefined;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail) && detail[0] && typeof detail[0] === "object" && "msg" in detail[0]) {
      const m = (detail[0] as { msg?: string }).msg;
      if (m) return m;
    }
    if (typeof data === "string" && data.trim()) {
      return data.trim().slice(0, 300);
    }
  }
  if (error instanceof Error && error.message && error.message !== "Error") {
    return error.message;
  }
  return fallback;
}

export function getStatusCode(error: unknown) {
  const axiosError = error as AxiosError;
  return axiosError?.response?.status;
}

export function isUnauthorized(error: unknown) {
  const status = getStatusCode(error);
  return status === 401 || status === 403;
}
