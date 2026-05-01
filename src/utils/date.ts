// packages/components/src/utils/date.ts

/**
 * @fileoverview Shared date utilities
 * @description Pure helper functions for date segment components (DatePicker, DateTimePicker).
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DateSegmentType = 'day' | 'month' | 'year';

export interface DateSegmentConfig {
  type: DateSegmentType;
  min: number;
  max: number;
  digits: number;
  placeholder: string;
  ariaLabel: string;
}

export interface DateSegmentValues {
  day: number | null;
  month: number | null;
  year: number | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const DEFAULT_LOCALE = 'fr-FR';

export const DATE_SEGMENT_BASE: Record<
  DateSegmentType,
  Omit<DateSegmentConfig, 'max'>
> = {
  day: { type: 'day', min: 1, digits: 2, placeholder: 'JJ', ariaLabel: 'Jour' },
  month: {
    type: 'month',
    min: 1,
    digits: 2,
    placeholder: 'MM',
    ariaLabel: 'Mois',
  },
  year: {
    type: 'year',
    min: 1,
    digits: 4,
    placeholder: 'AAAA',
    ariaLabel: 'Année',
  },
};

// ---------------------------------------------------------------------------
// Locale
// ---------------------------------------------------------------------------

/** Cache locale info to avoid repeated Intl calls. */
const localeCache = new Map<
  string,
  { order: DateSegmentType[]; separator: string }
>();

/** Get locale-aware segment order and separator via Intl.DateTimeFormat. */
export function getLocaleInfo(locale: string): {
  order: DateSegmentType[];
  separator: string;
} {
  const cached = localeCache.get(locale);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const parts = formatter.formatToParts(new Date(2000, 0, 2));

  const order: DateSegmentType[] = [];
  let separator = '/';

  for (const part of parts) {
    if (part.type === 'day') order.push('day');
    else if (part.type === 'month') order.push('month');
    else if (part.type === 'year') order.push('year');
    else if (part.type === 'literal' && order.length === 1) {
      separator = part.value;
    }
  }

  if (order.length !== 3) {
    const fallback = {
      order: ['day', 'month', 'year'] as DateSegmentType[],
      separator: '/',
    };
    localeCache.set(locale, fallback);
    return fallback;
  }

  const result = { order, separator };
  localeCache.set(locale, result);
  return result;
}

// ---------------------------------------------------------------------------
// Date math
// ---------------------------------------------------------------------------

/** Get the number of days in a given month/year. */
export function getDaysInMonth(
  month: number | null,
  year: number | null
): number {
  if (month == null) return 31;
  const y = year ?? 2000; // Leap year default to be permissive
  return new Date(y, month, 0).getDate();
}

/** Clamp day to the max days in the given month/year. */
export function clampDay(
  day: number,
  month: number | null,
  year: number | null
): number {
  return Math.min(day, getDaysInMonth(month, year));
}

// ---------------------------------------------------------------------------
// Conversion
// ---------------------------------------------------------------------------

/** Normalize string or Date to Date object. */
export function toDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input + 'T00:00:00');
}

/** Format Date as ISO date string (YYYY-MM-DD). */
export function toISODate(d: Date): string {
  const y = String(d.getFullYear()).padStart(4, '0');
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Format Date as ISO datetime-local string (YYYY-MM-DDTHH:MM). */
export function toISODateTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${toISODate(d)}T${h}:${min}`;
}

/** Parse ISO date string to segment values. */
export function parseISODate(iso: string): DateSegmentValues {
  const [y, m, d] = iso.split('T')[0]!.split('-').map(Number);
  return { year: y!, month: m!, day: d! };
}

/** Parse any common date format from pasted text. */
export function parseAnyDate(text: string): Date | null {
  const trimmed = text.trim();

  // ISO: YYYY-MM-DD or YYYY-MM-DDTHH:MM
  const isoMatch = trimmed.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:T(\d{1,2}):(\d{1,2}))?/
  );
  if (isoMatch) {
    const d = new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3]),
      Number(isoMatch[4] ?? 0),
      Number(isoMatch[5] ?? 0)
    );
    if (!isNaN(d.getTime())) return d;
  }

  // European: DD/MM/YYYY or DD.MM.YYYY or DD-MM-YYYY (optionally with HH:MM)
  const euMatch = trimmed.match(
    /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?$/
  );
  if (euMatch) {
    const d = new Date(
      Number(euMatch[3]),
      Number(euMatch[2]) - 1,
      Number(euMatch[1]),
      Number(euMatch[4] ?? 0),
      Number(euMatch[5] ?? 0)
    );
    if (!isNaN(d.getTime())) return d;
  }

  // Last resort: Date.parse
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900) return parsed;

  return null;
}

/** SSR-safe locale resolver. */
export function resolveLocale(locale?: string): string {
  return (
    locale ??
    (typeof navigator !== 'undefined' ? navigator.language : DEFAULT_LOCALE)
  );
}
