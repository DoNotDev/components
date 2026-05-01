// packages/components/src/hooks/useToast.tsx

/**
 * @fileoverview Industry-standard toast notification system
 * @description React 19+ compatible, CSR/SSR safe toast implementation
 *
 * **Architecture:**
 * - Singleton pub-sub pattern with module-level state
 * - Zero React Context overhead
 * - Works across component boundaries
 * - Can be called from anywhere (even non-React code)
 *
 * **React 19 Compatibility:**
 * - Uses stable setState functions (no re-subscription needed)
 * - Empty dependency array in useEffect (best practice)
 * - 'use client' directive for Next.js App Router
 *
 * **CSR/SSR Safety:**
 * - Client-only execution via 'use client'
 * - No hydration mismatches (toasts are ephemeral)
 * - Module state resets on navigation (expected behavior)
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useSyncExternalStore, useMemo } from 'react';

import type { ToastType } from '../atomic/Toaster/Toast.types';
import type {
  ToastActionElement,
  ToastProps as ToastPrimitiveProps,
} from '../atomic/Toaster/ToastPrimitive';
import type { ReactNode } from 'react';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const TOAST_LIMIT = 5;
// Must match the CSS exit animation duration in Toast styles — changing this
// without updating the CSS will cause toasts to vanish before animation completes
// or linger after animation ends.
const TOAST_REMOVE_DELAY = 300;

// ToastType is imported from Toast.types.ts

/**
 * Toast duration configuration
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export const TOAST_DURATIONS: Record<ToastType, number> = {
  default: 5000,
  success: 4000,
  error: 7000,
  warning: 6000,
  info: 5000,
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Toast options configuration
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface ToastOptions {
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ToastActionElement;
  toastType?: ToastType;
  duration?: number; // 0 = persistent until dismissed
  onOpenChange?: (open: boolean) => void;
  onDismiss?: () => void;
}

/**
 * Toast instance type
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export type ToasterToast = Omit<ToastPrimitiveProps, 'toastType' | 'type'> &
  ToastOptions & {
    id: string;
    open: boolean;
    type: ToastType;
    duration: number;
    isPaused: boolean;
    startTime: number;
    remainingTime: number;
  };

/**
 * Toast function type with multiple overloads
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export type ToastFunction = {
  (type: ToastType, message: string): ToastReturn;
  (message: string): ToastReturn;
  (props: ToastPrimitiveProps & ToastOptions): ToastReturn;
};

type ToastReturn = {
  id: string;
  dismiss: () => void;
  update: (props: Partial<ToasterToast>) => void;
};

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  PAUSE_TOAST: 'PAUSE_TOAST',
  RESUME_TOAST: 'RESUME_TOAST',
} as const;

type ActionType = typeof actionTypes;

type Action =
  | { type: ActionType['ADD_TOAST']; toast: ToasterToast }
  | { type: ActionType['UPDATE_TOAST']; toast: Partial<ToasterToast> }
  | { type: ActionType['DISMISS_TOAST']; toastId?: string }
  | { type: ActionType['REMOVE_TOAST']; toastId?: string }
  | { type: ActionType['PAUSE_TOAST']; toastId: string }
  | { type: ActionType['RESUME_TOAST']; toastId: string };

interface State {
  toasts: ToasterToast[];
}

// ============================================================================
// TIMER MANAGEMENT
// ============================================================================

const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();
const toastPauseTimes = new Map<string, number>();

const clearTimer = (toastId: string) => {
  const timer = toastTimers.get(toastId);
  if (timer) {
    clearTimeout(timer);
    toastTimers.delete(toastId);
  }
  toastPauseTimes.delete(toastId);
};

const isToastActive = (toastId: string): boolean => {
  return getMemoryState().toasts.some((t) => t.id === toastId);
};

const dismissToastIfExists = (toastId: string) => {
  if (isToastActive(toastId)) {
    dispatch({ type: 'DISMISS_TOAST', toastId });
  }
};

const startAutoTimer = (toast: ToasterToast) => {
  if (toast.duration === 0) return; // Persistent toast

  clearTimer(toast.id);

  const timeout = setTimeout(() => {
    dismissToastIfExists(toast.id);
  }, toast.remainingTime);

  toastTimers.set(toast.id, timeout);
};

const pauseTimer = (toastId: string) => {
  const timer = toastTimers.get(toastId);
  if (timer) {
    clearTimeout(timer);
    toastTimers.delete(toastId);
    toastPauseTimes.set(toastId, Date.now());
  }
};

const resumeTimer = (toast: ToasterToast) => {
  if (toast.duration === 0) return; // Persistent toast

  const pauseTime = toastPauseTimes.get(toast.id);
  if (!pauseTime) return;

  const elapsed = Date.now() - pauseTime;
  const remaining = Math.max(0, toast.remainingTime - elapsed);

  // Update remaining time
  dispatch({
    type: 'UPDATE_TOAST',
    toast: { id: toast.id, remainingTime: remaining },
  });

  toastPauseTimes.delete(toast.id);

  if (remaining > 0) {
    const timeout = setTimeout(() => {
      dismissToastIfExists(toast.id);
    }, remaining);
    toastTimers.set(toast.id, timeout);
  } else {
    dismissToastIfExists(toast.id);
  }
};

const addToRemoveQueue = (toastId: string) => {
  clearTimer(toastId);

  const timeout = setTimeout(() => {
    clearTimer(toastId);
    dispatch({ type: 'REMOVE_TOAST', toastId });
  }, TOAST_REMOVE_DELAY);

  toastTimers.set(toastId, timeout);
};

const clearAllTimers = () => {
  toastTimers.forEach((timer) => clearTimeout(timer));
  toastTimers.clear();
  toastPauseTimes.clear();
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Global toast state (chunk-safe pattern)
 *
 * Problem: Multiple chunks create separate module-level state
 * Solution: Use global window object to ensure single state
 *
 * Pattern: Global state + pub-sub
 * - Single state across all chunks
 * - Works across component boundaries
 * - Toast can be called from anywhere
 */

// Global state on window object to avoid chunk duplication
declare global {
  interface Window {
    __DNDEV_TOAST_STATE__?: State;
    __DNDEV_TOAST_LISTENERS__?: Array<(state: State) => void>;
  }
}

// Initialize global state if not exists
if (typeof window !== 'undefined') {
  if (!window.__DNDEV_TOAST_STATE__) {
    window.__DNDEV_TOAST_STATE__ = { toasts: [] };
  }
  if (!window.__DNDEV_TOAST_LISTENERS__) {
    window.__DNDEV_TOAST_LISTENERS__ = [];
  }
}

// Snapshot cache for useSyncExternalStore referential stability.
// Only updated when dispatch() actually produces a new state object.
const SSR_FALLBACK: State = { toasts: [] };
let snapshotCache: State = SSR_FALLBACK;

// Use global state — guard against SSR (window is undefined on the server)
const getMemoryState = (): State => {
  if (typeof window === 'undefined') return SSR_FALLBACK;
  const current = window.__DNDEV_TOAST_STATE__ ?? SSR_FALLBACK;
  // Only return a new reference when the underlying state object changed
  if (current !== snapshotCache) {
    snapshotCache = current;
  }
  return snapshotCache;
};
// Always return the same array reference from window global — never a new [].
// This guarantees push/splice in subscribe and forEach in dispatch operate on the same array.
const getListeners = (): Array<(state: State) => void> => {
  if (typeof window === 'undefined') return [];
  if (!window.__DNDEV_TOAST_LISTENERS__) {
    window.__DNDEV_TOAST_LISTENERS__ = [];
  }
  return window.__DNDEV_TOAST_LISTENERS__;
};

function dispatch(action: Action) {
  const currentState = getMemoryState();
  const newState = reducer(currentState, action);

  // Update global state
  if (typeof window !== 'undefined') {
    window.__DNDEV_TOAST_STATE__ = newState;
  }

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log(
      '[Toast] Dispatch:',
      action.type,
      'Listeners:',
      getListeners().length
    );
  }

  // Notify all listeners — wrap each call so one throwing listener doesn't break the chain
  getListeners().forEach((listener) => {
    try {
      listener(newState);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Toast] Listener threw:', err);
      }
    }
  });
}

/**
 * Toast state reducer
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST': {
      const newToasts = [action.toast, ...state.toasts];
      const removedToasts = newToasts.slice(TOAST_LIMIT);

      // Clean up timers for removed toasts
      removedToasts.forEach((toast) => pauseTimer(toast.id));

      return {
        ...state,
        toasts: newToasts.slice(0, TOAST_LIMIT),
      };
    }

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      if (toastId) {
        // Dismiss specific toast — animate out, then remove
        pauseTimer(toastId);

        if (!state.toasts.some((t) => t.id === toastId)) {
          return state; // Toast doesn't exist
        }

        addToRemoveQueue(toastId);

        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId ? { ...t, open: false } : t
          ),
        };
      } else {
        // Dismiss all non-persistent toasts
        state.toasts.forEach((toast) => {
          if (toast.duration > 0) {
            pauseTimer(toast.id);
            addToRemoveQueue(toast.id);
          }
        });

        return {
          ...state,
          toasts: state.toasts.map((t) => ({
            ...t,
            open: t.duration === 0 ? t.open : false,
          })),
        };
      }
    }

    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        clearAllTimers();
        return { ...state, toasts: [] };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    case 'PAUSE_TOAST': {
      const toast = state.toasts.find((t) => t.id === action.toastId);
      if (!toast || toast.isPaused) return state;

      pauseTimer(action.toastId);
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId ? { ...t, isPaused: true } : t
        ),
      };
    }

    case 'RESUME_TOAST': {
      const toast = state.toasts.find((t) => t.id === action.toastId);
      if (!toast || !toast.isPaused) return state;

      resumeTimer(toast);
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId ? { ...t, isPaused: false } : t
        ),
      };
    }

    default:
      return state;
  }
};

// ============================================================================
// TOAST CREATION
// ============================================================================

let count = 0;
const genId = (): string => (++count % Number.MAX_VALUE).toString();

const normalizeToastProps = (
  input: ToastType | string | (ToastPrimitiveProps & ToastOptions),
  message?: string
): ToastPrimitiveProps & ToastOptions => {
  // Type + message: toast('success', 'message')
  if (typeof input === 'string' && typeof message === 'string') {
    const type = input as ToastType;
    return {
      title: message,
      toastType: type,
      duration: TOAST_DURATIONS[type],
    };
  }

  // Single string: toast('message')
  if (typeof input === 'string' && message === undefined) {
    return {
      title: input,
      toastType: 'default',
      duration: TOAST_DURATIONS.default,
    };
  }

  // Object: toast({ title: '...', type: 'success' })
  return input as ToastPrimitiveProps & ToastOptions;
};

const createToast = (
  props: ToastPrimitiveProps & ToastOptions
): ToastReturn => {
  const id = props.id || genId();
  const type: ToastType = props.toastType || 'default';
  const duration = props.duration ?? TOAST_DURATIONS[type];

  const { id: _, toastType: __, duration: ___, ...restProps } = props;

  const update = (updateProps: Partial<ToasterToast>) =>
    dispatch({ type: 'UPDATE_TOAST', toast: { ...updateProps, id } });

  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  const newToast: ToasterToast = {
    ...restProps,
    id,
    type,
    duration,
    open: true,
    isPaused: false,
    startTime: Date.now(),
    remainingTime: duration,
    onOpenChange: (open: boolean) => {
      props.onOpenChange?.(open);
      if (!open) {
        props.onDismiss?.();
        dismiss();
      }
    },
  };

  dispatch({ type: 'ADD_TOAST', toast: newToast });

  // Start auto-dismiss timer
  if (duration > 0) {
    startAutoTimer(newToast);
  }

  return { id, dismiss, update };
};

/**
 * Standalone toast function
 *
 * Can be called from anywhere - even outside React components:
 * - Event handlers
 * - Utility functions
 * - API clients
 * - Error handlers
 *
 * @example
 * // Simple usage
 * toast('Operation successful');
 *
 * @example
 * // With type
 * toast('error', 'Something went wrong');
 *
 * @example
 * // Advanced usage
 * toast({
 *   title: 'Success',
 *   description: 'Your changes have been saved',
 *   type: 'success',
 *   duration: 5000
 * });
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
const toast: ToastFunction = (
  input: ToastType | string | (ToastPrimitiveProps & ToastOptions),
  message?: string
): ToastReturn => {
  if (process.env.NODE_ENV === 'development') {
    console.log(
      '[Toast] toast() called with:',
      typeof input === 'string' ? input : input
    );
  }
  const props = normalizeToastProps(input, message);
  return createToast(props);
};

// ============================================================================
// REACT HOOK
// ============================================================================

/**
 * React hook for consuming toast state
 *
 * Industry-standard pub-sub pattern:
 * - Subscribe once on mount
 * - Unsubscribe once on unmount
 * - Uses module-level state for singleton behavior
 * - CSR/SSR safe with proper initialization
 */
export function useToast() {
  // Use React 19.1 useSyncExternalStore for optimal performance
  const state = useSyncExternalStore(
    useMemo(
      () => (callback: () => void) => {
        const listeners = getListeners();
        listeners.push(callback);

        return () => {
          const index = listeners.indexOf(callback);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        };
      },
      []
    ),
    () => getMemoryState(),
    () => getMemoryState() // SSR fallback
  );

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
    pause: (toastId: string) => dispatch({ type: 'PAUSE_TOAST', toastId }),
    resume: (toastId: string) => dispatch({ type: 'RESUME_TOAST', toastId }),
  };
}

/**
 * React hook for consuming toast state
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

/**
 * Exported toast function and duration constants
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export { toast };
