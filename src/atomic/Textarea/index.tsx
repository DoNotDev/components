// packages/components/src/atomic/Textarea/index.tsx

/**
 * @fileoverview Textarea component
 * @description Accessible textarea component with mobile-friendly touch targets
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { forwardRef } from 'react';

import { cn } from '../../utils/helpers';

import type { ComponentPropsWithRef } from 'react';

/** Props for the Textarea component. */
export interface TextareaProps extends ComponentPropsWithRef<'textarea'> {
  /**
   * Bare mode - no border/shadow (for use inside FloatingLabel or custom wrappers)
   */
  bare?: boolean;
}

/**
 * Textarea component with ref forwarding.
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, bare, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn('dndev-input', className)}
        data-bare={bare || undefined}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
