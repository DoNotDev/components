// packages/components/src/atomic/Tag/index.tsx

/**
 * @fileoverview Tag component
 * @description Interactive tag component for categorization and filters
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../utils/helpers';
import Icon from '../Icons/Icon';
import './Tag.css';

export const TAG_VARIANT = {
  DEFAULT: 'default',
  OUTLINE: 'outline',
  ACCENT: 'accent',
} as const;

const tagVariants = cva('dndev-tag', {
  variants: {
    variant: {
      [TAG_VARIANT.DEFAULT]: '',
      [TAG_VARIANT.OUTLINE]: 'dndev-tag-outline',
      [TAG_VARIANT.ACCENT]: 'dndev-tag-accent',
    },
    size: {
      sm: 'dndev-tag-sm',
      md: 'dndev-tag-md',
      lg: 'dndev-tag-lg',
    },
  },
  defaultVariants: {
    variant: TAG_VARIANT.DEFAULT,
    size: 'md',
  },
});

/** Props for the Tag component -- interactive tag for categorization and filtering. */
export interface TagProps
  extends
    Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'>,
    VariantProps<typeof tagVariants> {
  children: ReactNode;
  /** Whether the tag is interactive (clickable) */
  interactive?: boolean;
  /** Callback when tag is clicked */
  onClick?: () => void;
  /** Callback when remove button is clicked */
  onRemove?: () => void;
  /** Whether the tag is disabled */
  disabled?: boolean;
}

/**
 * Interactive Tag component.
 * distinct from Badge: Tag is for interaction/categorization/filtering.
 * Badge is for static status.
 *
 * @component
 * @example
 * ```tsx
 * <Tag onRemove={handleRemove}>React</Tag>
 * <Tag interactive onClick={handleSelect}>Filter</Tag>
 * ```
 */
const Tag = ({
  children,
  variant,
  size,
  interactive,
  onClick,
  onRemove,
  disabled,
  className,
  ...props
}: TagProps) => {
  const isInteractive = interactive || !!onClick;

  return (
    <span
      className={cn(
        tagVariants({ variant, size }),
        isInteractive && 'dndev-tag-interactive',
        disabled && 'dndev-tag-disabled',
        className
      )}
      onClick={!disabled && isInteractive ? onClick : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive && !disabled ? 0 : undefined}
      aria-disabled={disabled}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          className="dndev-tag-remove"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onRemove();
          }}
          aria-label="Remove"
          disabled={disabled}
        >
          <Icon icon={X} className="dndev-tag-remove-icon" />
        </button>
      )}
    </span>
  );
};

export default Tag;
export { tagVariants };
