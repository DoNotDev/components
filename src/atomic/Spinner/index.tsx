// packages/components/src/atomic/Spinner/index.tsx

/**
 * @fileoverview Spinner component
 * @description Spinner component for loading states with inline and overlay modes
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { THEME_VARIANT, type ThemeVariant } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';

import './Spinner.css';

/** Props for the Spinner component -- loading indicator with inline and overlay modes. */
export interface SpinnerProps {
  /**
   * Overlay mode:
   * - `true` — fixed fullscreen overlay with blur backdrop (page transitions, route loading)
   * - `'container'` — absolute overlay scoped to nearest positioned parent (section loading)
   * - `false`/omitted — inline spinner (buttons, fields, cards)
   * @default false
   */
  overlay?: boolean | 'container';
  /**
   * Optional message displayed below the spinner.
   * For i18n, pass translated string: `message={t('loading')}`
   */
  message?: string;
  /**
   * Color variant - theme color for spinner
   * Uses THEME_VARIANT: default, muted, primary, secondary, accent, success, warning, destructive
   * @default 'primary'
   */
  variant?: ThemeVariant;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Accessibility label
   * @default 'Loading'
   */
  'aria-label'?: string;
}

/**
 * Spinner component for loading states.
 *
 * Features:
 * - Inline by default (fits parent container)
 * - Optional overlay mode (full-page with blur backdrop)
 * - Color variants via THEME_VARIANT (primary, secondary, accent, success, warning, destructive)
 * - Natural sizing (inherits from parent context)
 * - Accessible with proper ARIA labels
 * - Theme-aware colors
 * - Smooth animation
 *
 * OVERLAY MODE:
 * - Set `overlay={true}` for full-page overlay with blur backdrop, centered spinner (page transitions)
 * - Default (inline): Spinner fits its parent container, no backdrop (button loading, inline states)
 *
 * COLOR VARIANTS:
 * - primary, secondary, accent: Brand colors
 * - success, warning, destructive: Status colors
 * - default, muted: Neutral colors
 *
 * SIZING: Size naturally inherits from parent font-size (1em). No size prop needed.
 *
 * @component
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 * @example
 * ```tsx
 * // Inline spinner (fits parent)
 * <Spinner />
 *
 * // Full-page overlay
 * <Spinner overlay />
 *
 * // Colored spinner
 * <Spinner variant="success" />
 * <Spinner overlay variant="destructive" />
 * ```
 * @param {SpinnerProps} props - The props for the spinner
 * @returns {JSX.Element} The rendered spinner
 */
function Spinner({
  overlay = false,
  message,
  variant = THEME_VARIANT.PRIMARY,
  className,
  'aria-label': ariaLabel = 'Loading',
}: SpinnerProps) {
  const variantAttrs = getVariantDataAttrs({ variant });
  const spinnerElement = (
    <div
      className={cn('dndev-spinner', className)}
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
      {...variantAttrs}
    >
      <span className="dndev-sr-only">{ariaLabel}</span>
    </div>
  );

  // Content: spinner + optional message
  const content = message ? (
    <div className="dndev-spinner-content">
      {spinnerElement}
      <span className="dndev-spinner-message" aria-live="polite">
        {message}
      </span>
    </div>
  ) : (
    spinnerElement
  );

  // Overlay mode: full-page with backdrop
  if (overlay === true) {
    return <div className="dndev-spinner-overlay">{content}</div>;
  }

  // Container overlay: scoped to nearest positioned parent
  if (overlay === 'container') {
    return <div className="dndev-spinner-overlay--container">{content}</div>;
  }

  // Inline (default): just the content
  return content;
}

export default Spinner;
