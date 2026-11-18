'use client';

import { Ellipsis, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../utils/helpers';
import './SwipeAction.css';

/** Localized, non-destructive reveal controls for a trailing destructive action. */
export interface SwipeActionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAction'> {
  children: ReactNode;
  onAction: () => void;
  actionLabel: string;
  revealLabel: string;
  closeLabel: string;
  disabled?: boolean;
}

/** Native scrolling only reveals; destruction requires explicit button activation. */
export default function SwipeAction({
  children, onAction, actionLabel, revealLabel, closeLabel, disabled = false,
  className, onKeyDown, ...props
}: SwipeActionProps) {
  const [open, setOpen] = useState(false);
  const actionId = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const revealed = open && !disabled;

  function reveal(next: boolean) {
    const element = viewport.current;
    if (!element) return;
    // Instant programmatic scrolling keeps the explicit trash action immediately
    // usable, independent of motion preferences and native snap animations.
    element.scrollLeft = next
      ? (getComputedStyle(element).direction === 'rtl' ? -1 : 1) * (element.scrollWidth - element.clientWidth)
      : 0;
    setOpen(next);
  }

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    // Trackpads/wheels are not a touch swipe, including on hybrid computers.
    // Vertical wheel scrolling and browser zoom remain native.
    const excludeWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && (event.deltaX !== 0 || event.shiftKey) && event.cancelable) event.preventDefault();
    };
    element.addEventListener('wheel', excludeWheel, { passive: false });
    return () => element.removeEventListener('wheel', excludeWheel);
  }, []);

  useEffect(() => {
    if (disabled) reveal(false);
  }, [disabled]);

  return (
    <div
      {...props}
      className={cn('dndev-swipe-action', className)}
      data-open={revealed ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented && event.key === 'Escape') {
          const element = viewport.current;
          if (revealed || (element && element.scrollLeft !== 0)) {
            event.preventDefault();
            reveal(false);
            toggle.current?.focus();
          }
        }
      }}
    >
      <div
        ref={viewport}
        className="dndev-swipe-action-viewport"
        onPointerDown={(event) => {
          // Native mouse selection must not turn into a drag-to-reveal. Pen
          // panning is excluded too; actual touch still works on hybrid devices.
          event.currentTarget.toggleAttribute('data-input-blocked', event.pointerType !== 'touch');
        }}
        onScroll={(event) => {
          const element = event.currentTarget;
          const end = element.scrollWidth - element.clientWidth;
          setOpen(!disabled && end > 0 && Math.abs(element.scrollLeft) >= end - 1);
        }}
      >
        <div
          className="dndev-swipe-action-content"
          onFocusCapture={() => reveal(false)}
        >
          {children}
        </div>
        <button
          id={actionId}
          type="button"
          className="dndev-swipe-action-delete"
          aria-hidden={!revealed}
          inert={!revealed}
          tabIndex={revealed ? 0 : -1}
          disabled={disabled || !revealed}
          onClick={() => {
            if (!revealed || disabled) return;
            reveal(false);
            toggle.current?.focus();
            onAction();
          }}
        >
          <Trash2 aria-hidden="true" focusable="false" />
          <span>{actionLabel}</span>
        </button>
      </div>
      <button
        ref={toggle}
        type="button"
        className="dndev-swipe-action-toggle"
        aria-label={revealed ? closeLabel : revealLabel}
        aria-expanded={revealed}
        aria-controls={actionId}
        disabled={disabled}
        onClick={() => reveal(!revealed)}
      >
        <Ellipsis aria-hidden="true" focusable="false" />
      </button>
    </div>
  );
}
