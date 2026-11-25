// packages/components/src/atomic/Calendar/__tests__/CalendarToday.test.tsx

/**
 * @fileoverview "Today" of the calendar is the app's day (owner decision 2026-11-25 T1:
 * one app time zone), not the machine's: `ComponentLocale.timeZone`.
 */

import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ComponentLocaleProvider,
  DEFAULT_COMPONENT_LOCALE,
} from '../../../utils/translator';
import Calendar from '../index';

/** The day number of the cell the calendar marks as today. */
function todayCell(timeZone: string, today?: Date): string | null {
  const { container } = render(
    <ComponentLocaleProvider value={{ ...DEFAULT_COMPONENT_LOCALE, timeZone }}>
      <Calendar mode="single" today={today} />
    </ComponentLocaleProvider>
  );
  return (
    container.querySelector('.dndev-calendar-day-today')?.textContent ?? null
  );
}

describe('Calendar today', () => {
  beforeEach(() => {
    // 2026-11-24 23:30 UTC: already the 25th in Paris, still the 24th in New York
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-24T23:30:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('highlights today in the app time zone, whatever the machine zone', () => {
    expect(todayCell('Europe/Paris')).toBe('25');
    expect(todayCell('America/New_York')).toBe('24');
  });

  it('keeps an explicit today', () => {
    expect(todayCell('Europe/Paris', new Date(2026, 10, 10))).toBe('10');
  });
});
