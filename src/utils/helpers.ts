// packages/components/src/utils/helpers.ts

/**
 * @fileoverview Component Helper Utilities
 * @description Provides utility functions for component styling and class name management.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';

/**
 * Merges class names
 *
 * Combines multiple class name inputs into a single string.
 *
 * @param {...ClassValue} inputs - Class name inputs to merge
 * @returns {string} Merged class name string
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Generates data attributes from variant props
 *
 * Automatically converts variant props to data attributes for CSS selectors.
 * Prevents duplication when using CVA (class-variance-authority).
 *
 * @param variants - Variant props object
 * @returns Object with data-* attributes
 * @example
 * const attrs = getVariantDataAttrs({ variant: 'primary', size: 'md' });
 * // Returns: { 'data-variant': 'primary', 'data-size': 'md' }
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function getVariantDataAttrs(variants: {
  variant?: string | null | undefined;
  size?: string | null | undefined;
  shadow?: string | null | undefined;
  radius?: string | null | undefined;
  hover?: string | null | undefined;
  glow?: string | null | undefined;
  side?: string | null | undefined;
  [key: string]: string | null | undefined;
}): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (variants.variant != null) attrs['data-variant'] = variants.variant;
  if (variants.size != null) attrs['data-size'] = variants.size;
  if (variants.shadow != null) attrs['data-shadow'] = variants.shadow;
  if (variants.radius != null) attrs['data-radius'] = variants.radius;
  if (variants.hover != null) attrs['data-hover'] = variants.hover;
  if (variants.glow != null) attrs['data-glow'] = variants.glow;
  if (variants.side != null) attrs['data-side'] = variants.side;
  return attrs;
}
