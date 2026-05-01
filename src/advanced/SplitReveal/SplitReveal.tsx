// packages/components/src/advanced/SplitReveal/SplitReveal.tsx

/**
 * @fileoverview Split Reveal Component
 * @description Split reveal component for displaying content in two columns. Features left column content and right column stat cards or custom content with reveal animations.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import Card from '../../atomic/Card';
import Grid from '../../atomic/Grid';
import Text from '../../atomic/Text';
import { GAP_VARIANT } from '../../styles/componentConstants';
import { cn } from '../../utils/helpers';
import Reveal from '../Reveal';

import type { ReactNode, ComponentType } from 'react';

/**
 * Stat card data structure
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface StatCardData {
  title: string;
  description: string;
}

/**
 * Props for SplitReveal component
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface SplitRevealProps {
  /**
   * Left column content
   */
  left: ReactNode;
  /**
   * Right column content - can be stat cards or custom content
   */
  right: ReactNode | StatCardData[];
  /**
   * Animation direction for left column
   * @default 'left'
   */
  leftDirection?: 'left' | 'right' | 'top' | 'bottom' | 'fade-in';
  /**
   * Animation direction for right column
   * @default 'right'
   */
  rightDirection?: 'left' | 'right' | 'top' | 'bottom' | 'fade-in';
  /**
   * Animation threshold
   * @default 0.3
   */
  threshold?: number;
  /**
   * Animation stagger delay in milliseconds
   * @default 200
   */
  stagger?: number;
  /**
   * Animation distance in pixels
   * @default 80
   */
  distance?: number;
  /**
   * Animation duration in milliseconds
   * @default 800
   */
  duration?: number;
  /**
   * Gap between columns on desktop
   * @default 'large'
   */
  gap?: 'none' | 'tight' | 'medium' | 'large';
  /**
   * Additional className
   */
  className?: string;
  /**
   * Items alignment
   * @default 'start'
   */
  align?: 'start' | 'center' | 'end';
  /**
   * Use stat cards for right column
   * @default false
   */
  useStatCards?: boolean;
}

/**
 * SplitReveal - Desktop 2-column with reveal animations, mobile single column
 *
 * Features:
 * - Responsive: 2 cols desktop, 1 col mobile
 * - Reveal animations on both columns
 * - Configurable directions and timing
 * - Clean, reusable API
 */
const SplitReveal: ComponentType<SplitRevealProps> = ({
  left,
  right,
  leftDirection = 'left',
  rightDirection = 'right',
  threshold,
  stagger = 200,
  distance,
  duration,
  gap = GAP_VARIANT.LARGE,
  className,
  align = 'start',
  useStatCards = false,
}) => {
  // Render stat cards if right is an array of StatCardData
  const renderRightContent = () => {
    if (useStatCards && Array.isArray(right)) {
      return (
        <Grid cols={2}>
          {/* Index keys are intentional — StatCardData has no stable ID field
              and the list order is fixed for animation purposes. */}
          {right.map((stat, index) => (
            <Card key={index}>
              <div style={{ padding: 'var(--gap-lg)' }}>
                <Text level="h3">{stat.title}</Text>
                <Text as="p" variant="muted">
                  {stat.description}
                </Text>
              </div>
            </Card>
          ))}
        </Grid>
      );
    }

    return right as ReactNode;
  };

  return (
    <Grid cols={[1, 1, 2, 2]} gap={gap} align={align} className={className}>
      <Reveal
        direction={leftDirection}
        threshold={threshold}
        stagger={stagger}
        distance={distance}
        duration={duration}
        items={[left]}
      />

      <Reveal
        direction={rightDirection}
        threshold={threshold}
        stagger={stagger}
        distance={distance}
        duration={duration}
        items={[renderRightContent()]}
      />
    </Grid>
  );
};

/**
 * Split reveal component
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export default SplitReveal;
