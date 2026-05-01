// packages/components/src/utils/initRipple.ts

/**
 * @fileoverview Ripple effect initialization
 * @description Event delegation for ripple effect on all .dndev-interactive elements.
 * Call once at app startup. Uses CSS variable --ripple-opacity (0 = disabled).
 *
 * @version 0.1.0
 * @since 0.1.0
 * @author AMBROISE PARK Consulting
 */

let initialized = false;

/**
 * Initialize ripple effect for all .dndev-interactive elements.
 * Uses event delegation - only one listener for the entire document.
 * Safe to call multiple times (no-op after first call).
 *
 * @example
 * ```typescript
 * // In your app root/provider
 * import { initRipple } from '@donotdev/components';
 *
 * useEffect(() => {
 *   initRipple();
 * }, []);
 * ```
 */
export function initRipple(): void {
  if (typeof document === 'undefined') return;
  if (initialized) return;
  initialized = true;

  document.addEventListener('pointerdown', handleRipple, { passive: true });
}

function handleRipple(event: PointerEvent): void {
  const target = (event.target as Element)?.closest?.(
    '.dndev-interactive'
  ) as HTMLElement | null;

  if (!target) return;

  // Check if ripple is disabled via CSS variable
  const styles = getComputedStyle(target);
  const rippleOpacity = parseFloat(
    styles.getPropertyValue('--ripple-opacity').trim() || '0.2'
  );
  if (rippleOpacity <= 0) return;

  // Get click position relative to target
  const rect = target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Calculate ripple size (diagonal of element)
  const size = Math.max(rect.width, rect.height);

  // Create ripple element
  const ripple = document.createElement('span');
  ripple.className = 'dndev-ripple';
  ripple.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
  `;

  // Add to target
  target.appendChild(ripple);

  // Remove after animation completes
  ripple.addEventListener(
    'animationend',
    () => {
      ripple.remove();
    },
    { once: true }
  );
}

/**
 * Cleanup ripple event listener.
 * Call when unmounting if needed (typically not required).
 */
export function destroyRipple(): void {
  if (typeof document === 'undefined') return;
  if (!initialized) return;

  document.removeEventListener('pointerdown', handleRipple);
  initialized = false;
}
