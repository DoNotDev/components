// packages/components/src/utils/constants.ts

/**
 * @fileoverview Shared constants for components
 * @description DRY constants used across multiple components
 */

/**
 * Theme variant constants - universal color variants used across all components
 * Single source of truth for theme-based color variants
 */
export const THEME_VARIANT = {
  DEFAULT: 'default',
  MUTED: 'muted',
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  ACCENT: 'accent',
  SUCCESS: 'success',
  WARNING: 'warning',
  DESTRUCTIVE: 'destructive',
} as const;

/** Union of all theme variant values (default, muted, primary, secondary, accent, success, warning, destructive). */
export type ThemeVariant = (typeof THEME_VARIANT)[keyof typeof THEME_VARIANT];

/**
 * Surface variant constants - matches .dndev-surface CSS class
 * Used by Card, Dialog, Sheet, Alert (all components using dndev-surface)
 */
export const SURFACE_VARIANT = {
  ...THEME_VARIANT,
  OUTLINE: 'outline',
  GLASS: 'glass',
} as const;

/** Union of surface variant values (ThemeVariant + outline, glass). */
export type SurfaceVariant =
  (typeof SURFACE_VARIANT)[keyof typeof SURFACE_VARIANT];

/**
 * Floating variant constants - matches .dndev-floating CSS class
 * Used by Popover, DropdownMenu, Select, HoverCard, Tooltip (all components using dndev-floating)
 */
export const FLOATING_VARIANT = THEME_VARIANT;

/** Variant type for floating components (Popover, DropdownMenu, Select, HoverCard, Tooltip). */
export type FloatingVariant = ThemeVariant;

/**
 * Control variant constants (Checkbox, Switch, Slider, RadioGroup)
 * Semantic color variants for form controls
 * Uses all THEME_VARIANT values, defaults to primary like Button
 */
export const CONTROL_VARIANT = THEME_VARIANT;

/** Variant type for form controls (Checkbox, Switch, Slider, RadioGroup). */
export type ControlVariant = ThemeVariant;

/**
 * Tone constants - background tone variants for breakthrough components
 * Used by Section, HeroSection, CallToAction, TechBento for background colors
 * Single source of truth for tone values
 */
export const TONE = {
  GHOST: 'ghost',
  BASE: 'base',
  MUTED: 'muted',
  CONTRAST: 'contrast',
  ACCENT: 'accent',
  PRIMARY: 'primary',
} as const;

/** Union of background tone values (ghost, base, muted, contrast, accent, primary). */
export type Tone = (typeof TONE)[keyof typeof TONE];

/**
 * Text alignment constants - text flow direction
 * Used by Section, HeroSection, CallToAction, Stack, Grid, Text
 * Single source of truth for text-align values
 */
export const TEXT_ALIGN = {
  START: 'start',
  CENTER: 'center',
  END: 'end',
} as const;

/** Union of text alignment values (start, center, end). */
export type TextAlign = (typeof TEXT_ALIGN)[keyof typeof TEXT_ALIGN];
