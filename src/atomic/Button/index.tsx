// packages/components/src/atomic/Button/index.tsx

/**
 * @fileoverview Button component
 * @description Accessible, type-safe button component with behavioral variants
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import type { LucideProps } from 'lucide-react';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ComponentType, ReactNode } from 'react';

import { DISPLAY } from '../../styles/componentConstants';
import { THEME_VARIANT } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';
import Icon from '../Icons/Icon';
import Spinner from '../Spinner';
import Tooltip from '../Tooltip';
import './Button.css';

/**
 * Button variant constants - THEME_VARIANT + Button-specific variants
 * Used for button styling via data-variant attribute
 */
export const BUTTON_VARIANT = {
  ...THEME_VARIANT,
  GHOST: 'ghost',
  OUTLINE: 'outline',
  LINK: 'link',
} as const;

const buttonVariants = cva('dndev-interactive', {
  variants: {
    variant: {
      [THEME_VARIANT.DEFAULT]: '',
      [THEME_VARIANT.MUTED]: '',
      [THEME_VARIANT.PRIMARY]: '',
      [THEME_VARIANT.SECONDARY]: '',
      [THEME_VARIANT.ACCENT]: '',
      [THEME_VARIANT.SUCCESS]: '',
      [THEME_VARIANT.WARNING]: '',
      [THEME_VARIANT.DESTRUCTIVE]: '',
      [BUTTON_VARIANT.GHOST]: '',
      [BUTTON_VARIANT.OUTLINE]: '',
      [BUTTON_VARIANT.LINK]: '',
    },
  },
  defaultVariants: {
    variant: THEME_VARIANT.DEFAULT,
  },
});

/**
 * Button variant type - derived from buttonVariants to ensure type safety
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];

/**
 * Button component props interface
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
/** Props passed to render function for custom element composition */
export interface ButtonRenderProps {
  children: ReactNode;
  className: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'data-variant'?: string;
  'data-display'?: string;
  'data-floating'?: string;
  'data-full-width'?: string;
  role?: string;
  tabIndex?: number;
  [key: string]: unknown;
}

/** Props for the Button component. */
export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Render function for custom element composition (React 19 compatible, no cloneElement).
   * Use this instead of wrapping Button around a Link.
   *
   * @example
   * ```tsx
   * <Button
   *   icon={Home}
   *   render={({ children, ...props }) => (
   *     <Link path="/" {...props}>{children}</Link>
   *   )}
   * >
   *   Home
   * </Button>
   * ```
   */
  render?: (props: ButtonRenderProps) => ReactNode;
  /**
   * Display - controls button presentation
   * - 'compact': Icon-only, no label
   * - 'full': Full button with icon + label
   * - 'auto': Responsive based on breakpoint (default)
   * @default 'auto'
   */
  display?: (typeof DISPLAY)[keyof typeof DISPLAY];
  /** Icon - Lucide component, string name, or ReactNode */
  icon?: ComponentType<LucideProps> | string | ReactNode;
  /**
   * Whether to place icon at end (after text). RTL-safe.
   * @default false
   */
  iconEnd?: boolean;
  /**
   * Count bubble on the icon's corner (cart items, notifications). Rendered only with an
   * icon; `0`, empty or undefined hides it. Decorative: put the count in `aria-label`.
   */
  badge?: number | string;
  /** Tooltip text to show on hover */
  tooltip?: string;
  /** Force tooltip to stay open (e.g., after copy action) */
  tooltipForceOpen?: boolean;
  /**
   * Whether the button floats (e.g., FAB).
   * @default false
   */
  floating?: boolean;
  /**
   * Whether the button takes full width of container.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Whether the button is in a loading state.
   * Shows spinner and disables interaction.
   * @default false
   */
  loading?: boolean;
  /**
   * Text to show when loading. Falls back to children.
   */
  loadingText?: string;
  /**
   * Upload/progress percentage (0-100).
   * When provided during loading, shows progress indicator instead of spinner.
   */
  progress?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

/**
 * Accessible, type-safe button component with behavioral variants.
 * Supports icons, tooltips, responsive layouts, and render prop composition.
 *
 * React 19: Forwards refs to the native button element for compatibility with form libraries.
 *
 * @component
 * @example
 * ```tsx
 * // Standard button
 * <Button variant="primary" icon={Mail}>Send Email</Button>
 *
 * // With Link (render prop pattern - React 19 compatible)
 * <Button
 *   icon={Home}
 *   render={({ children, ...props }) => (
 *     <Link path="/" {...props}>{children}</Link>
 *   )}
 * >
 *   Home
 * </Button>
 * ```
 *
 * @param {ButtonProps} props - The props for the button
 * @returns {JSX.Element} The rendered button
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      render,
      display = DISPLAY.AUTO,
      icon,
      iconEnd = false,
      badge,
      children,
      tooltip,
      tooltipForceOpen,
      floating = false,
      fullWidth = false,
      loading = false,
      loadingText,
      progress,
      disabled,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const buttonText = children;
    const hasIcon = !!icon;
    const hasText = !!buttonText;

    // Display mode - AUTO stays AUTO (CSS-driven), no auto-detection
    const effectiveDisplay = display;

    // Loading state handling
    const isDisabled = disabled || loading;
    const showProgress = loading && progress !== undefined && progress < 100;
    const displayText = loading ? (loadingText ?? buttonText) : buttonText;

    // Icon, with the count bubble on its corner when `badge` is set
    const showBadge = badge !== undefined && badge !== 0 && badge !== '';
    const iconWithBadge = showBadge ? (
      <span className="dndev-interactive-icon-anchor">
        <Icon icon={icon} />
        <span className="dndev-interactive-badge" aria-hidden="true">
          {badge}
        </span>
      </span>
    ) : (
      <Icon icon={icon} />
    );

    // Build button content - Icon handles all types automatically
    const buttonContent = loading ? (
      <>
        {showProgress ? (
          <span className="dndev-button-progress" aria-hidden="true">
            <svg viewBox="0 0 20 20" className="dndev-progress-ring">
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.2"
              />
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${(progress / 100) * 50.27} 50.27`}
                strokeLinecap="round"
                transform="rotate(-90 10 10)"
              />
            </svg>
          </span>
        ) : (
          <Spinner className="dndev-button-spinner" aria-hidden="true" />
        )}
        {hasText && (
          <span
            className="dndev-interactive-label"
            data-display={effectiveDisplay}
          >
            {displayText}
          </span>
        )}
      </>
    ) : (
      <>
        {icon && !iconEnd && iconWithBadge}
        {hasText && (
          <span
            className="dndev-interactive-label"
            data-display={effectiveDisplay}
          >
            {buttonText}
          </span>
        )}
        {icon && iconEnd && iconWithBadge}
      </>
    );

    // Extract text for aria-label (simple string extraction)
    const getAriaLabel = (): string | undefined => {
      if (ariaLabel) return ariaLabel;
      if (typeof buttonText === 'string') return buttonText;
      if (typeof buttonText === 'number') return String(buttonText);
      // Icon-only buttons need fallback
      return hasIcon && !hasText ? 'Button' : undefined;
    };

    // Map 'default' variant to 'primary' for data-variant (same styling)
    const variantForDataAttr =
      variant === THEME_VARIANT.DEFAULT ? THEME_VARIANT.PRIMARY : variant;
    const variantAttrs = getVariantDataAttrs({ variant: variantForDataAttr });

    // Extract type from props before spreading (to ensure it's not overridden)
    const buttonType = props.type || 'button';
    const { type: _type, ...restProps } = props;

    // Build all props that should be passed to element (button or render prop)
    const elementProps: ButtonRenderProps = {
      children: buttonContent,
      className: cn(
        buttonVariants({ variant, className }),
        'touch-manipulation'
      ),
      'aria-label': getAriaLabel(),
      'aria-describedby': ariaDescribedBy,
      ...variantAttrs,
      ...(floating && { 'data-floating': 'true' }),
      ...(fullWidth && { 'data-full-width': 'true' }),
      ...(effectiveDisplay && { 'data-display': effectiveDisplay }),
      ...(loading && { 'data-loading': 'true', 'aria-busy': 'true' }),
      ...restProps,
    };

    // Render prop pattern - no cloneElement needed (React 19 compatible)
    const buttonElement = render ? (
      render(elementProps)
    ) : (
      <button
        ref={ref}
        type={buttonType}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        {...elementProps}
      >
        {buttonContent}
      </button>
    );

    // Tooltip: COMPACT/AUTO (may be icon-only when collapsed), others only if explicit
    // Don't specify side - let CSS --tooltip-side take priority (RTL-aware in sidebars)
    if (
      effectiveDisplay === DISPLAY.COMPACT ||
      effectiveDisplay === DISPLAY.AUTO
    ) {
      return (
        <Tooltip
          content={tooltip || getAriaLabel() || 'Button'}
          forceOpen={tooltipForceOpen}
        >
          {buttonElement}
        </Tooltip>
      );
    }

    if (tooltip) {
      return (
        <Tooltip content={tooltip} forceOpen={tooltipForceOpen}>
          {buttonElement}
        </Tooltip>
      );
    }

    return buttonElement;
  }
);

Button.displayName = 'Button';

export default Button;
export { buttonVariants };
