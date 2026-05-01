// packages/components/src/atomic/ActionButton/useAction.ts

/**
 * @fileoverview useAction Hook
 * @description Generic hook for wrapping async actions with loading/error state.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/** Options for the useAction hook. */
export interface UseActionOptions<T> {
  /** The async action to execute */
  action: () => Promise<T>;
  /** Callback on successful completion */
  onSuccess?: (result: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/** Return value of the useAction hook. */
export interface UseActionResult<T> {
  /** Execute the action */
  execute: () => Promise<T | undefined>;
  /** Whether the action is currently executing */
  loading: boolean;
  /** The last error that occurred, if any */
  error: Error | null;
}

/**
 * Hook for wrapping async actions with loading/error state management.
 *
 * @example
 * ```tsx
 * const { execute, loading, error } = useAction({
 *   action: () => api.deleteItem(id),
 *   onSuccess: () => toast.success('Deleted!'),
 *   onError: (e) => console.error(e),
 * });
 *
 * <Button onClick={execute} disabled={loading}>
 *   {loading ? 'Deleting...' : 'Delete'}
 * </Button>
 * ```
 */
export function useAction<T>({
  action,
  onSuccess,
  onError,
}: UseActionOptions<T>): UseActionResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (): Promise<T | undefined> => {
    if (loadingRef.current) return undefined;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await action();
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (mountedRef.current) {
        setError(error);
      }
      onError?.(error);
      return undefined;
    } finally {
      loadingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [action, onSuccess, onError]);

  return { execute, loading, error };
}
