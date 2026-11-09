// packages/components/src/utils/initRipple.ts

/**
 * @fileoverview Ripple effect initialization
 * @description Event delegation for ripple effect on all .dndev-interactive elements.
 * Call once at app startup. Uses CSS variable --ripple-opacity (0 or unset = disabled).
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
  const rippleOpacity = parseFloat(styles.getPropertyValue('--ripple-opacity'));
  if (!(rippleOpacity > 0)) return;

  // Get click position relative to the target's padding box (the ripple's containing block)
  const rect = target.getBoundingClientRect();
  const paddingBoxStart = rect.left + target.clientLeft;
  const inlineOffset =
    styles.direction === 'rtl'
      ? paddingBoxStart + target.clientWidth - event.clientX
      : event.clientX - paddingBoxStart;
  const blockOffset = event.clientY - rect.top - target.clientTop;

  // Base ripple size on the element's longest side
  const size = Math.max(rect.width, rect.height);

  // Create ripple element
  const ripple = document.createElement('span');
  ripple.className = 'dndev-ripple';
  ripple.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    inset-inline-start: ${inlineOffset - size / 2}px;
    inset-block-start: ${blockOffset - size / 2}px;
  `;

  // Clip inside a dedicated layer: layout rules can override the target's overflow
  const clip = document.createElement('span');
  clip.className = 'dndev-ripple-clip';
  clip.appendChild(ripple);

  // Add to target
  target.appendChild(clip);

  // Remove after animation completes
  ripple.addEventListener(
    'animationend',
    () => {
      clip.remove();
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
