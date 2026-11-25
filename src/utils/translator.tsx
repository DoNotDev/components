'use client';
// packages/components/src/utils/translator.tsx

/**
 * @fileoverview Translator injection
 * @description Components with built-in accessible labels (ImageGallery, Carousel) must
 * speak the page's language, but this layer cannot import `@donotdev/core` (it
 * peer-depends on this package). `@donotdev/ui` registers the framework translation of the
 * eager `dndev` namespace once in its providers. Without a provider the key itself is
 * returned (fail loud: components carry no text, the locale files are the only source).
 *
 * @version 0.1.0
 * @since 0.3.7
 * @author AMBROISE PARK Consulting
 */

import { createContext, useContext } from 'react';

/** Translate a `dndev` namespace key, with optional interpolation values. */
export type ComponentTranslate = (
  key: string,
  values?: Record<string, string | number>
) => string;

const keyAsText: ComponentTranslate = (key) => key;

const TranslatorContext = createContext<ComponentTranslate>(keyAsText);

/**
 * Provide the framework translation (`dndev` namespace) to components of this package.
 * Mounted by `@donotdev/ui` providers; apps do not use it directly.
 *
 * @example
 * ```tsx
 * <TranslatorProvider value={(key, values) => t(key, values)}>
 *   {children}
 * </TranslatorProvider>
 * ```
 */
export const TranslatorProvider = TranslatorContext.Provider;

/**
 * The translate function for built-in labels: the framework translation when provided,
 * else the key itself.
 * @returns The current translate function
 */
export function useComponentTranslate(): ComponentTranslate {
  return useContext(TranslatorContext);
}
