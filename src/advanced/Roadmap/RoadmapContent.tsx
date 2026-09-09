// packages/components/src/advanced/Roadmap/RoadmapContent.tsx

/**
 * @fileoverview Roadmap Content Component
 * @description Timeline component with horizontal (desktop) / vertical (mobile) layout.
 * Features animated progress line, glowing nodes, and cards with content at bottom.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { LucideIcon } from 'lucide-react';
import { useState, useEffect, useSyncExternalStore } from 'react';
import type { ComponentType, RefObject } from 'react';

import Card, { renderCardContent } from '../../atomic/Card';
import type { CardContent, CardVariant } from '../../atomic/Card';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { cn } from '../../utils/helpers';

/** Laptop breakpoint threshold (1024px) — matches @donotdev/core BREAKPOINT_THRESHOLDS */
const LAPTOP_QUERY = '(min-width: 1024px)';
const subscribe = (cb: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia(LAPTOP_QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
};
const getSnapshot = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(LAPTOP_QUERY).matches;
};
const getServerSnapshot = () => true;

function useIsLaptopOrDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

import './Roadmap.css';

/** Single step definition within a Roadmap timeline. */
export interface RoadmapStep {
  /** Phase label (e.g., "Week 1", "Days 1-2") */
  phase: string;
  /** Lucide icon for the timeline node */
  icon: LucideIcon;
  /** Step title */
  title: string;
  /** Step subtitle */
  subtitle: string;
  /** Optional description paragraph */
  description?: string;
  /** Optional content - shown in popover on click */
  content?: CardContent;
  /** Optional onClick handler for navigation or actions */
  onClick?: () => void;
}

/** Props for the Roadmap component -- timeline visualization of steps. */
export interface RoadmapProps {
  /** Array of roadmap steps */
  steps: RoadmapStep[];
  /** Optional className */
  className?: string;
  /** Card variant (default, glass, etc.) */
  variant?: CardVariant;
  /** Layout: auto = horizontal on desktop / vertical on mobile; vertical = always vertical; horizontal = always horizontal */
  layout?: 'auto' | 'vertical' | 'horizontal';
}

const RoadmapContent = function RoadmapContent({
  steps,
  className,
  variant,
  layout = 'auto',
}: RoadmapProps) {
  const [activeStep, setActiveStep] = useState(0);
  const isLaptop = useIsLaptopOrDesktop();

  const useVertical = layout === 'vertical' || (layout === 'auto' && !isLaptop);
  const useHorizontal =
    layout === 'horizontal' || (layout === 'auto' && isLaptop);

  const progressPercentage =
    steps.length > 1 ? (activeStep / (steps.length - 1)) * 100 : 0;

  // Horizontal layout (desktop grid)
  if (useHorizontal) {
    return (
      <div className={cn('dndev-roadmap', className)}>
        <div
          className="dndev-roadmap-desktop"
          style={{ ['--step-count' as any]: steps.length }}
        >
          {/* Progress line */}
          <div className="dndev-roadmap-timeline">
            <div className="dndev-roadmap-timeline-bg" />
            <div
              className="dndev-roadmap-timeline-progress"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Steps grid */}
          <div
            className="dndev-roadmap-grid"
            style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= activeStep;
              const isCurrent = index === activeStep;

              return (
                <div
                  key={index}
                  className="dndev-roadmap-step"
                  onMouseEnter={() => setActiveStep(index)}
                >
                  {/* Timeline node */}
                  <div className="dndev-roadmap-node" data-active={isActive}>
                    <Icon />
                  </div>

                  {/* Card with badge, title, subtitle, description, and content */}
                  <Card
                    title={step.title}
                    subtitle={step.subtitle}
                    variant={variant}
                    className="dndev-roadmap-card"
                    data-active={isCurrent}
                    onClick={step.onClick}
                    overlay={
                      <span className="dndev-roadmap-phase">{step.phase}</span>
                    }
                    overlayPosition="top-right"
                    footer={
                      step.content ? (
                        <div className="dndev-roadmap-content">
                          {renderCardContent(step.content)}
                        </div>
                      ) : undefined
                    }
                  >
                    {step.description && (
                      <p className="dndev-roadmap-description">
                        {step.description}
                      </p>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Vertical layout (scroll-based activation)
  return (
    <div className={cn('dndev-roadmap', className)}>
      <div className="dndev-roadmap-mobile">
        {/* Vertical timeline line with progress */}
        <div className="dndev-roadmap-timeline-vertical">
          <div
            className="dndev-roadmap-timeline-vertical-progress"
            style={{ height: `${progressPercentage}%` }}
          />
        </div>

        {steps.map((step, index) => (
          <RoadmapStepMobile
            key={index}
            step={step}
            index={index}
            isActive={index <= activeStep}
            variant={variant}
            onEnter={() => setActiveStep(index)}
          />
        ))}
      </div>
    </div>
  );
};

// Mobile step with IntersectionObserver for scroll-based activation
const RoadmapStepMobile: ComponentType<{
  step: RoadmapStep;
  index: number;
  isActive: boolean;
  variant?: CardVariant;
  onEnter: () => void;
}> = ({ step, index, isActive, variant, onEnter }) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: '0px 0px -20% 0px',
    fallbackIntersecting: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && isIntersecting) {
      onEnter();
    }
  }, [isIntersecting, onEnter]);

  const Icon = step.icon;

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      className="dndev-roadmap-step-mobile"
    >
      {/* Timeline node */}
      <div className="dndev-roadmap-node-mobile" data-active={isActive}>
        <Icon />
      </div>

      {/* Card with badge, title, subtitle, description, and content */}
      <Card
        title={step.title}
        subtitle={step.subtitle}
        variant={variant}
        className="dndev-roadmap-card-mobile"
        data-active={isActive}
        onClick={step.onClick}
        overlay={<span className="dndev-roadmap-phase">{step.phase}</span>}
        overlayPosition="top-right"
        footer={
          step.content ? (
            <div className="dndev-roadmap-content">
              {renderCardContent(step.content)}
            </div>
          ) : undefined
        }
      >
        {step.description && (
          <p className="dndev-roadmap-description">{step.description}</p>
        )}
      </Card>
    </div>
  );
};

export default RoadmapContent;
