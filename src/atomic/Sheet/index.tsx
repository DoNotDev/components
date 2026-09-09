// packages/components/src/atomic/Sheet/index.tsx

/**
 * @fileoverview Sheet component
 * @description Accessible sheet (slide-out) component built on Radix UI primitives.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useRef, useId } from 'react';
import type { ComponentProps, ReactNode, RefObject } from 'react';

import { useSwipeToClose } from '../../hooks';
import { SURFACE_VARIANT, type SurfaceVariant } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';
import Button, { BUTTON_VARIANT } from '../Button';

/** Props for the Sheet component -- slide-out panel for sidebars and editing. */
export interface SheetProps extends Omit<
  ComponentProps<typeof DialogPrimitive.Content>,
  'title' | 'children'
> {
  /** The element that opens the sheet */
  trigger?: ReactNode;
  /** The title of the sheet (if not provided, uses visually hidden title for WCAG compliance) */
  title?: string | ReactNode;
  /** The description of the sheet */
  description?: string | ReactNode;
  /** Main content */
  children?: ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether to show the overlay */
  showOverlay?: boolean;
  /**
   * The side of the screen the sheet slides from.
   * @default 'right'
   */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Footer content (pinned at bottom) */
  footer?: ReactNode;
  /** Visual variant of the sheet (uses surface variants: default, muted, primary, secondary, accent, success, warning, destructive) */
  variant?: SurfaceVariant;
  /** Whether to disable swipe-to-close functionality */
  noSwipe?: boolean;
}

/**
 * Accessible sheet (slide-out) component built on Radix UI Dialog.
 * Used for sidebars, mobile navigation, or complex editing panels.
 * WCAG compliant: always includes title (visible or visually hidden) and close button.
 *
 * @component
 * @example
 * ```tsx
 * <Sheet
 *   trigger={<Button>Open Menu</Button>}
 *   title="Navigation"
 *   side="left"
 * >
 *   <NavMenu />
 * </Sheet>
 * ```
 * @param {SheetProps} props - The props for the sheet
 * @returns {JSX.Element} The rendered sheet
 */
const Sheet = ({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
  side = 'right',
  showOverlay = true,
  footer,
  variant,
  className = '',
  noSwipe = false,
  ...contentProps
}: SheetProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const getSwipeDirection = () => {
    switch (side) {
      case 'top':
        return 'down';
      case 'bottom':
        return 'up';
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      default:
        return 'down';
    }
  };

  const { ref, onPointerDown, onPointerMove, onPointerUp, onPointerCancel } =
    useSwipeToClose({
      direction: getSwipeDirection(),
      closeButtonRef: closeButtonRef || undefined,
      onClose: onOpenChange ? () => onOpenChange(false) : undefined,
      enabled: !noSwipe,
    });

  const variantAttrs = getVariantDataAttrs({
    side,
    variant: variant !== SURFACE_VARIANT.DEFAULT ? variant : undefined,
  });

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      )}
      <DialogPrimitive.Portal>
        {showOverlay && <DialogPrimitive.Overlay className="dndev-overlay" />}
        <DialogPrimitive.Content
          ref={ref}
          className={cn('dndev-surface dndev-sheet-content', className)}
          data-side={side}
          onPointerDown={noSwipe ? undefined : onPointerDown}
          onPointerMove={noSwipe ? undefined : onPointerMove}
          onPointerUp={noSwipe ? undefined : onPointerUp}
          onPointerCancel={noSwipe ? undefined : onPointerCancel}
          {...variantAttrs}
          {...contentProps}
        >
          {/* DRAG HANDLE PILL - Shows sheet is draggable (for bottom/top sheets) */}
          {(side === 'bottom' || side === 'top') && !noSwipe && (
            <div className="dndev-sheet-drag-handle" aria-hidden="true" />
          )}

          {/* HEADER - Always Pinned */}
          {title ? (
            <div className="dndev-sheet-header">
              <DialogPrimitive.Title className="dndev-sheet-title">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="dndev-sr-only">
                {description || 'Sheet content'}
              </DialogPrimitive.Description>
              <DialogPrimitive.Close ref={closeButtonRef} asChild>
                <Button
                  variant={BUTTON_VARIANT.GHOST}
                  display="full"
                  icon={X}
                  className="dndev-sheet-close"
                  aria-label="Close sheet"
                />
              </DialogPrimitive.Close>
            </div>
          ) : (
            <>
              <DialogPrimitive.Title className="dndev-sr-only">
                Sheet
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="dndev-sr-only">
                {description || 'Sheet content'}
              </DialogPrimitive.Description>
              <div className="dndev-sheet-header">
                <DialogPrimitive.Close ref={closeButtonRef} asChild>
                  <Button
                    variant={BUTTON_VARIANT.GHOST}
                    display="full"
                    icon={X}
                    className="dndev-sheet-close"
                    aria-label="Close sheet"
                  />
                </DialogPrimitive.Close>
              </div>
            </>
          )}

          {/* BODY - Scrollable Area */}
          <div className="dndev-sheet-body">{children}</div>

          {/* FOOTER - Pinned (Optional) */}
          {footer && <div className="dndev-sheet-footer">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default Sheet;
export { SURFACE_VARIANT as SHEET_VARIANT } from '../../utils/constants';
export type { SurfaceVariant as SheetVariant } from '../../utils/constants';
