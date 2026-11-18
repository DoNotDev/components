// packages/components/src/utils/sanitizeDom.browser.ts

/**
 * @fileoverview DOMPurify on the browser's DOM
 * @description Browser entry of `@donotdev/components/sanitize-dom` (export condition
 * `browser`). Never imports jsdom.
 *
 * @version 0.1.0
 * @since 0.2.5
 * @author AMBROISE PARK Consulting
 */

import DOMPurify from 'dompurify';
import type { DOMPurify as Purifier } from 'dompurify';

/**
 * DOMPurify bound to the page's `window`.
 *
 * @returns The DOMPurify instance (`isSupported` is false without a DOM)
 */
export function getPurifier(): Purifier {
  return DOMPurify;
}
