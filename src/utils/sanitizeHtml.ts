// packages/components/src/utils/sanitizeHtml.ts

/**
 * @fileoverview HTML sanitizer (client + server)
 * @description XSS-safe HTML sanitization for content rendered with
 * `dangerouslySetInnerHTML` or parsed into React.
 *
 * `isomorphic-dompurify` resolves by export condition: in the browser it is
 * DOMPurify on the real DOM; under Node (SSR, server components, tests) it is
 * DOMPurify on jsdom — the server setup DOMPurify recommends. happy-dom and
 * linkedom are not used: DOMPurify does not consider them safe.
 *
 * @version 0.2.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import DOMPurify from 'isomorphic-dompurify';

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
