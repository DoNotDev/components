// packages/components/src/utils/sanitizeDom.server.ts

/**
 * @fileoverview DOMPurify on jsdom
 * @description Server entry of `@donotdev/components/sanitize-dom` (every condition but
 * `browser`: SSR, server components, tests). jsdom stays on 26.x, the last release whose
 * dependency tree loads with `require()`: from 27.4 it requires the ESM-only
 * `@exodus/bytes`, which Vercel's function runtime cannot load (ERR_REQUIRE_ESM).
 * happy-dom and linkedom are not used: DOMPurify does not consider them safe.
 *
 * @version 0.1.0
 * @since 0.2.5
 * @author AMBROISE PARK Consulting
 */

import createDOMPurify from 'dompurify';
import type { DOMPurify as Purifier, WindowLike } from 'dompurify';
import { JSDOM } from 'jsdom';

let purifier: Purifier | undefined;

/**
 * DOMPurify bound to a jsdom window, created on the first call: a render that never
 * sanitizes never builds the DOM.
 *
 * @returns The DOMPurify instance
 */
export function getPurifier(): Purifier {
  purifier ??= createDOMPurify(new JSDOM('').window as unknown as WindowLike);
  return purifier;
}
