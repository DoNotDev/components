'use client';
// packages/components/src/atomic/Calendar/LazyCalendar.tsx

/**
 * @fileoverview LazyCalendar component
 * @description The Calendar (react-day-picker + date-fns) loaded on demand, for
 * pickers that show it only in a popover: a page with a date field no longer loads
 * the calendar up front. It loads when the browser is idle after a picker mounts
 * (`useIdlePreloadCalendar`, once per page), on intent (`preloadCalendar` on trigger
 * hover / focus) or on open, so the placeholder (the calendar's footprint) is rarely
 * seen. A chunk that fails to load shows `errorLabel` inside the popover; the rest of
 * the form keeps working. Never used for content the server renders.
 *
 * @version 0.2.0
 * @since 0.3.1
 * @author AMBROISE PARK Consulting
 */

import { Component, lazy, Suspense, useEffect } from 'react';
import type { ReactNode } from 'react';

import { componentLabel, useComponentTranslate } from '../../utils/translator';

import type { CalendarProps } from './index';

const loadCalendar = () => import('./index');

const Calendar = lazy(loadCalendar);

/** Idle preload already scheduled on this page. */
let idlePreloadScheduled = false;

/**
 * Start loading the calendar chunk (idempotent). Pickers call it when the visitor
 * points at or focuses the calendar trigger. A failed load is not lost: opening the
 * calendar loads it again and LazyCalendar shows the error there.
 *
 * @version 0.2.0
 * @since 0.3.1
 * @author AMBROISE PARK Consulting
 */
export function preloadCalendar(): void {
  // Rejection handled here (no unhandled rejection); the open popover reports it
  loadCalendar().catch(() => undefined);
}

/**
 * Preload the calendar once per page when the browser is idle after a picker mounts
 * (`requestIdleCallback` where the browser has it): a touch visitor, whose first
 * pointer event is the tap itself, gets the calendar without waiting.
 *
 * @version 0.1.0
 * @since 0.3.1
 * @author AMBROISE PARK Consulting
 */
export function useIdlePreloadCalendar(): void {
  useEffect(() => {
    if (
      idlePreloadScheduled ||
      typeof window.requestIdleCallback !== 'function'
    )
      return;
    idlePreloadScheduled = true;
    window.requestIdleCallback(preloadCalendar);
  }, []);
}

interface CalendarLoadBoundaryProps {
  errorLabel: string;
  children: ReactNode;
}

/** Shows `errorLabel` in place of the calendar when its chunk fails to load. */
class CalendarLoadBoundary extends Component<
  CalendarLoadBoundaryProps,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="dndev-calendar dndev-calendar-error" role="alert">
          {this.props.errorLabel}
        </div>
      );
    }
    return this.props.children;
  }
}

/** Props for LazyCalendar: Calendar props plus the load-error text. */
export type LazyCalendarProps = CalendarProps & {
  /**
   * Text shown in the popover when the calendar cannot be loaded.
   * @default `dndev` key `datePicker.calendarLoadError` (ComponentLocaleProvider)
   */
  errorLabel?: string;
};

/**
 * Calendar loaded on first render, with a placeholder of the calendar's size and a
 * visible error when the chunk cannot be loaded.
 *
 * @param props - Calendar props plus `errorLabel`
 *
 * @version 0.2.0
 * @since 0.3.1
 * @author AMBROISE PARK Consulting
 */
export default function LazyCalendar({
  errorLabel,
  ...props
}: LazyCalendarProps) {
  const translate = useComponentTranslate();
  return (
    <CalendarLoadBoundary
      errorLabel={componentLabel(
        translate,
        errorLabel,
        'datePicker.calendarLoadError'
      )}
    >
      <Suspense
        fallback={
          <div
            className="dndev-calendar dndev-control dndev-calendar-fallback"
            aria-busy
          />
        }
      >
        <Calendar {...props} />
      </Suspense>
    </CalendarLoadBoundary>
  );
}
