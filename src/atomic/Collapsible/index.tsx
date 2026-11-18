// packages/components/src/atomic/Collapsible/index.tsx

/**
 * @fileoverview Collapsible component
 * @description Interactive component for expanding/collapsing content built on Radix UI primitives.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { CirclePlus, CircleMinus, ChevronDown } from 'lucide-react';
import { Fragment, isValidElement, useState } from 'react';
import type { ReactNode } from 'react';

import {
  CollapsiblePrimitive,
  CollapsibleTrigger,
  CollapsibleContent,
} from './CollapsiblePrimitive';
import { cn } from '../../utils/helpers';
import Stack from '../Stack';

import './Collapsible.css';

/** Props for the Collapsible component. */
export interface CollapsibleProps {
  /**
   * Trigger content. Without `showIcon`, a single element (e.g. `<Button>`)
   * becomes the trigger itself; anything else (string, number, fragment) is
   * wrapped in the primitive's own `<button>`. With `showIcon`, the component
   * renders the `<button>` and `trigger` is its label: pass text or inline
   * content (`<Text as="span">`), never a `<Button>` or block element.
   */
  trigger?: ReactNode;
  /** Collapsible content */
  children?: ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Whether the collapsible is disabled */
  disabled?: boolean;
  /**
   * Show icon indicator (Plus/Minus or ChevronDown)
   * @default false
   */
  showIcon?: boolean;
  /**
   * Icon style: 'plus-minus' or 'chevron'
   * @default 'plus-minus'
   */
  iconStyle?: 'plus-minus' | 'chevron';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Accessible collapsible component.
 * Expands and collapses content with smooth animations.
 *
 * @component
 * @example
 * ```tsx
 * <Collapsible trigger={<Button>Toggle details</Button>}>
 *   <Section title="Details" description="Hidden content here" />
 * </Collapsible>
 * ```
 * @param {CollapsibleProps} props - The props for the collapsible
 * @returns {JSX.Element} The rendered collapsible
 */
function Collapsible({
  trigger,
  children,
  open,
  onOpenChange,
  defaultOpen,
  disabled,
  showIcon = false,
  iconStyle = 'plus-minus',
  className,
}: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(() => defaultOpen || false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const handleOpenChange = isControlled
    ? onOpenChange
    : (newOpen: boolean) => {
        setInternalOpen(newOpen);
        onOpenChange?.(newOpen);
      };

  const renderTrigger = () => {
    if (!trigger) return null;

    if (showIcon) {
      const IconComponent =
        iconStyle === 'chevron'
          ? ChevronDown
          : isOpen
            ? CircleMinus
            : CirclePlus;

      return (
        <CollapsibleTrigger asChild>
          <Stack
            as="button"
            direction="row"
            align="center"
            justify="between"
            className="dndev-collapsible-trigger dndev-collapsible-trigger--button"
          >
            {trigger}
            {iconStyle === 'chevron' ? (
              <ChevronDown
                className="dndev-collapsible-icon dndev-collapsible-chevron"
                aria-hidden="true"
              />
            ) : (
              <IconComponent
                className="dndev-collapsible-icon"
                aria-hidden="true"
              />
            )}
          </Stack>
        </CollapsibleTrigger>
      );
    }

    // asChild needs one element to merge props into; a string or fragment
    // has none, so it gets Radix's default <button> instead.
    if (isValidElement(trigger) && trigger.type !== Fragment) {
      return <CollapsibleTrigger asChild>{trigger}</CollapsibleTrigger>;
    }

    return (
      <CollapsibleTrigger className="dndev-collapsible-trigger dndev-collapsible-trigger--button">
        {trigger}
      </CollapsibleTrigger>
    );
  };

  return (
    <CollapsiblePrimitive
      open={isControlled ? open : undefined}
      onOpenChange={handleOpenChange}
      defaultOpen={isControlled ? undefined : defaultOpen}
      disabled={disabled}
      className={cn('dndev-collapsible', className)}
    >
      {renderTrigger()}
      <CollapsibleContent
        className={cn('dndev-collapsible-content', className)}
      >
        {children}
      </CollapsibleContent>
    </CollapsiblePrimitive>
  );
}

export default Collapsible;
