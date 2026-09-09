// packages/components/src/atomic/ButtonGroup/index.tsx

/**
 * @fileoverview ButtonGroup component
 * @description Visual grouping of buttons with joined borders. Supports horizontal and vertical
 * orientation, variant/size propagation, and both items-based and children-based APIs.
 * NOT a toggle group — no state management.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

import { cn, getVariantDataAttrs } from '../../utils/helpers';
import Button from '../Button';
import type { ButtonVariant } from '../Button';

import './ButtonGroup.css';

/** Single item within a ButtonGroup. */
export interface ButtonGroupItem {
  /** Unique key for the item */
  key: string;
  /** Button label text */
  label?: string;
  /** Icon — Lucide component, string name, or ReactNode */
  icon?: ButtonProps['icon'];
  /** Override variant for this specific item */
  variant?: ButtonVariant;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state for this item */
  disabled?: boolean;
  /** aria-label for icon-only buttons */
  'aria-label'?: string;
}

// Re-use Button's icon type
type ButtonProps = React.ComponentProps<typeof Button>;

/** Props for the ButtonGroup component -- visual grouping of buttons with joined borders. */
export interface ButtonGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'role'
> {
  /**
   * Items API — array of button definitions.
   * For 90% use cases. Each item renders as a Button.
   */
  items?: ButtonGroupItem[];
  /**
   * Children API — render raw Button/ActionButton elements.
   * Power-user escape hatch when items API is insufficient.
   */
  children?: ReactNode;
  /**
   * Visual variant propagated to all items.
   * Individual items can override via their own variant prop.
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * Orientation of the group.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Whether all buttons in the group are disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * Accessible label for the group.
   * Required — describes the purpose of the button group.
   */
  'aria-label': string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Visual grouping of buttons with joined borders and shared radius.
 * NOT a toggle group — provides no selection state.
 *
 * Uses `role="group"` with `aria-label` for accessibility.
 * Each button remains an independent tab stop.
 *
 * @component
 * @example
 * ```tsx
 * // Items API (recommended)
 * <ButtonGroup
 *   aria-label="Text formatting"
 *   variant="outline"
 *   items={[
 *     { key: 'bold', label: 'Bold', icon: Bold },
 *     { key: 'italic', label: 'Italic', icon: Italic },
 *     { key: 'underline', label: 'Underline', icon: Underline },
 *   ]}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Children API
 * <ButtonGroup aria-label="Actions" orientation="vertical">
 *   <Button variant="primary" onClick={handleSave}>Save</Button>
 *   <Button variant="outline" onClick={handleCancel}>Cancel</Button>
 * </ButtonGroup>
 * ```
 *
 * @param {ButtonGroupProps} props - The props for the button group
 * @returns {JSX.Element} The rendered button group
 */
const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(
    {
      className,
      variant = 'primary',
      orientation = 'horizontal',
      disabled = false,
      items,
      children,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) {
    const variantAttrs = getVariantDataAttrs({ variant });

    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        aria-orientation={orientation}
        aria-disabled={disabled || undefined}
        data-orientation={orientation}
        className={cn('dndev-button-group', className)}
        {...variantAttrs}
        {...props}
      >
        {children}
        {items &&
          items.map((item) => (
            <Button
              key={item.key}
              variant={item.variant ?? variant}
              icon={item.icon}
              onClick={item.onClick}
              disabled={item.disabled ?? disabled}
              aria-label={item['aria-label']}
            >
              {item.label}
            </Button>
          ))}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
