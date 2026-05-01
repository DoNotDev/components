// packages/components/src/atomic/FeatureFallback/index.tsx

/**
 * @fileoverview Feature fallback component for unavailable features
 * @description Generic fallback component that displays when features are not available, providing consistent UX across all feature packages. Includes a higher-order component wrapper for conditional feature rendering.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { cn } from '../../utils/helpers';
import Button from '../Button';
import Card from '../Card';
import Icon from '../Icons/Icon';
import Stack from '../Stack';
import './FeatureFallback.css';

/** Props for the FeatureFallback component -- placeholder for unavailable features. */
export interface FeatureFallbackProps {
  featureName: string;
  message?: string;
  icon?: React.ReactNode;
  showActionButton?: boolean;
  actionButtonText?: string;
  className?: string;
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
  const defaultMessage = message || `${featureName} is not available`;
  const defaultActionText = actionButtonText || `${featureName} (Unavailable)`;
  const defaultHelpText =
    helpText || `This feature requires ${featureName} to be configured.`;

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
          {featureName} Unavailable
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
