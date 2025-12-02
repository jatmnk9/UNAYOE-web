import { useState, useCallback } from 'react';
import { getErrorMessage } from '../utils';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook personalizado para manejar llamadas a la API
 * Gestiona estados de carga, error y datos de manera automática
 *
 * @param apiFunction - Función asíncrona que realiza la llamada a la API
 * @param immediate - Si es true, ejecuta la función inmediatamente al montar
 * @returns Estado y funciones para gestionar la llamada API
 *
 * @example
 * const { data, isLoading, error, execute } = useApi(
 *   () => diaryService.getNotes(userId)
 * );
 *
 * useEffect(() => {
 *   execute();
 * }, []);
 */
export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  immediate = false
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await apiFunction(...args);
        setState({ data: result, isLoading: false, error: null });
        return result;
      } catch (error: any) {
        const errorMessage = getErrorMessage(error);
        setState({ data: null, isLoading: false, error: errorMessage });
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
