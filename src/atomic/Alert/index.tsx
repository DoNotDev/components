// packages/components/src/atomic/Alert/index.tsx

/**
 * @fileoverview Alert component
 * @description Attention-grabbing alert component with semantic variants and icons
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';

import { THEME_VARIANT } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';
import Icon from '../Icons/Icon';
import Stack from '../Stack';

/**
 * Alert variant constants - THEME_VARIANT + Alert-specific semantic names
 * Maps: ERROR -> destructive, INFO -> accent
 */
export const ALERT_VARIANT = {
  DEFAULT: THEME_VARIANT.MUTED, // default alert uses muted
  ERROR: 'error', // maps to destructive
  WARNING: THEME_VARIANT.WARNING,
  SUCCESS: THEME_VARIANT.SUCCESS,
  INFO: 'info', // maps to accent
} as const;

const alertVariants = cva('dndev-surface', {
  variants: {
    variant: {
      [ALERT_VARIANT.DEFAULT]: '',
      [ALERT_VARIANT.ERROR]: '',
      [ALERT_VARIANT.WARNING]: '',
      [ALERT_VARIANT.SUCCESS]: '',
      [ALERT_VARIANT.INFO]: '',
    },
  },
  defaultVariants: {
    variant: ALERT_VARIANT.DEFAULT,
  },
});

/** Union of available Alert variant values. */
export type AlertVariant = (typeof ALERT_VARIANT)[keyof typeof ALERT_VARIANT];

/** Props for the Alert component. */
export interface AlertProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof alertVariants> {
  /**
   * The visual style of the alert.
   * @default 'default'
   */
  variant?: AlertVariant;
  /**
   * Whether to hide the variant icon.
   * @default false
   */
  hideIcon?: boolean;
  /** The title of the alert */
  title?: ReactNode;
  /** The main content/description of the alert */
  description?: ReactNode;
  /** Tooltip text to show on hover */
  tooltip?: string;
}

/**
 * Attention-grabbing alert component with semantic variants and icons.
 *
 * @component
 * @example
 * ```tsx
 * <Alert variant="error" title="Error" description="Something went wrong" />
 * ```
 * @param {AlertProps} props - The props for the alert
 * @returns {JSX.Element} The rendered alert
 */
const Alert = ({
  className,
  variant = ALERT_VARIANT.DEFAULT,
  hideIcon = false,
  title,
  description,
  children,
  tooltip,
  ...props
}: AlertProps) => {
  const iconMap = {
    [ALERT_VARIANT.ERROR]: XCircle,
    [ALERT_VARIANT.WARNING]: AlertTriangle,
    [ALERT_VARIANT.SUCCESS]: CheckCircle,
    [ALERT_VARIANT.INFO]: Info,
    [ALERT_VARIANT.DEFAULT]: Info,
  };

  const IconComponent = iconMap[variant || ALERT_VARIANT.DEFAULT];

  // Map Alert semantic variants to theme variants for data-variant
  const getThemeVariant = (alertVariant?: AlertVariant) => {
    if (!alertVariant || alertVariant === ALERT_VARIANT.DEFAULT)
      return THEME_VARIANT.MUTED;
    if (alertVariant === ALERT_VARIANT.ERROR) return THEME_VARIANT.DESTRUCTIVE;
    if (alertVariant === ALERT_VARIANT.INFO) return THEME_VARIANT.ACCENT;
    return alertVariant; // SUCCESS, WARNING are already theme variants
  };

  const variantAttrs = getVariantDataAttrs({
    variant: getThemeVariant(variant),
  });

  return (
    <Stack
      direction="row"
      align="start"
      gap="tight"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...variantAttrs}
      title={tooltip}
      {...props}
    >
      {!hideIcon && (
        <Icon
          icon={IconComponent}
          className="dndev-alert-icon"
          aria-hidden="true"
        />
      )}
      <Stack gap="tight" flex="1" className="dndev-min-w-0">
        {title && <div className="dndev-alert-title">{title}</div>}
        {description && (
          <div className="dndev-alert-description">{description}</div>
        )}
        {children}
      </Stack>
    </Stack>
  );
};

export default Alert;
export { alertVariants };
