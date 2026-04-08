import { useState, useCallback } from "react";

interface UseAsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAsyncOptions {
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, isLoading: true, error: null });
    try {
      const response = await asyncFunction();
      setState({ data: response, isLoading: false, error: null });
      options.onSuccess?.();
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setState({ data: null, isLoading: false, error: message });
      options.onError?.(message);
      throw err;
    }
  }, [asyncFunction, options]);

  return { ...state, execute, retry: execute };
}
