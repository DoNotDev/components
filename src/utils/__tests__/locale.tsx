// packages/components/src/utils/__tests__/locale.tsx

/**
 * @fileoverview Test locale
 * @description `ComponentLocaleProvider` values built from the framework's real `dndev`
 * locale files (what `@donotdev/ui` provides at runtime), and an RTL `render` wrapped in
 * one. A key missing from the locale file shows as the key, so tests also prove the
 * default labels exist. Test-only (the package itself never imports the locale files).
 */

import { render as rtlRender } from '@testing-library/react';
import type { RenderOptions, RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';

import en from '../../../../core/i18n/locales/eager/dndev_en.json';
import fr from '../../../../core/i18n/locales/eager/dndev_fr.json';
import { ComponentLocaleProvider } from '../translator';
import type { ComponentLocale, ComponentTranslate } from '../translator';

type Messages = { [key: string]: string | Messages };

/** The message at a dotted key, if it is a string. */
function lookup(messages: Messages, key: string): string | undefined {
  const text = key
    .split('.')
    .reduce<string | Messages | undefined>(
      (node, part) => (node && typeof node === 'object' ? node[part] : undefined),
      messages
    );
  return typeof text === 'string' ? text : undefined;
}

/**
 * i18next-like lookup of a dotted key: a numeric `count` picks the `_<plural category>`
 * form first (`Intl.PluralRules` of the language), `{{name}}` filled; the key when missing.
 */
function translatorOf(messages: Messages, language: string): ComponentTranslate {
  return (key, values) => {
    const count = values?.count;
    const plural =
      typeof count === 'number'
        ? lookup(messages, `${key}_${new Intl.PluralRules(language).select(count)}`)
        : undefined;
    const text = plural ?? lookup(messages, key);
    if (text === undefined) return key;
    return text.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
      values && name in values ? String(values[name]) : match
    );
  };
}

/** English UI: `dndev_en.json`. */
export const EN_LOCALE: ComponentLocale = {
  language: 'en',
  timeZone: 'Europe/Paris',
  translate: translatorOf(en as Messages, 'en'),
};

/** French UI: `dndev_fr.json`. App time zone `Europe/Paris` (both locales). */
export const FR_LOCALE: ComponentLocale = {
  language: 'fr',
  timeZone: 'Europe/Paris',
  translate: translatorOf(fr as Messages, 'fr'),
};

/**
 * RTL `render` inside a ComponentLocaleProvider (English by default), as the app
 * providers mount it.
 */
export function render(
  ui: ReactElement,
  locale: ComponentLocale = EN_LOCALE,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return rtlRender(ui, {
    ...options,
    wrapper: ({ children }) => (
      <ComponentLocaleProvider value={locale}>
        {children}
      </ComponentLocaleProvider>
    ),
  });
}
