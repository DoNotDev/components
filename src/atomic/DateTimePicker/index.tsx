// packages/components/src/atomic/DateTimePicker/index.tsx

/**
 * @fileoverview DateTimePicker component
 * @description Accessible datetime picker with segmented input (DD/MM/YYYY HH:MM),
 * calendar popover, and automatic mobile native fallback.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { CalendarDays } from 'lucide-react';
import { Fragment, useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ClipboardEvent, Ref } from 'react';

import {
  DATE_SEGMENT_BASE,
  clampDay,
  getDaysInMonth,
  getLocaleInfo,
  parseAnyDate,
  resolveLocale,
  toDate,
  toISODate,
  toISODateTime,
} from '../../utils/date';
import type { DateSegmentType, DateSegmentValues } from '../../utils/date';
import { cn } from '../../utils/helpers';
import Calendar from '../Calendar';
import Icon from '../Icons/Icon';
import { FloatingLabel } from '../Label';
import {
  PopoverPrimitive,
  PopoverTrigger,
  PopoverContent,
} from '../Popover/PopoverPrimitive';

import './DateTimePicker.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SegmentType = DateSegmentType | 'hour' | 'minute';

interface SegmentConfig {
  type: SegmentType;
  min: number;
  max: number;
  digits: number;
  placeholder: string;
  ariaLabel: string;
}

interface SegmentValues extends DateSegmentValues {
  hour: number | null;
  minute: number | null;
}

/** Props for the DateTimePicker component. */
export interface DateTimePickerProps {
  /** ISO 8601 datetime string (YYYY-MM-DDTHH:MM) or null */
  value?: string | null;
  /** Emits ISO datetime string (YYYY-MM-DDTHH:MM) or null */
  onChange?: (datetime: string | null) => void;
  /** FloatingLabel text */
  label?: string;
  /** Minimum selectable datetime (ISO string or Date) */
  min?: string | Date;
  /** Maximum selectable datetime (ISO string or Date) */
  max?: string | Date;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** BCP 47 locale for segment order. Default: navigator.language or 'fr-FR' */
  locale?: string;
  /** Additional CSS classes */
  className?: string;
  /** Element id */
  id?: string;
  /** HTML name attribute for form submission */
  name?: string;
  /** React 19 native ref */
  ref?: Ref<HTMLDivElement>;
  /** ARIA describedby for error/helper association */
  'aria-describedby'?: string;
  /** ARIA invalid for error state */
  'aria-invalid'?: boolean;
  /** data-variant for styling (e.g., 'destructive') */
  'data-variant'?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TIME_SEGMENT_BASE: Record<
  'hour' | 'minute',
  Omit<SegmentConfig, 'max'>
> = {
  hour: {
    type: 'hour',
    min: 0,
    digits: 2,
    placeholder: 'HH',
    ariaLabel: 'Heure',
  },
  minute: {
    type: 'minute',
    min: 0,
    digits: 2,
    placeholder: 'MM',
    ariaLabel: 'Minute',
  },
};

function parseISODateTime(iso: string): SegmentValues {
  const [datePart, timePart] = iso.split('T');
  const [y, m, d] = datePart!.split('-').map(Number);
  let hour = 0;
  let minute = 0;
  if (timePart) {
    const [h, min] = timePart.split(':').map(Number);
    hour = h ?? 0;
    minute = min ?? 0;
  }
  return { year: y!, month: m!, day: d!, hour, minute };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Accessible datetime picker with segmented keyboard input, calendar popover,
 * and automatic mobile native fallback.
 *
 * - Desktop: segmented DD/MM/YYYY HH:MM input with up/down increment, auto-advance
 * - Mobile: native `<input type="datetime-local">` (OS picker is better on touch)
 * - Keyboard: Arrow keys between segments, Up/Down to change values, paste-aware
 * - ARIA: spinbutton pattern per segment, full screen reader support
 *
 * @component
 * @example
 * ```tsx
 * <DateTimePicker label="Début" value={datetime} onChange={setDatetime} />
 * <DateTimePicker label="Événement" min="2024-01-01T00:00" required />
 * ```
 */
function DateTimePicker({
  value,
  onChange,
  label,
  min,
  max,
  required = false,
  disabled = false,
  locale,
  className,
  id: idProp,
  name,
  ref,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'data-variant': dataVariant,
}: DateTimePickerProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  const resolvedLocale = resolveLocale(locale);
  const { order: dateOrder, separator } = getLocaleInfo(resolvedLocale);

  // Full segment order: date segments + time segments
  const allSegments: SegmentType[] = [...dateOrder, 'hour', 'minute'];
  const segmentCount = allSegments.length; // 5

  // Normalize min/max to Date
  const minDate = min ? toDate(min) : undefined;
  const maxDate = max ? toDate(max) : undefined;

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [segments, setSegments] = useState<SegmentValues>(() => {
    if (value) return parseISODateTime(value);
    return { day: null, month: null, year: null, hour: null, minute: null };
  });
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [liveText, setLiveText] = useState('');

  // Refs
  const segmentRefs = useRef<(HTMLSpanElement | null)[]>(
    Array.from({ length: segmentCount }, () => null)
  );
  const typeBuffer = useRef('');
  const containerRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // Sync from controlled value
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (value === undefined) return;
    if (value === null) {
      setSegments({
        day: null,
        month: null,
        year: null,
        hour: null,
        minute: null,
      });
    } else {
      setSegments(parseISODateTime(value));
    }
  }, [value]);

  // ---------------------------------------------------------------------------
  // Segment configs
  // ---------------------------------------------------------------------------

  const currentYear = new Date().getFullYear();

  const segmentConfigs: SegmentConfig[] = allSegments.map((type) => {
    if (type === 'hour') return { ...TIME_SEGMENT_BASE.hour, max: 23 };
    if (type === 'minute') return { ...TIME_SEGMENT_BASE.minute, max: 59 };

    const base = DATE_SEGMENT_BASE[type];
    let segMax: number;
    if (type === 'day') {
      segMax = getDaysInMonth(segments.month, segments.year);
    } else if (type === 'month') {
      segMax = 12;
    } else {
      segMax = maxDate ? maxDate.getFullYear() : currentYear + 10;
    }
    return { ...base, max: segMax };
  });

  // ---------------------------------------------------------------------------
  // Value emission
  // ---------------------------------------------------------------------------

  function isComplete(segs: SegmentValues): boolean {
    return (
      segs.day != null &&
      segs.month != null &&
      segs.year != null &&
      segs.hour != null &&
      segs.minute != null
    );
  }

  function announceLive(date: Date) {
    setLiveText(
      date.toLocaleString(resolvedLocale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }

  function emitISO(segs: SegmentValues) {
    if (!isComplete(segs)) return;
    const clamped = clampDay(segs.day!, segs.month, segs.year);
    let date = new Date(
      segs.year!,
      segs.month! - 1,
      clamped,
      segs.hour!,
      segs.minute!
    );
    if (minDate && date < minDate) date = minDate;
    if (maxDate && date > maxDate) date = maxDate;
    onChange?.(toISODateTime(date));
    announceLive(date);
  }

  function commitSegments(newSegs: SegmentValues) {
    setSegments(newSegs);
    if (isComplete(newSegs)) emitISO(newSegs);
  }

  function commitSegment(
    type: SegmentType,
    newValue: number | null,
    segIndex: number,
    advance = false
  ) {
    const newSegs: SegmentValues = { ...segments, [type]: newValue };

    // Auto-clamp day when month/year changes
    if ((type === 'month' || type === 'year') && newSegs.day != null) {
      newSegs.day = clampDay(newSegs.day, newSegs.month, newSegs.year);
    }

    setSegments(newSegs);

    if (isComplete(newSegs)) {
      emitISO(newSegs);
    } else if (newValue === null && isComplete(segments)) {
      onChange?.(null);
      setLiveText('');
    }

    if (advance && segIndex < segmentCount - 1) {
      typeBuffer.current = '';
      segmentRefs.current[segIndex + 1]?.focus();
    }
  }

  // ---------------------------------------------------------------------------
  // Focus management
  // ---------------------------------------------------------------------------

  function handleFocus() {
    typeBuffer.current = '';
  }

  function handleBlur(e: React.FocusEvent<HTMLSpanElement>) {
    if (typeBuffer.current) {
      const segType = e.currentTarget.dataset.type as SegmentType;
      const config = segmentConfigs.find((c) => c.type === segType);
      if (config) {
        let val = Number(typeBuffer.current);
        if (segType === 'year' && val >= 0 && val <= 99) val += 2000;
        val = Math.max(config.min, Math.min(val, config.max));
        const idx = allSegments.indexOf(segType);
        commitSegment(segType, val, idx);
      }
      typeBuffer.current = '';
    }
  }

  function handleContainerClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('[role="spinbutton"], button'))
      return;
    const firstEmpty = allSegments.findIndex((type) => segments[type] == null);
    const targetIndex = firstEmpty >= 0 ? firstEmpty : 0;
    segmentRefs.current[targetIndex]?.focus();
  }

  // ---------------------------------------------------------------------------
  // Keyboard handling
  // ---------------------------------------------------------------------------

  function handleKeyDown(
    e: KeyboardEvent<HTMLSpanElement>,
    config: SegmentConfig,
    index: number
  ) {
    const { type, min: segMin, max: segMax, digits } = config;
    const currentValue = segments[type];

    switch (e.key) {
      case 'ArrowUp': {
        e.preventDefault();
        typeBuffer.current = '';
        const next =
          currentValue == null
            ? segMin
            : currentValue >= segMax
              ? segMin
              : currentValue + 1;
        commitSegment(type, next, index);
        break;
      }

      case 'ArrowDown': {
        e.preventDefault();
        typeBuffer.current = '';
        const next =
          currentValue == null
            ? segMax
            : currentValue <= segMin
              ? segMax
              : currentValue - 1;
        commitSegment(type, next, index);
        break;
      }

      case 'ArrowRight': {
        e.preventDefault();
        if (index < segmentCount - 1) {
          typeBuffer.current = '';
          segmentRefs.current[index + 1]?.focus();
        }
        break;
      }

      case 'ArrowLeft': {
        e.preventDefault();
        if (index > 0) {
          typeBuffer.current = '';
          segmentRefs.current[index - 1]?.focus();
        }
        break;
      }

      case 'Home': {
        e.preventDefault();
        typeBuffer.current = '';
        commitSegment(type, segMin, index);
        break;
      }

      case 'End': {
        e.preventDefault();
        typeBuffer.current = '';
        commitSegment(type, segMax, index);
        break;
      }

      case 'Backspace': {
        e.preventDefault();
        typeBuffer.current = '';
        commitSegment(type, null, index);
        if (index > 0) {
          segmentRefs.current[index - 1]?.focus();
        }
        break;
      }

      case 'Delete': {
        e.preventDefault();
        typeBuffer.current = '';
        commitSegment(type, null, index);
        break;
      }

      case 'Tab': {
        if (typeBuffer.current) {
          let val = Number(typeBuffer.current);
          if (type === 'year' && val >= 0 && val <= 99) val += 2000;
          val = Math.max(segMin, Math.min(val, segMax));
          commitSegment(type, val, index);
          typeBuffer.current = '';
        }
        break;
      }

      default: {
        if (e.key >= '0' && e.key <= '9') {
          e.preventDefault();
          const buffer = typeBuffer.current + e.key;
          const num = Number(buffer);

          if (buffer.length >= digits) {
            const clamped = Math.max(segMin, Math.min(num, segMax));
            typeBuffer.current = '';
            commitSegment(type, clamped, index, true);
          } else if (num * 10 > segMax) {
            const clamped = Math.max(segMin, Math.min(num, segMax));
            typeBuffer.current = '';
            commitSegment(type, clamped, index, true);
          } else {
            typeBuffer.current = buffer;
            e.currentTarget.textContent = buffer;
          }
        }
        break;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Paste handling
  // ---------------------------------------------------------------------------

  function handlePaste(e: ClipboardEvent<HTMLSpanElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const date = parseAnyDate(text);
    if (date) {
      const newSegs: SegmentValues = {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        hour: date.getHours(),
        minute: date.getMinutes(),
      };
      commitSegments(newSegs);
    }
  }

  // ---------------------------------------------------------------------------
  // Calendar selection (sets date part, preserves time)
  // ---------------------------------------------------------------------------

  function handleCalendarSelect(date: Date | undefined) {
    if (date) {
      const newSegs: SegmentValues = {
        ...segments,
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        // Preserve existing time or default to 00:00
        hour: segments.hour ?? 0,
        minute: segments.minute ?? 0,
      };
      setSegments(newSegs);
      if (isComplete(newSegs)) {
        const full = new Date(
          newSegs.year!,
          newSegs.month! - 1,
          newSegs.day!,
          newSegs.hour!,
          newSegs.minute!
        );
        onChange?.(toISODateTime(full));
        announceLive(full);
      }
    } else {
      setSegments({
        day: null,
        month: null,
        year: null,
        hour: null,
        minute: null,
      });
      onChange?.(null);
      setLiveText('');
    }
    setPopoverOpen(false);
  }

  // ---------------------------------------------------------------------------
  // Native input handler (mobile)
  // ---------------------------------------------------------------------------

  function handleNativeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val) {
      // Native datetime-local gives YYYY-MM-DDTHH:MM
      const newSegs = parseISODateTime(val);
      setSegments(newSegs);
      onChange?.(val);
    } else {
      setSegments({
        day: null,
        month: null,
        year: null,
        hour: null,
        minute: null,
      });
      onChange?.(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Computed values
  // ---------------------------------------------------------------------------

  const dateValue =
    segments.day != null && segments.month != null && segments.year != null
      ? new Date(segments.year, segments.month - 1, segments.day)
      : undefined;

  const fullValue = isComplete(segments)
    ? new Date(
        segments.year!,
        segments.month! - 1,
        segments.day!,
        segments.hour!,
        segments.minute!
      )
    : undefined;

  const isoValue = fullValue ? toISODateTime(fullValue) : '';

  const disabledDays: Array<{ before: Date } | { after: Date }> = [];
  if (minDate) disabledDays.push({ before: minDate });
  if (maxDate) disabledDays.push({ after: maxDate });

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  function renderSegment(config: SegmentConfig, index: number) {
    return (
      <span
        key={config.type}
        role="spinbutton"
        tabIndex={disabled ? -1 : 0}
        aria-valuenow={segments[config.type] ?? undefined}
        aria-valuemin={config.min}
        aria-valuemax={config.max}
        aria-label={config.ariaLabel}
        data-type={config.type}
        data-placeholder={segments[config.type] == null || undefined}
        className="dndev-datepicker-segment"
        onKeyDown={(e) => handleKeyDown(e, config, index)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPaste={handlePaste}
        ref={(el) => {
          segmentRefs.current[index] = el;
        }}
      >
        {segments[config.type] != null
          ? String(segments[config.type]).padStart(config.digits, '0')
          : config.placeholder}
      </span>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Split configs into date and time groups
  const dateConfigs = segmentConfigs.slice(0, dateOrder.length);
  const timeConfigs = segmentConfigs.slice(dateOrder.length);
  const dateStartIndex = 0;
  const timeStartIndex = dateOrder.length;

  const segmentedInput = (
    <div className="dndev-datetimepicker-custom">
      <PopoverPrimitive open={popoverOpen} onOpenChange={setPopoverOpen} modal>
        <div
          className="dndev-datepicker-field dndev-datetimepicker-field"
          role="group"
          aria-label={label || 'Date et heure'}
          data-bare={label ? true : undefined}
          data-disabled={disabled || undefined}
          data-variant={dataVariant}
          aria-invalid={ariaInvalid || undefined}
          onClick={handleContainerClick}
        >
          <div className="dndev-datepicker-segments">
            {/* Date segments */}
            {dateConfigs.map((config, i) => (
              <Fragment key={config.type}>
                {i > 0 && (
                  <span
                    className="dndev-datepicker-separator"
                    aria-hidden="true"
                  >
                    {separator}
                  </span>
                )}
                {renderSegment(config, dateStartIndex + i)}
              </Fragment>
            ))}

            {/* Date/Time separator */}
            <span className="dndev-datetimepicker-spacer" aria-hidden="true" />

            {/* Time segments */}
            {timeConfigs.map((config, i) => (
              <Fragment key={config.type}>
                {i > 0 && (
                  <span
                    className="dndev-datepicker-separator"
                    aria-hidden="true"
                  >
                    :
                  </span>
                )}
                {renderSegment(config, timeStartIndex + i)}
              </Fragment>
            ))}
          </div>

          <PopoverTrigger asChild>
            <button
              type="button"
              className="dndev-datepicker-calendar-btn dndev-inline-action-btn"
              disabled={disabled}
              aria-label="Ouvrir le calendrier"
              tabIndex={disabled ? -1 : 0}
            >
              <Icon icon={CalendarDays} className="dndev-size-md" ariaHidden />
            </button>
          </PopoverTrigger>
        </div>

        <PopoverContent
          align="end"
          sideOffset={4}
          className="dndev-floating dndev-datepicker-popover"
          onCloseAutoFocus={(e: Event) => {
            e.preventDefault();
            segmentRefs.current[0]?.focus();
          }}
        >
          <Calendar
            {...{
              mode: 'single' as const,
              selected: dateValue,
              onSelect: handleCalendarSelect,
              defaultMonth: dateValue ?? minDate,
              ...(disabledDays.length > 0 ? { disabled: disabledDays } : {}),
              ...(minDate
                ? {
                    startMonth: new Date(
                      minDate.getFullYear(),
                      minDate.getMonth()
                    ),
                  }
                : {}),
              ...(maxDate
                ? {
                    endMonth: new Date(
                      maxDate.getFullYear(),
                      maxDate.getMonth()
                    ),
                  }
                : {}),
            }}
          />
        </PopoverContent>
      </PopoverPrimitive>
    </div>
  );

  const nativeInput = (
    <input
      type="datetime-local"
      className="dndev-datepicker-native dndev-input"
      value={isoValue}
      onChange={handleNativeChange}
      min={minDate ? toISODateTime(minDate) : undefined}
      max={maxDate ? toISODateTime(maxDate) : undefined}
      required={required}
      disabled={disabled}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid || undefined}
    />
  );

  const content = (
    <div
      ref={ref ?? containerRef}
      id={id}
      className={cn('dndev-datepicker dndev-datetimepicker', className)}
      aria-describedby={ariaDescribedBy}
      data-disabled={disabled || undefined}
    >
      {segmentedInput}
      {nativeInput}
      {name && <input type="hidden" name={name} value={isoValue} />}
      <div className="dndev-datepicker-live" role="status" aria-live="polite">
        {liveText}
      </div>
    </div>
  );

  if (label) {
    return (
      <FloatingLabel
        htmlFor={id}
        label={label}
        disabled={disabled}
        required={required}
      >
        {content}
      </FloatingLabel>
    );
  }

  return content;
}

export default DateTimePicker;
