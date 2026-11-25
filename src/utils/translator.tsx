'use client';
// packages/components/src/utils/translator.tsx

/**
 * @fileoverview Component locale
 * @description The UI language and the framework translation for components of this
 * package: every built-in label (default placeholders, empty messages, accessible names
 * of client components: DataTable, Pagination, Dialog, Combobox, Command, Select, Sheet,
 * NavigationMenu, Toaster, ...) and locale-aware formatting / sorting (DataTable number cells and sort, date
 * picker segments). This layer cannot import `@donotdev/core` (it peer-depends on this
 * package): `@donotdev/ui` mounts {@link ComponentLocaleProvider} once in its providers
 * with the i18n language and the translation of the eager `dndev` namespace. Both are the
 * request language during the server render and the hydration pass, so the server and
 * the client render the same text and the same formatting (no hydration mismatch); never
 * read from `document` / `navigator`. It also carries the app's time zone (`timeZone`,
 * `getAppTimeZone()`): date-time pickers and list date editors convert in it. Without a
 * provider: language `en`, time zone `UTC`, keys returned as text (fail loud: components
 * carry no text, the locale files are the only source).
 *
 * @version 0.2.0
 * @since 0.3.7
 * @author AMBROISE PARK Consulting
 */

import { createContext, useContext } from 'react';

/** Translate a `dndev` namespace key, with optional interpolation values. */
export type ComponentTranslate = (
  key: string,
  values?: Record<string, string | number>
) => string;

/**
 * UI language and translation of the components of this package.
 *
 * @version 0.1.0
 * @since 0.3.8
 */
export interface ComponentLocale {
  /** UI language (BCP 47): number formatting, text collation, date segment order */
  language: string;
  /**
   * The app's time zone (IANA, `getAppTimeZone()` of `@donotdev/core`, build option
   * `i18n.timeZone`): date-time pickers and list date editors read and store date-times
   * as wall times in this zone. Same value on the server and the client.
   * @since 0.3.8
   */
  timeZone: string;
  /** Translation of the `dndev` namespace, in `language` */
  translate: ComponentTranslate;
}

/**
 * Locale of components rendered without {@link ComponentLocaleProvider}: English
 * formatting, UTC date-times, keys as text. Deterministic on the server and the client.
 *
 * @version 0.1.0
 * @since 0.3.8
 */
export const DEFAULT_COMPONENT_LOCALE: ComponentLocale = {
  language: 'en',
  timeZone: 'UTC',
  translate: (key) => key,
};

const ComponentLocaleContext = createContext<ComponentLocale>(
  DEFAULT_COMPONENT_LOCALE
);

/**
 * Provide the UI language and the framework translation (`dndev` namespace) to the
 * components of this package. Mounted by `@donotdev/ui` providers; apps do not use it
 * directly.
 *
 * @example
 * ```tsx
 * <ComponentLocaleProvider value={{ language, timeZone: getAppTimeZone(), translate: (key, values) => t(key, values) }}>
 *   {children}
 * </ComponentLocaleProvider>
 * ```
 *
 * @version 0.1.0
 * @since 0.3.8
 */
export const ComponentLocaleProvider = ComponentLocaleContext.Provider;

/**
 * The UI language and translate function of the nearest {@link ComponentLocaleProvider},
 * else {@link DEFAULT_COMPONENT_LOCALE}.
 * @returns The current component locale
 *
 * @version 0.1.0
 * @since 0.3.8
 */
export function useComponentLocale(): ComponentLocale {
  return useContext(ComponentLocaleContext);
}

/**
 * The translate function for built-in labels: the framework translation when provided,
 * else the key itself.
 * @returns The current translate function
 */
export function useComponentTranslate(): ComponentTranslate {
  return useContext(ComponentLocaleContext).translate;
}

/**
 * A built-in label: the consumer's prop when given (its `{{name}}` placeholders filled
 * from `values`), else the `dndev` key translated with `values`. One rule for every
 * component label: explicit props override, the locale files give the default.
 *
 * @param translate - The component translate function ({@link useComponentTranslate})
 * @param prop - The label prop (undefined: use the key)
 * @param key - `dndev` namespace key of the default
 * @param values - Interpolation values
 * @returns The label text
 *
 * @example
 * ```ts
 * componentLabel(translate, selectRowLabel, 'table.selectRow', { index: 3 });
 * ```
 *
 * @version 0.1.0
 * @since 0.3.8
 */
export function componentLabel(
  translate: ComponentTranslate,
  prop: string | undefined,
  key: string,
  values?: Record<string, string | number>
): string {
  if (prop === undefined) return translate(key, values);
  if (!values) return prop;
  return prop.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match
  );
}
