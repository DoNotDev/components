// packages/components/src/atomic/Calendar/index.tsx

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DropdownProps, ChevronProps } from 'react-day-picker';

import { CalendarPrimitive } from './CalendarPrimitive';
import { cn } from '../../utils/helpers';
import Button from '../Button';
import DropdownMenu from '../DropdownMenu';
import type { CalendarPrimitiveProps } from './CalendarPrimitive';
import { DropdownMenuItemPrimitive } from '../DropdownMenu/DropdownMenuPrimitive';
import Icon from '../Icons/Icon';

/** Props for the Calendar component -- wraps react-day-picker with DoNotDev theming. */
export type CalendarProps = CalendarPrimitiveProps;

function CalendarChevron(props: ChevronProps) {
  const icon = props.orientation === 'left' ? ChevronLeft : ChevronRight;
  return <Icon icon={icon} className={props.className} />;
}

function CalendarDropdown({
  options = [],
  value,
  onChange,
  'aria-label': ariaLabel,
}: DropdownProps) {
  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value)
  );

  const isMonth = options.length === 12;
  const isYear = !isMonth;

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMonth ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)',
    gap: 'var(--gap-sm)',
    padding: '0',
  };

  const handleSelect = (newValue: string) => {
    onChange?.({
      target: { value: newValue },
    } as unknown as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <DropdownMenu
      trigger={
        <Button
          variant="outline"
          className="dndev-calendar-dropdown-trigger dndev-interactive"
          aria-label={ariaLabel}
        >
          {selectedOption?.label || value}
        </Button>
      }
      contentWidth={isYear ? '300px' : 'auto'}
      contentAlign="center"
    >
      <div
        className="dndev-calendar-dropdown-grid"
        style={isYear ? { maxHeight: '300px', overflowY: 'auto' } : undefined}
      >
        <div style={gridStyle}>
          {options.map((option) => (
            <DropdownMenuItemPrimitive
              key={option.value}
              className={cn(
                'dndev-interactive dndev-justify-center dndev-text-center',
                String(option.value) === String(value) &&
                  'dndev-calendar-dropdown-selected'
              )}
              data-selected={
                String(option.value) === String(value) ? 'true' : undefined
              }
              style={{
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                padding: 'var(--gap-sm)',
              }}
              onSelect={() => handleSelect(String(option.value))}
              disabled={option.disabled}
            >
              {option.label}
            </DropdownMenuItemPrimitive>
          ))}
        </div>
      </div>
    </DropdownMenu>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  weekStartsOn = 1,
  captionLayout = 'dropdown',
  startMonth,
  endMonth,
  ...props
}: CalendarProps) {
  const currentYear = new Date().getFullYear();
  const defaultStartMonth = startMonth || new Date(currentYear - 10, 0);
  const defaultEndMonth = endMonth || new Date(currentYear + 10, 11);
  return (
    <CalendarPrimitive
      showOutsideDays={showOutsideDays}
      weekStartsOn={weekStartsOn}
      captionLayout={captionLayout}
      startMonth={defaultStartMonth}
      endMonth={defaultEndMonth}
      className={cn('dndev-calendar dndev-control', className)}
      classNames={{
        months: cn('dndev-calendar-months', classNames?.months),
        month: cn('dndev-calendar-month', classNames?.month),
        caption: cn('dndev-calendar-caption', classNames?.caption),
        caption_label: cn(
          'dndev-calendar-caption-label',
          classNames?.caption_label
        ),
        dropdowns: cn('dndev-calendar-dropdowns', classNames?.dropdowns),
        dropdown_month: cn(
          'dndev-calendar-dropdown-month',
          classNames?.dropdown_month
        ),
        dropdown_year: cn(
          'dndev-calendar-dropdown-year',
          classNames?.dropdown_year
        ),
        nav: cn('dndev-calendar-nav', classNames?.nav),
        button_previous: cn(
          'dndev-calendar-nav-button dndev-calendar-nav-previous dndev-interactive',
          classNames?.button_previous
        ),
        button_next: cn(
          'dndev-calendar-nav-button dndev-calendar-nav-next dndev-interactive',
          classNames?.button_next
        ),
        month_grid: cn('dndev-calendar-table', classNames?.month_grid),
        weekdays: cn('dndev-calendar-weekdays', classNames?.weekdays),
        weekday: cn('dndev-calendar-weekday', classNames?.weekday),
        week: cn('dndev-calendar-week', classNames?.week),
        day: cn('dndev-calendar-day', classNames?.day),
        day_button: cn(
          'dndev-calendar-day-button dndev-interactive',
          classNames?.day_button
        ),
        selected: cn('dndev-calendar-day-selected', classNames?.selected),
        today: cn('dndev-calendar-day-today', classNames?.today),
        outside: cn('dndev-calendar-day-outside', classNames?.outside),
        disabled: cn('dndev-calendar-day-disabled', classNames?.disabled),
        range_middle: cn(
          'dndev-calendar-day-range-middle',
          classNames?.range_middle
        ),
        range_start: cn(
          'dndev-calendar-day-range-start',
          classNames?.range_start
        ),
        range_end: cn('dndev-calendar-day-range-end', classNames?.range_end),
        hidden: cn('dndev-calendar-day-hidden', classNames?.hidden),
        ...classNames,
      }}
      components={{
        Dropdown: CalendarDropdown,
        Chevron: CalendarChevron,
      }}
      {...props}
    />
  );
}

// Re-export CustomCaption logic (defined below to avoid hoisting issues, or move above)
// I will keep CustomCaption defined in the file scope as before.

export default Calendar;
