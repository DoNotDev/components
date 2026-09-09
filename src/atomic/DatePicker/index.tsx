// packages/components/src/atomic/DatePicker/index.tsx

/**
 * @fileoverview DatePicker component
 * @description Accessible date picker with segmented input (DD/MM/YYYY),
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
  parseISODate,
  resolveLocale,
  toDate,
  toISODate,
} from '../../utils/date';
import type {
  DateSegmentConfig,
  DateSegmentType,
  DateSegmentValues,
} from '../../utils/date';
import { cn } from '../../utils/helpers';
import Calendar from '../Calendar';
import Icon from '../Icons/Icon';
import { FloatingLabel } from '../Label';
import {
  PopoverPrimitive,
  PopoverTrigger,
  PopoverContent,
} from '../Popover/PopoverPrimitive';

import './DatePicker.css';

/** Props for the DatePicker component. */
export interface DatePickerProps {
  /** ISO 8601 date string (YYYY-MM-DD) or null */
  value?: string | null;
  /** Emits ISO string (YYYY-MM-DD) or null */
  onChange?: (date: string | null) => void;
  /** FloatingLabel text */
  label?: string;
  /** Minimum selectable date (ISO string or Date) */
  min?: string | Date;
  /** Maximum selectable date (ISO string or Date) */
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
// Component
// ---------------------------------------------------------------------------

/**
 * Accessible date picker with segmented keyboard input, calendar popover,
 * and automatic mobile native fallback.
 *
 * - Desktop: segmented DD/MM/YYYY input with up/down increment, auto-advance
 * - Mobile: native `<input type="date">` (OS picker is better on touch)
 * - Keyboard: Arrow keys between segments, Up/Down to change values, paste-aware
 * - ARIA: spinbutton pattern per segment, full screen reader support
 *
 * @component
 * @example
 * ```tsx
 * <DatePicker label="Date de naissance" value={date} onChange={setDate} />
 * <DatePicker label="Début" min="2024-01-01" required />
 * ```
 */
function DatePicker({
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
}: DatePickerProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  const resolvedLocale = resolveLocale(locale);
  const { order, separator } = getLocaleInfo(resolvedLocale);

  // Normalize min/max to Date
  const minDate = min ? toDate(min) : undefined;
  const maxDate = max ? toDate(max) : undefined;

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [segments, setSegments] = useState<DateSegmentValues>(() => {
    if (value) return parseISODate(value);
    return { day: null, month: null, year: null };
  });
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [liveText, setLiveText] = useState('');

  // Refs
  const segmentRefs = useRef<(HTMLSpanElement | null)[]>([null, null, null]);
  const typeBuffer = useRef('');
  const containerRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // Sync from controlled value
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (value === undefined) return;
    if (value === null) {
      setSegments({ day: null, month: null, year: null });
    } else {
      setSegments(parseISODate(value));
    }
  }, [value]);

  // ---------------------------------------------------------------------------
  // Segment configs (dynamic max for day based on month/year)
  // ---------------------------------------------------------------------------

  const currentYear = new Date().getFullYear();

  const segmentConfigs: DateSegmentConfig[] = order.map((type) => {
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

  function announceLive(date: Date) {
    setLiveText(
      date.toLocaleDateString(resolvedLocale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }

  function emitISO(segs: DateSegmentValues) {
    if (segs.day != null && segs.month != null && segs.year != null) {
      const clamped = clampDay(segs.day, segs.month, segs.year);
      let date = new Date(segs.year, segs.month - 1, clamped);
      if (minDate && date < minDate) date = minDate;
      if (maxDate && date > maxDate) date = maxDate;
      onChange?.(toISODate(date));
      announceLive(date);
    }
  }

  function commitSegments(newSegs: DateSegmentValues) {
    setSegments(newSegs);
    if (newSegs.day != null && newSegs.month != null && newSegs.year != null) {
      emitISO(newSegs);
    }
  }

  function commitSegment(
    type: DateSegmentType,
    newValue: number | null,
    segIndex: number,
    advance = false
  ) {
    const newSegs = { ...segments, [type]: newValue };

    // Auto-clamp day when month/year changes
    if ((type === 'month' || type === 'year') && newSegs.day != null) {
      newSegs.day = clampDay(newSegs.day, newSegs.month, newSegs.year);
    }

    setSegments(newSegs);

    // Emit if all filled
    if (newSegs.day != null && newSegs.month != null && newSegs.year != null) {
      emitISO(newSegs);
    } else if (
      newValue === null &&
      segments.day != null &&
      segments.month != null &&
      segments.year != null
    ) {
      onChange?.(null);
      setLiveText('');
    }

    if (advance && segIndex < order.length - 1) {
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
      const segType = e.currentTarget.dataset.type as DateSegmentType;
      const config = segmentConfigs.find((c) => c.type === segType);
      if (config) {
        let val = Number(typeBuffer.current);
        if (segType === 'year' && val >= 0 && val <= 99) val += 2000;
        val = Math.max(config.min, Math.min(val, config.max));
        const idx = order.indexOf(segType);
        commitSegment(segType, val, idx);
      }
      typeBuffer.current = '';
    }
  }

  function handleContainerClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('[role="spinbutton"], button'))
      return;
    const firstEmpty = order.findIndex((type) => segments[type] == null);
    const targetIndex = firstEmpty >= 0 ? firstEmpty : 0;
    segmentRefs.current[targetIndex]?.focus();
  }

  // ---------------------------------------------------------------------------
  // Keyboard handling
  // ---------------------------------------------------------------------------

  function handleKeyDown(
    e: KeyboardEvent<HTMLSpanElement>,
    config: DateSegmentConfig,
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
        if (index < order.length - 1) {
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
      const newSegs: DateSegmentValues = {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      };
      commitSegments(newSegs);
    }
  }

  // ---------------------------------------------------------------------------
  // Calendar selection
  // ---------------------------------------------------------------------------

  function handleCalendarSelect(date: Date | undefined) {
    if (date) {
      const newSegs: DateSegmentValues = {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      };
      setSegments(newSegs);
      onChange?.(toISODate(date));
      announceLive(date);
    } else {
      setSegments({ day: null, month: null, year: null });
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
      const [y, m, d] = val.split('-').map(Number);
      const newSegs: DateSegmentValues = { day: d!, month: m!, year: y! };
      setSegments(newSegs);
      onChange?.(val);
    } else {
      setSegments({ day: null, month: null, year: null });
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

  const isoValue = dateValue ? toISODate(dateValue) : '';

  const disabledDays: Array<{ before: Date } | { after: Date }> = [];
  if (minDate) disabledDays.push({ before: minDate });
  if (maxDate) disabledDays.push({ after: maxDate });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const segmentedInput = (
    <div className="dndev-datepicker-custom">
      <PopoverPrimitive open={popoverOpen} onOpenChange={setPopoverOpen} modal>
        <div
          className="dndev-datepicker-field"
          role="group"
          aria-label={label || 'Date'}
          data-bare={label ? true : undefined}
          data-disabled={disabled || undefined}
          data-variant={dataVariant}
          aria-invalid={ariaInvalid || undefined}
          onClick={handleContainerClick}
        >
          <div className="dndev-datepicker-segments">
            {segmentConfigs.map((config, i) => (
              <Fragment key={config.type}>
                {i > 0 && (
                  <span
                    className="dndev-datepicker-separator"
                    aria-hidden="true"
                  >
                    {separator}
                  </span>
                )}
                <span
                  role="spinbutton"
                  tabIndex={disabled ? -1 : 0}
                  aria-valuenow={segments[config.type] ?? undefined}
                  aria-valuemin={config.min}
                  aria-valuemax={config.max}
                  aria-label={config.ariaLabel}
                  data-type={config.type}
                  data-placeholder={segments[config.type] == null || undefined}
                  className="dndev-datepicker-segment"
                  onKeyDown={(e) => handleKeyDown(e, config, i)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onPaste={handlePaste}
                  ref={(el) => {
                    segmentRefs.current[i] = el;
                  }}
                >
                  {segments[config.type] != null
                    ? String(segments[config.type]).padStart(config.digits, '0')
                    : config.placeholder}
                </span>
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
      type="date"
      className="dndev-datepicker-native dndev-input"
      value={isoValue}
      onChange={handleNativeChange}
      min={minDate ? toISODate(minDate) : undefined}
      max={maxDate ? toISODate(maxDate) : undefined}
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
      className={cn('dndev-datepicker', className)}
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

export default DatePicker;
