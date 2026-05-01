// packages/components/src/atomic/Stepper/index.tsx

/**
 * @fileoverview Stepper component
 * @description Reusable stepper component for step-by-step workflows. Shows one step at a time with navigation.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

import { THEME_VARIANT } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';
import Button, { BUTTON_VARIANT } from '../Button';
import Card from '../Card';
import Stack from '../Stack';
import './Stepper.css';

import type { IconType } from '../../types';
import type { ComponentType, ReactNode } from 'react';

/** Single step definition within a Stepper. */
export interface StepperStep {
  /** Step number (0-indexed or 1-indexed, displayed as-is) */
  number: number;
  /** Step title */
  title: string;
  /** Step icon (optional) */
  icon?: ReactNode;
  /** Step content */
  content: ReactNode;
}

const stepperVariants = cva('', {
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
    },
  },
  defaultVariants: {
    variant: THEME_VARIANT.DEFAULT,
  },
});

/** Union of available Stepper variant values. */
export type StepperVariant = VariantProps<typeof stepperVariants>['variant'];

/** Props for the Stepper component -- multi-step navigation with content panels. */
export interface StepperProps extends VariantProps<typeof stepperVariants> {
  /** Array of steps to display */
  steps: StepperStep[];
  /** Initial active step index (0-based) */
  defaultStep?: number;
  /** Whether to show step numbers in navigation */
  showStepNumbers?: boolean;
  /** Show previous/next navigation buttons (default: false) */
  showNavigation?: boolean;
  /** Show step info text "Step X of Y" (default: false) */
  showStepInfo?: boolean;
  /** Label for previous button (default: "Previous") */
  previousLabel?: string;
  /** Label for next button (default: "Next") */
  nextLabel?: string;
  /** Template function for step info (default: "Step {current} of {total}") */
  stepInfoTemplate?: (current: number, total: number) => string;
  /** Additional CSS classes */
  className?: string;
  /** Callback when step changes */
  onStepChange?: (stepIndex: number) => void;
  /** Controlled active step (0-based). When set, Stepper is controlled. */
  activeStep?: number;
  /** Show primary Next / secondary Previous buttons below the card (default: false) */
  showPrimaryNavigation?: boolean;
}

/**
 * Reusable stepper component for step-by-step workflows.
 * Shows one step at a time with navigation controls.
 *
 * @component
 * @example
 * ```tsx
 * <Stepper
 *   steps={[
 *     { number: 1, title: 'Step 1', content: <div>Step 1 Content</div> },
 *     { number: 2, title: 'Step 2', content: <div>Step 2 Content</div> }
 *   ]}
 * />
 * ```
 * @param {StepperProps} props - The props for the stepper
 * @returns {JSX.Element | null} The rendered stepper
 */
export const Stepper: ComponentType<StepperProps> = ({
  steps,
  defaultStep = 0,
  showStepNumbers = true,
  showNavigation = false,
  showStepInfo = false,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  stepInfoTemplate = (current, total) => `Step ${current} of ${total}`,
  variant,
  className,
  onStepChange,
  activeStep: controlledStep,
  showPrimaryNavigation = false,
}) => {
  const [internalStep, setInternalStep] = useState(defaultStep);
  const containerRef = useRef<HTMLDivElement>(null);
  const variantAttrs = getVariantDataAttrs({ variant });

  const isControlled = controlledStep !== undefined;
  const activeStep = isControlled ? controlledStep : internalStep;

  const handleStepChange = useCallback(
    (newStep: number) => {
      if (newStep >= 0 && newStep < steps.length) {
        if (!isControlled) setInternalStep(newStep);
        onStepChange?.(newStep);
      }
    },
    [steps.length, onStepChange, isControlled]
  );

  // Keyboard navigation - only when Stepper is focused (standard pattern)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStepChange(activeStep - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStepChange(activeStep + 1);
      }
      // PageUp, PageDown, Home, End, Space work normally - they don't propagate to this handler
    },
    [activeStep, handleStepChange]
  );

  const currentStep = steps[activeStep];
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === steps.length - 1;

  if (!currentStep) {
    return null;
  }

  return (
    <Stack
      ref={containerRef}
      className={cn('dndev-stepper-container', className)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Stepper navigation"
    >
      {/* Step Navigation */}
      <div className="dndev-stepper-nav">
        {showNavigation && (
          <button
            onClick={() => handleStepChange(activeStep - 1)}
            disabled={isFirstStep}
            className="dndev-interactive"
            data-role="stepper-nav-arrow"
            aria-label={previousLabel}
            {...variantAttrs}
          >
            <ChevronLeft />
          </button>
        )}

        {steps.map((step, index) => (
          <div key={index} className="dndev-stepper-nav-item">
            <button
              onClick={() => handleStepChange(index)}
              className="dndev-interactive"
              data-role="stepper-button"
              data-state={
                index === activeStep
                  ? 'active'
                  : index < activeStep
                    ? 'completed'
                    : 'pending'
              }
              aria-current={index === activeStep ? 'step' : undefined}
              aria-label={`Go to step ${step.number}: ${step.title}`}
              {...variantAttrs}
            >
              {showStepNumbers ? step.number : index + 1}
            </button>
            {index < steps.length - 1 && (
              <div
                className="dndev-stepper-connector"
                data-completed={index < activeStep ? 'true' : 'false'}
              />
            )}
          </div>
        ))}

        {showNavigation && (
          <button
            onClick={() => handleStepChange(activeStep + 1)}
            disabled={isLastStep}
            className="dndev-interactive"
            data-role="stepper-nav-arrow"
            aria-label={nextLabel}
            {...variantAttrs}
          >
            <ChevronRight />
          </button>
        )}
      </div>

      {/* Current Step Content */}
      <Card
        className="dndev-stepper-card-content"
        icon={
          currentStep.icon &&
          typeof currentStep.icon === 'object' &&
          currentStep.icon !== null &&
          'props' in currentStep.icon &&
          currentStep.icon.props &&
          typeof currentStep.icon.props === 'object' &&
          'icon' in currentStep.icon.props
            ? (currentStep.icon.props as { icon?: IconType }).icon
            : (currentStep.icon as IconType | undefined)
        }
        title={currentStep.title}
        content={currentStep.content}
      />

      {/* Optional Step Info */}
      {showStepInfo && (
        <div className="dndev-stepper-info">
          {stepInfoTemplate(activeStep + 1, steps.length)}
        </div>
      )}

      {/* Primary Next / Previous below card */}
      {showPrimaryNavigation && (
        <div className="dndev-stepper-actions">
          <Button
            variant={BUTTON_VARIANT.SECONDARY}
            onClick={() => handleStepChange(activeStep - 1)}
            disabled={isFirstStep}
            aria-label={previousLabel}
          >
            {previousLabel}
          </Button>
          <Button
            variant={BUTTON_VARIANT.PRIMARY}
            onClick={() => handleStepChange(activeStep + 1)}
            disabled={isLastStep}
            aria-label={nextLabel}
          >
            {nextLabel}
          </Button>
        </div>
      )}
    </Stack>
  );
};

export default Stepper;
export { stepperVariants };
