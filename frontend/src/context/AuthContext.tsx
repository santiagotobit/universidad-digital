import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { UserResponse } from "../api/auth";
import { setUnauthorizedHandler } from "../api/http";
import * as authService from "../services/authService";
import { getErrorMessage, isUnauthorized } from "../utils/apiError";

type AuthContextValue = {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authService.getCurrentUser();
      setUser(me);
      setError(null);
    } catch (err) {
      setUser(null);
      if (!isUnauthorized(err)) {
        setError(getErrorMessage(err, "No se pudo validar la sesión."));
      } else {
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.login(email, password);
      await refreshUser();
      return true;
    } catch (err) {
      setError(getErrorMessage(err, "Credenciales inválidas."));
      setIsLoading(false);
      return false;
    }
  }, [refreshUser]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const hasRole = useCallback(
    (roles: string[]) => {
      if (!user) {
        return false;
      }
      return user.roles.some((role) => roles.includes(role));
    },
    [user]
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void logout();
    });
    // Always try to refresh user on app start - cookies will be sent automatically
    void refreshUser();
    return () => setUnauthorizedHandler(null);
  }, [logout, refreshUser]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      error,
      login,
      logout,
      refreshUser,
      hasRole
    }),
    [user, isLoading, error, login, logout, refreshUser, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
