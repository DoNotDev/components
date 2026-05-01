// packages/components/src/atomic/Toaster/index.tsx

/**
 * @fileoverview Toaster component
 * @description Toast notification toaster component
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import {
  ToastProvider,
  ToastViewport,
  ToastPrimitive as Toast,
  ToastTitle as ToastTitlePrimitive,
  ToastDescription as ToastDescriptionPrimitive,
  ToastClose as ToastClosePrimitive,
  ToastAction as ToastActionPrimitive,
} from './ToastPrimitive';
import { useToast, type ToasterToast } from '../../hooks/useToast';
import Stack from '../Stack';

import type { ComponentProps } from 'react';

/**
 * Toast title component with pattern classes
 */
const ToastTitle = (props: ComponentProps<typeof ToastTitlePrimitive>) => (
  <ToastTitlePrimitive {...props} />
);

/**
 * Toast description component with pattern classes
 */
const ToastDescription = (
  props: ComponentProps<typeof ToastDescriptionPrimitive>
) => <ToastDescriptionPrimitive {...props} />;

/**
 * Toast close button component with pattern classes
 */
const ToastClose = (props: ComponentProps<typeof ToastClosePrimitive>) => (
  <ToastClosePrimitive {...props} />
);

/**
 * Toast action button component with pattern classes
 */
const ToastAction = (props: ComponentProps<typeof ToastActionPrimitive>) => (
  <ToastActionPrimitive className="dndev-interactive" {...props} />
);

function Toaster() {
  const { toasts, pause, resume } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        type,
        // Filter out internal state properties that shouldn't be passed to DOM
        isPaused,
        startTime,
        remainingTime,
        duration,
        ...props
      }: ToasterToast) {
        return (
          <Toast
            key={id}
            toastType={type}
            onMouseEnter={() => pause(id)}
            onMouseLeave={() => resume(id)}
            {...props}
          >
            <Stack gap="tight">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </Stack>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

export default Toaster;
export { ToastProvider, ToastAction };
export type { ToasterToast };
