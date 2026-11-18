// packages/components/src/utils/sanitizeHtml.ts

/**
 * @fileoverview HTML sanitizer (client + server)
 * @description XSS-safe HTML sanitization for content rendered with
 * `dangerouslySetInnerHTML` or parsed into React.
 *
 * DOMPurify from `@donotdev/components/sanitize-dom`, resolved by export condition:
 * in the browser it runs on the real DOM (`sanitizeDom.browser.ts`); everywhere else
 * (SSR, server components, tests) on jsdom (`sanitizeDom.server.ts`), the server setup
 * DOMPurify recommends.
 *
 * @version 0.3.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { getPurifier } from '@donotdev/components/sanitize-dom';

/** Restricts what survives sanitization. Omitted = DOMPurify's safe defaults. */
export interface SanitizeHtmlOptions {
  /** Only these tags are kept (content of removed tags is kept as text). */
  allowedTags?: readonly string[];
  /** Only these attributes are kept. */
  allowedAttributes?: readonly string[];
}

/**
 * Sanitize untrusted HTML. Removes scripts, event handlers, `javascript:` /
 * `data:` URIs, and every tag or attribute outside the allowlist.
 *
 * Throws when no DOM implementation is available: DOMPurify would otherwise
 * return the input unchanged.
 *
 * @example
 * ```tsx
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }} />
 * ```
 */
export function sanitizeHtml(
  html: string,
  options: SanitizeHtmlOptions = {}
): string {
  const DOMPurify = getPurifier();
  if (!DOMPurify.isSupported) {
    throw new Error(
      'sanitizeHtml: no DOM implementation available, refusing to return unsanitized HTML'
    );
  }
  return DOMPurify.sanitize(html, {
    // No submittable forms in rendered content (phishing). Inputs stay: GFM
    // task lists render as disabled checkboxes.
    FORBID_TAGS: ['form'],
    ...(options.allowedTags && { ALLOWED_TAGS: [...options.allowedTags] }),
    ...(options.allowedAttributes && {
      ALLOWED_ATTR: [...options.allowedAttributes],
    }),
  });
}
