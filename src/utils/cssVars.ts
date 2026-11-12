// packages/components/src/utils/cssVars.ts

/**
 * @fileoverview Typed CSS custom properties for inline styles
 * @description Internal to @donotdev/components (not re-exported from utils/index).
 * Replaces `{ '--x': v } as CSSProperties` / `['--x' as any]` casts.
 *
 * @version 0.1.0
 * @since 0.2.2
 * @author AMBROISE PARK Consulting
 */

import type { CSSProperties } from 'react';

/** React inline style that also accepts CSS custom properties (`--name`). */
export type CSSPropertiesWithVars = CSSProperties & {
  [customProperty: `--${string}`]: string | number | undefined;
};

/**
 * Types an inline style object that sets CSS custom properties.
 *
 * @param style - Standard style properties and/or `--name` custom properties
 * @returns The same object, typed for the `style` prop
 */
export function withCssVars(style: CSSPropertiesWithVars): CSSProperties {
  return style;
}
