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
import { useState } from 'react';

import {
  CollapsiblePrimitive,
  CollapsibleTrigger,
  CollapsibleContent,
} from './CollapsiblePrimitive';
import { cn } from '../../utils/helpers';
import Stack from '../Stack';

import type { ReactNode } from 'react';

import './Collapsible.css';

/** Props for the Collapsible component. */
export interface CollapsibleProps {
  /** Trigger element (button, text, etc.) */
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
            as="div"
            direction="row"
            align="center"
            justify="between"
            className="dndev-collapsible-trigger"
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

    return <CollapsibleTrigger asChild>{trigger}</CollapsibleTrigger>;
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
