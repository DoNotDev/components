// packages/components/src/atomic/FeatureFallback/index.tsx

/**
 * @fileoverview Feature fallback component for unavailable features
 * @description Generic fallback component that displays when features are not available, providing consistent UX across all feature packages. Includes a higher-order component wrapper for conditional feature rendering.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { ComponentLabelText } from '../../utils/ComponentLabelText';
import { cn } from '../../utils/helpers';
import Button from '../Button';
import Card from '../Card';
import Icon from '../Icons/Icon';
import Stack from '../Stack';
import './FeatureFallback.css';

/**
 * Props for the FeatureFallback component -- placeholder for unavailable features.
 * Texts not given default to `dndev:featureFallback.*` in the UI language (the title
 * always), with `{{featureName}}`.
 */
export interface FeatureFallbackProps {
  featureName: string;
  /** Default: `featureFallback.message` ("Billing is not available") */
  message?: string;
  icon?: React.ReactNode;
  showActionButton?: boolean;
  /** Default: `featureFallback.action` ("Billing (unavailable)") */
  actionButtonText?: string;
  className?: string;
  /** Default: `featureFallback.help` ("This feature requires Billing to be configured.") */
  helpText?: string;
}

function FeatureFallback({
  featureName,
  message,
  icon = '🔧',
  showActionButton = false,
  actionButtonText,
  className = '',
  helpText,
}: FeatureFallbackProps) {
  // App text as is; else the translated default (a client text node: this component
  // stays server-safe)
  const values = { featureName };
  const defaultMessage = message || (
    <ComponentLabelText labelKey="featureFallback.message" values={values} />
  );
  const defaultActionText = actionButtonText || (
    <ComponentLabelText labelKey="featureFallback.action" values={values} />
  );
  const defaultHelpText = helpText || (
    <ComponentLabelText labelKey="featureFallback.help" values={values} />
  );

  return (
    <Card
      className={cn('dndev-w-full dndev-feature-fallback-card', className)}
      title={
        <Stack
          direction="row"
          align="center"
          justify="center"
          gap="tight"
          className="dndev-text-xl dndev-font-bold dndev-feature-fallback-title"
        >
          <Icon icon={icon} fallback="🔧" />
          <ComponentLabelText labelKey="featureFallback.title" values={values} />
        </Stack>
      }
      content={
        <div className="dndev-text-center">
          <p className="dndev-text-sm dndev-feature-fallback-text">
            {defaultMessage}
          </p>
          {showActionButton && (
            <Stack direction="row" justify="center" className="dndev-mt-md">
              <Button disabled>{defaultActionText}</Button>
            </Stack>
          )}
          <p className="dndev-text-sm dndev-mt-sm dndev-feature-fallback-text">
            {defaultHelpText}
          </p>
        </div>
      }
    />
  );
}

function withFeatureFallback<P extends object>(
  Component: React.ComponentType<P>,
  featureName: string,
  isFeatureAvailable: () => boolean,
  fallbackProps?: Omit<FeatureFallbackProps, 'featureName' | 'className'>
) {
  return function FeatureWrappedComponent(props: P) {
    if (!isFeatureAvailable()) {
      return <FeatureFallback featureName={featureName} {...fallbackProps} />;
    }

    return <Component {...props} />;
  };
}

export default FeatureFallback;
export { withFeatureFallback };
