'use client';
// packages/components/src/atomic/ColorPicker/index.tsx

/**
 * @fileoverview ColorPicker component
 * @description Color selection component with preset swatch grid, native color input fallback,
 * and full ARIA radiogroup pattern with roving tabindex. SSR-safe, no external dependencies.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { forwardRef, useRef, useState } from 'react';
import type { HTMLAttributes, KeyboardEvent } from 'react';

import { cn } from '../../utils/helpers';
import { withCssVars } from '../../utils/cssVars';
import { componentLabel, useComponentTranslate } from '../../utils/translator';

import './ColorPicker.css';

/** A preset color swatch */
export interface ColorSwatch {
  /** Hex color value (e.g., '#ff0000') */
  value: string;
  /** Human-readable name — used as aria-label for accessibility */
  label: string;
}

export const COLOR_PRESETS = {
  BASIC: 'basic',
  MATERIAL: 'material',
  PASTEL: 'pastel',
} as const;

/** Union of available color preset palette names. */
export type ColorPreset = (typeof COLOR_PRESETS)[keyof typeof COLOR_PRESETS];

/** Preset swatches: `label` is the color's `dndev` key under `colorPicker.colors` */
const BASIC_SWATCHES: ColorSwatch[] = [
  { value: '#000000', label: 'black' },
  { value: '#ffffff', label: 'white' },
  { value: '#6b7280', label: 'gray' },
  { value: '#9ca3af', label: 'lightGray' },
  { value: '#dc2626', label: 'red' },
  { value: '#ea580c', label: 'orange' },
  { value: '#d97706', label: 'amber' },
  { value: '#eab308', label: 'yellow' },
  { value: '#84cc16', label: 'lime' },
  { value: '#16a34a', label: 'green' },
  { value: '#14b8a6', label: 'teal' },
  { value: '#06b6d4', label: 'cyan' },
  { value: '#2563eb', label: 'blue' },
  { value: '#7c3aed', label: 'purple' },
  { value: '#db2777', label: 'pink' },
  { value: '#e11d48', label: 'rose' },
];

const MATERIAL_SWATCHES: ColorSwatch[] = [
  { value: '#f44336', label: 'red' },
  { value: '#e91e63', label: 'pink' },
  { value: '#9c27b0', label: 'purple' },
  { value: '#673ab7', label: 'deepPurple' },
  { value: '#3f51b5', label: 'indigo' },
  { value: '#2196f3', label: 'blue' },
  { value: '#03a9f4', label: 'lightBlue' },
  { value: '#00bcd4', label: 'cyan' },
  { value: '#009688', label: 'teal' },
  { value: '#4caf50', label: 'green' },
  { value: '#8bc34a', label: 'lightGreen' },
  { value: '#cddc39', label: 'lime' },
  { value: '#ffeb3b', label: 'yellow' },
  { value: '#ffc107', label: 'amber' },
  { value: '#ff9800', label: 'orange' },
  { value: '#ff5722', label: 'deepOrange' },
];

const PASTEL_SWATCHES: ColorSwatch[] = [
  { value: '#fecdd3', label: 'pastelRose' },
  { value: '#fbcfe8', label: 'pastelPink' },
  { value: '#e9d5ff', label: 'pastelPurple' },
  { value: '#c7d2fe', label: 'pastelIndigo' },
  { value: '#bfdbfe', label: 'pastelBlue' },
  { value: '#a5f3fc', label: 'pastelCyan' },
  { value: '#99f6e4', label: 'pastelTeal' },
  { value: '#bbf7d0', label: 'pastelGreen' },
  { value: '#d9f99d', label: 'pastelLime' },
  { value: '#fef08a', label: 'pastelYellow' },
  { value: '#fed7aa', label: 'pastelOrange' },
  { value: '#fecaca', label: 'pastelRed' },
  { value: '#e5e7eb', label: 'pastelGray' },
  { value: '#f5f5f4', label: 'pastelStone' },
  { value: '#fce7f3', label: 'pastelFuchsia' },
  { value: '#dbeafe', label: 'pastelSky' },
];

const PRESET_MAP: Record<ColorPreset, ColorSwatch[]> = {
  [COLOR_PRESETS.BASIC]: BASIC_SWATCHES,
  [COLOR_PRESETS.MATERIAL]: MATERIAL_SWATCHES,
  [COLOR_PRESETS.PASTEL]: PASTEL_SWATCHES,
};

/** Determine if a hex color is light (for checkmark contrast) */
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

/** Props for the ColorPicker component. */
export interface ColorPickerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** Controlled hex color value (e.g., '#00bcd4') */
  value?: string;
  /** Default hex color value (uncontrolled) */
  defaultValue?: string;
  /** Callback when color changes. Returns hex string. */
  onChange?: (color: string) => void;
  /**
   * Preset swatch palette name (color names from `dndev` `colorPicker.colors`), or custom array.
   * @default 'basic'
   */
  swatches?: ColorPreset | ColorSwatch[];
  /**
   * Number of columns in swatch grid.
   * @default 8
   */
  columns?: number;
  /**
   * Show native color input for custom color selection.
   * @default true
   */
  showCustom?: boolean;
  /**
   * Show hex value display below swatches.
   * @default false
   */
  showHexValue?: boolean;
  /**
   * Whether the picker is disabled.
   * @default false
   */
  disabled?: boolean;
  /** Accessible label for the color picker (default: `dndev` `colorPicker.label`) */
  'aria-label'?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Color selection component with preset swatch grid and native color input.
 * Full ARIA radiogroup pattern with roving tabindex for keyboard navigation.
 *
 * @component
 * @example
 * ```tsx
 * // Basic usage with preset palette
 * <ColorPicker
 *   value={color}
 *   onChange={setColor}
 *   aria-label="Choose accent color"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Material palette with hex display
 * <ColorPicker
 *   swatches="material"
 *   showHexValue
 *   defaultValue="#2196f3"
 *   onChange={(hex) => console.log(hex)}
 *   aria-label="Theme color"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Custom swatches, no native picker
 * <ColorPicker
 *   swatches={[
 *     { value: '#ff0000', label: 'Red' },
 *     { value: '#00ff00', label: 'Green' },
 *     { value: '#0000ff', label: 'Blue' },
 *   ]}
 *   showCustom={false}
 *   columns={3}
 *   aria-label="Primary color"
 * />
 * ```
 *
 * @param {ColorPickerProps} props - The props for the color picker
 * @returns {JSX.Element} The rendered color picker
 */
const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  function ColorPicker(
    {
      value,
      defaultValue = '#000000',
      onChange,
      swatches = COLOR_PRESETS.BASIC,
      columns = 8,
      showCustom = true,
      showHexValue = false,
      disabled = false,
      'aria-label': ariaLabelProp,
      className,
      ...props
    },
    ref
  ) {
    const translate = useComponentTranslate();
    const ariaLabel = componentLabel(translate, ariaLabelProp, 'colorPicker.label');
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const swatchesRef = useRef<HTMLDivElement>(null);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const resolvedSwatches =
      typeof swatches === 'string'
        ? (PRESET_MAP[swatches] ?? BASIC_SWATCHES).map((swatch) => ({
            value: swatch.value,
            label: translate(`colorPicker.colors.${swatch.label}`),
          }))
        : swatches;

    const selectColor = (hex: string) => {
      if (!isControlled) setInternalValue(hex);
      onChange?.(hex);
    };

    const handleSwatchKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      const total = resolvedSwatches.length;
      if (total === 0) return;

      let nextIndex = focusedIndex;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = (focusedIndex + 1) % total;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = (focusedIndex - 1 + total) % total;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = total - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < total) {
            const swatch = resolvedSwatches[focusedIndex];
            if (swatch) selectColor(swatch.value);
          }
          return;
        default:
          return;
      }

      setFocusedIndex(nextIndex);

      // Focus the swatch button
      const buttons =
        swatchesRef.current?.querySelectorAll<HTMLButtonElement>(
          '[role="radio"]'
        );
      buttons?.[nextIndex]?.focus();
    };

    // Determine which swatch is "active" for roving tabindex
    const activeIndex = resolvedSwatches.findIndex(
      (s) => s.value.toLowerCase() === currentValue?.toLowerCase()
    );
    const tabbableIndex =
      focusedIndex >= 0 ? focusedIndex : Math.max(activeIndex, 0);

    return (
      <div
        ref={ref}
        className={cn('dndev-color-picker', className)}
        aria-disabled={disabled || undefined}
        {...props}
      >
        {/* Swatch grid */}
        <div
          ref={swatchesRef}
          role="radiogroup"
          aria-label={ariaLabel}
          className="dndev-color-swatches"
          style={withCssVars({ '--color-picker-columns': columns })}
          onKeyDown={handleSwatchKeyDown}
        >
          {resolvedSwatches.map((swatch, index) => {
            const isSelected =
              swatch.value.toLowerCase() === currentValue?.toLowerCase();
            return (
              <button
                key={swatch.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${swatch.label} (${swatch.value})`}
                tabIndex={index === tabbableIndex ? 0 : -1}
                disabled={disabled}
                className="dndev-color-swatch"
                data-light={isLightColor(swatch.value)}
                style={withCssVars({ '--swatch-color': swatch.value })}
                onClick={() => selectColor(swatch.value)}
                onFocus={() => setFocusedIndex(index)}
              />
            );
          })}
        </div>

        {/* Custom color input */}
        {showCustom && (
          <div className="dndev-color-custom">
            <label className="dndev-color-custom-label">
              <span>{translate('colorPicker.custom')}</span>
              <input
                type="color"
                value={currentValue}
                disabled={disabled}
                aria-label={translate('colorPicker.customColor')}
                onChange={(e) => selectColor(e.target.value)}
              />
            </label>
          </div>
        )}

        {/* Hex value display */}
        {showHexValue && (
          <output className="dndev-color-hex" aria-live="polite">
            {currentValue}
          </output>
        )}
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';

export default ColorPicker;
