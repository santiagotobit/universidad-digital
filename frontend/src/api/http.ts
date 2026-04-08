import axios from "axios";
import { getAuthToken } from "../auth/token";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export const http = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
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
    if (error?.response?.status >= 500) {
      window.location.assign("/500");
    }
    return Promise.reject(error);
  }
);
