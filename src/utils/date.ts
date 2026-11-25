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

/** Segment bounds; the placeholder and aria label come from the locale ({@link getSegmentLabels}). */
export const DATE_SEGMENT_BASE: Record<
  DateSegmentType,
  Omit<DateSegmentConfig, 'max' | 'placeholder' | 'ariaLabel'>
> = {
  day: { type: 'day', min: 1, digits: 2 },
  month: { type: 'month', min: 1, digits: 2 },
  year: { type: 'year', min: 1, digits: 4 },
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

/** A date or time segment of the segmented pickers. */
export type SegmentLabelType = DateSegmentType | 'hour' | 'minute';

/** Placeholder and accessible name of one segment, in one locale. */
export interface SegmentLabel {
  /** Shown while the segment is empty ("DD", "JJ", "TT", "年") */
  placeholder: string;
  /** Accessible name ("Day", "Jour", "Tag") */
  ariaLabel: string;
}

const SEGMENT_DIGITS: Record<SegmentLabelType, number> = {
  day: 2,
  month: 2,
  year: 4,
  hour: 2,
  minute: 2,
};

/** Cache: one Intl.DisplayNames lookup per locale. */
const labelCache = new Map<string, Record<SegmentLabelType, SegmentLabel>>();

/**
 * Segment placeholders and accessible names in `locale`, from the locale's own names
 * of the date fields (`Intl.DisplayNames`, type `dateTimeField`): "DD/MM/YYYY" and
 * "Day" in English, "JJ/MM/AAAA" and "Jour" in French, "TT.MM.JJJJ" and "Tag" in
 * German. Latin-script names give the initial repeated to the segment's digits;
 * other scripts show the name once ("年/月/日").
 *
 * @param locale - BCP 47 locale (the UI language)
 * @returns Placeholder and aria label of each segment
 *
 * @example
 * ```ts
 * getSegmentLabels('en').day; // { placeholder: 'DD', ariaLabel: 'Day' }
 * getSegmentLabels('fr').year; // { placeholder: 'AAAA', ariaLabel: 'Année' }
 * ```
 *
 * @version 0.1.0
 * @since 0.3.8
 */
export function getSegmentLabels(
  locale: string
): Record<SegmentLabelType, SegmentLabel> {
  const cached = labelCache.get(locale);
  if (cached) return cached;
  const names = new Intl.DisplayNames([locale], { type: 'dateTimeField' });
  const labels = {} as Record<SegmentLabelType, SegmentLabel>;
  for (const type of Object.keys(SEGMENT_DIGITS) as SegmentLabelType[]) {
    const name = names.of(type) ?? type;
    const initial = name.charAt(0).toLocaleUpperCase(locale);
    labels[type] = {
      placeholder: /\p{Script=Latin}/u.test(initial)
        ? initial.repeat(SEGMENT_DIGITS[type])
        : name,
      ariaLabel: initial + name.slice(1),
    };
  }
  labelCache.set(locale, labels);
  return labels;
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

// ---------------------------------------------------------------------------
// Time zone (the app's zone: ComponentLocale `timeZone`)
// ---------------------------------------------------------------------------

/** Wall-clock parts of a date or date-time (month 1-12). */
export interface WallTimeParts {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
}

/** `Intl.DateTimeFormat` reading wall-clock parts in one zone (one per zone: construction is costly). */
const ZONE_PARTS_FORMATS = new Map<string, Intl.DateTimeFormat>();

/** Wall-clock parts of `instant` in `timeZone`. */
function zonedParts(instant: Date, timeZone: string): Required<WallTimeParts> {
  let format = ZONE_PARTS_FORMATS.get(timeZone);
  if (!format) {
    format = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    ZONE_PARTS_FORMATS.set(timeZone, format);
  }
  const parts: Record<string, number> = {};
  for (const part of format.formatToParts(instant)) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value);
  }
  return {
    year: parts.year!,
    month: parts.month!,
    day: parts.day!,
    hour: parts.hour!,
    minute: parts.minute!,
  };
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * The wall time (`YYYY-MM-DDTHH:MM`, the DateTimePicker value) an instant reads in
 * `timeZone`.
 *
 * @param iso - An instant (ISO string with `Z` or an offset, or a Date)
 * @param timeZone - IANA time zone (the app's: `getAppTimeZone`, ComponentLocale `timeZone`)
 * @returns The wall time, or `''` for an invalid date
 *
 * @example
 * ```ts
 * isoToZonedWallTime('2026-11-24T23:30:00.000Z', 'Europe/Paris'); // '2026-11-25T00:30'
 * ```
 *
 * @version 0.1.0
 * @since 0.3.8
 */
export function isoToZonedWallTime(iso: string | Date, timeZone: string): string {
  const instant = iso instanceof Date ? iso : new Date(iso);
  if (isNaN(instant.getTime())) return '';
  const p = zonedParts(instant, timeZone);
  return `${String(p.year).padStart(4, '0')}-${pad2(p.month)}-${pad2(p.day)}T${pad2(p.hour)}:${pad2(p.minute)}`;
}

/**
 * The instant (ISO, UTC) of a wall time read in `timeZone`: what a picked date-time is
 * stored as. A wall time skipped by a daylight-saving jump moves forward by the jump
 * (02:30 on a spring-forward night is 03:30); a repeated one (clocks back) takes the
 * occurrence after the change (standard time).
 *
 * @param wall - `YYYY-MM-DDTHH:MM` (or `YYYY-MM-DD`: midnight)
 * @param timeZone - IANA time zone (the app's)
 * @returns ISO instant (`toISOString()`), or `null` when `wall` does not parse
 *
 * @example
 * ```ts
 * zonedWallTimeToISO('2026-11-25T00:30', 'Europe/Paris'); // '2026-11-24T23:30:00.000Z'
 * ```
 *
 * @version 0.1.0
 * @since 0.3.8
 */
export function zonedWallTimeToISO(wall: string, timeZone: string): string | null {
  const match = wall
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/);
  if (!match) return null;
  const [, y, mo, d, h = '0', mi = '0'] = match;
  const asUtc = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));
  if (isNaN(asUtc)) return null;
  // Offset of the zone at an instant: its wall time read as UTC, minus the instant
  const offsetAt = (t: number) => {
    const p = zonedParts(new Date(t), timeZone);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - t;
  };
  const before = offsetAt(asUtc);
  const first = asUtc - before;
  const after = offsetAt(first);
  // Same offset: the wall time exists once (or twice: this is the occurrence after the change)
  // Else the wall time is in a spring-forward gap or across the change: the offset before it
  return new Date(after === before ? first : asUtc - after).toISOString();
}

/**
 * The calendar date (`YYYY-MM-DD`, the DatePicker value) of a stored date value: a
 * calendar date as is, an instant as the day it falls on in `timeZone`.
 *
 * @param value - `YYYY-MM-DD`, or an instant (ISO string with time)
 * @param timeZone - IANA time zone (the app's)
 * @returns The calendar date, or `''` for an invalid date
 *
 * @version 0.1.0
 * @since 0.3.8
 */
export function toZonedCalendarDate(value: string, timeZone: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return isoToZonedWallTime(value, timeZone).slice(0, 10);
}

/**
 * Formats wall-clock parts as written, whatever the machine's zone (`timeZone: 'UTC'`
 * on their UTC instant): the date pickers' announcement of the picked value, the same
 * text on the server and in the browser.
 *
 * @param parts - Wall-clock parts (a picker's segments)
 * @param locale - BCP 47 locale (the UI language)
 * @param options - `Intl.DateTimeFormat` options (no `timeZone`)
 * @returns The formatted text
 *
 * @example
 * ```ts
 * formatWallTime({ year: 2026, month: 11, day: 25 }, 'fr', { dateStyle: 'full' }); // 'mercredi 25 novembre 2026'
 * ```
 *
 * @version 0.1.0
 * @since 0.3.8
 */
export function formatWallTime(
  parts: WallTimeParts,
  locale: string,
  options: Omit<Intl.DateTimeFormatOptions, 'timeZone'>
): string {
  const instant = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour ?? 0,
    parts.minute ?? 0
  );
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(
    instant
  );
}
