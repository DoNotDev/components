// packages/components/src/utils/imageRetry.ts

/**
 * @fileoverview Image retry utility for failed loads
 * @description Ref-based retry handler for <img> elements. When an image fails
 * to load (rate limit, timeout, transient error), retries with exponential
 * backoff and cache-busting. No React state - works via DOM data attributes.
 *
 * Browser-only: only invoked from onError (never fires during SSR).
 *
 * @version 0.1.0
 * @since 0.0.26
 * @author AMBROISE PARK Consulting
 */

import type { SyntheticEvent } from 'react';

/** Maximum retry attempts per image */
const MAX_RETRIES = 2;

/** Base delay between retries in ms (multiplied by attempt number) */
const BASE_DELAY_MS = 1500;

/** Protocols that are local/inline and won't benefit from retry */
const SKIP_PROTOCOLS = ['blob:', 'data:'];

/**
 * onError handler for <img> elements. Retries loading with exponential backoff.
 * Uses `data-retry` attribute on the element to track attempts (no React state needed).
 *
 * @example
 * ```tsx
 * <img src={url} onError={handleImageError} />
 * ```
 */
export function handleImageError(e: SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  if (SKIP_PROTOCOLS.some((p) => img.src.startsWith(p))) return;

  const retry = parseInt(img.dataset.retry || '0', 10);
  if (retry >= MAX_RETRIES) return;

  const nextRetry = retry + 1;
  setTimeout(() => {
    // Guard: element may have been removed from DOM during the delay
    if (!img.isConnected) return;

    img.dataset.retry = String(nextRetry);
    // Build clean base URL, then append cache-bust param
    const url = new URL(img.src);
    url.searchParams.set('_r', String(nextRetry));
    img.src = url.toString();
  }, BASE_DELAY_MS * nextRetry);
}
