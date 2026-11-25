'use client';
// packages/components/src/utils/ComponentLabelText.tsx

/**
 * @fileoverview Default label text of a server-safe component
 * @description The one client piece of the components that render without
 * `'use client'` (Spinner, Skeleton, CallToAction, FeatureFallback, the Code and Marquee
 * skeletons): they stay server-safe and render it for their default label text, read
 * from the `dndev` key through the component locale (`useComponentTranslate`, mounted by
 * `@donotdev/ui`). A server component may render a client component (Next draws it in
 * the server HTML too); Vite is all-client. An app's own label (`aria-label`, a label
 * prop) is a plain string and needs no client piece.
 *
 * @version 0.1.0
 * @since 0.3.8
 * @author AMBROISE PARK Consulting
 */

import { useComponentTranslate } from './translator';

/** Props of {@link ComponentLabelText}. */
export interface ComponentLabelTextProps {
  /** `dndev` namespace key of the text */
  labelKey: string;
  /** Interpolation values (`{{name}}` in the text) */
  values?: Record<string, string | number>;
}

/**
 * The text of a `dndev` key in the UI language (the component locale).
 *
 * @example
 * ```tsx
 * <span id={id} className="dndev-sr-only"><ComponentLabelText labelKey="messages.loading" /></span>
 * ```
 *
 * @version 0.1.0
 * @since 0.3.8
 */
export function ComponentLabelText({ labelKey, values }: ComponentLabelTextProps) {
  return useComponentTranslate()(labelKey, values);
}
