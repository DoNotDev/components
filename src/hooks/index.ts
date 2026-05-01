// packages/components/src/hooks/index.ts

/**
 * @fileoverview Component Hooks Barrel Exports
 * @description Barrel exports for component hooks. Provides centralized access to all component hooks.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export {
  useToast,
  toast,
  TOAST_DURATIONS,
  type ToastFunction,
} from './useToast';
export type { ToastType } from '../atomic/Toaster/Toast.types';
export * from './useClickOutside';
export * from './useIntersectionObserver';
export * from './useViewportVisibility';
export * from './useSwipeToClose';
