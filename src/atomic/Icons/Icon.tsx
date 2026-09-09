// packages/components/src/atomic/Icons/Icon.tsx

/**
 * @fileoverview Icon Component
 * @description Tree-shakeable icon component for Lucide icons, emojis, and ReactNode
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { LucideProps } from 'lucide-react';
import { isValidElement } from 'react';
import type { ComponentType, ReactNode } from 'react';

import { cn } from '../../utils/helpers';

/** Props for the Icon component -- renders Lucide icons, string names, or ReactNode. */
export interface IconProps {
  icon?: ComponentType<LucideProps> | string | ReactNode;
  /** Fallback icon when icon prop is missing (same type as icon) */
  fallback?: ComponentType<LucideProps> | string | ReactNode;
  /** Additional className */
  className?: string;
  /** Whether icon should be aria-hidden */
  ariaHidden?: boolean;
}

const Icon: ComponentType<IconProps> = ({
  icon,
  fallback,
  className,
  ariaHidden = false,
}) => {
  const iconToRender = icon || fallback;

  const isEmoji =
    typeof iconToRender === 'string' && !/^[a-zA-Z0-9_-]+$/.test(iconToRender);

  if (!iconToRender) return null;

  const sizeClass = 'dndev-size-md';

  // Type 1: Lucide component (function)
  if (
    typeof iconToRender === 'function' ||
    (typeof iconToRender === 'object' &&
      iconToRender !== null &&
      'render' in iconToRender)
  ) {
    const IconComponent = iconToRender as ComponentType<LucideProps>;
    return (
      <IconComponent
        className={cn(sizeClass, 'dndev-flex-shrink-0', className)}
        aria-hidden={ariaHidden || undefined}
      />
    );
  }

  // Type 2: String (emoji only - no dynamic icon name lookup for tree-shaking)
  if (typeof iconToRender === 'string') {
    if (isEmoji) {
      return (
        <span
          className={cn(
            'dndev-inline-flex dndev-items-center dndev-justify-center',
            sizeClass,
            className
          )}
          aria-hidden={ariaHidden}
        >
          {iconToRender}
        </span>
      );
    }

    // Non-emoji string: Not supported (would require full lucide-react import)
    // Use Icon from @donotdev/ui for dynamic string icon resolution
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `Icon component from @donotdev/components does not support Lucide icon name strings. Use Icon from @donotdev/ui for dynamic string resolution, or import the icon component directly. Received: "${iconToRender}"`
      );
    }
    return null;
  }

  // Type 3: ReactNode (custom content)
  if (isValidElement(iconToRender)) {
    return (
      <span
        className={cn(
          'dndev-inline-flex dndev-items-center dndev-justify-center',
          className
        )}
        aria-hidden={ariaHidden}
      >
        {iconToRender}
      </span>
    );
  }

  // Fallback: render as-is
  return (
    <span
      className={cn(
        'dndev-inline-flex dndev-items-center dndev-justify-center',
        className
      )}
      aria-hidden={ariaHidden}
    >
      {iconToRender}
    </span>
  );
};

export default Icon;
