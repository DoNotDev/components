// packages/components/src/atomic/DualCard/index.tsx

/**
 * @fileoverview DualCard component
 * @description Two-column card layout with vertical separator, responsive to single column on mobile
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { ReactNode, HTMLAttributes } from 'react';

import type { IconType } from '../../types';
import { SURFACE_VARIANT } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';
import { surfaceVariants } from '../../utils/variants';
import { renderCardContent, renderCardHeader } from '../Card';
import type { CardVariant, CardContent } from '../Card';
import Separator, { SEPARATOR_VARIANT } from '../Separator';
import Stack from '../Stack';

import './DualCard.css';

/** Union of available DualCard variant values. */
export type DualCardVariant = VariantProps<typeof surfaceVariants>['variant'];

/** Props for the DualCard component -- two-column card with vertical separator. */
export interface DualCardProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'content'>,
    VariantProps<typeof surfaceVariants> {
  /**
   * Whether the card has elevation/shadow.
   * @default false
   */
  elevated?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Left side icon */
  leftIcon?: IconType;
  /** Left side title */
  leftTitle?: string;
  /** Left side subtitle */
  leftSubtitle?: string;
  /**
   * Left side content - string, string[], or ReactNode.
   * For lists with icons, pass `<List icon={...} items={...} />` directly.
   */
  leftContent?: CardContent;
  /** Left side CTA (button, link, etc.) */
  leftCTA?: ReactNode;
  /** Right side icon */
  rightIcon?: IconType;
  /** Right side title */
  rightTitle?: string;
  /** Right side subtitle */
  rightSubtitle?: string;
  /**
   * Right side content - string, string[], or ReactNode.
   * For lists with icons, pass `<List icon={...} items={...} />` directly.
   */
  rightContent?: CardContent;
  /** Right side CTA (button, link, etc.) */
  rightCTA?: ReactNode;
}

/**
 * DualCard - Two-column card with vertical separator
 *
 * Responsive: 2 columns on desktop/tablet, stacks to 1 column on mobile (< 768px)
 * Uses Card variants and elevation for styling consistency.
 *
 * @component
 * @example
 * ```tsx
 * <DualCard
 *   leftTitle="What we do"
 *   leftSubtitle="Our methodology"
 *   leftContent={['Item 1', 'Item 2']}
 *   leftCTA={<Button>Learn more</Button>}
 *   rightTitle="What you can buy"
 *   rightSubtitle="Our offers"
 *   rightContent={['Offer 1', 'Offer 2']}
 *   rightCTA={<Button>Get started</Button>}
 *   variant="glass"
 *   elevated
 * />
 * ```
 */
const DualCard = forwardRef<HTMLDivElement, DualCardProps>(
  (
    {
      className,
      variant,
      elevated,
      onClick,
      leftIcon,
      leftTitle,
      leftSubtitle,
      leftContent,
      leftCTA,
      rightIcon,
      rightTitle,
      rightSubtitle,
      rightContent,
      rightCTA,
      style,
      ...props
    },
    ref
  ) => {
    const variantAttrs = getVariantDataAttrs({ variant });

    const leftHeader = renderCardHeader(leftIcon, leftTitle, leftSubtitle);
    const leftContentNode = renderCardContent(leftContent);
    const rightHeader = renderCardHeader(rightIcon, rightTitle, rightSubtitle);
    const rightContentNode = renderCardContent(rightContent);

    return (
      <div
        ref={ref}
        className={cn(
          'dndev-dual-card',
          surfaceVariants({ variant }),
          className
        )}
        data-role="card"
        data-elevated={
          elevated !== undefined ? (elevated ? 'true' : 'false') : undefined
        }
        data-clickable={onClick ? 'true' : undefined}
        onClick={onClick}
        style={style}
        {...variantAttrs}
        {...props}
      >
        <div className="dndev-dual-card-container">
          {/* Left side */}
          <div className="dndev-dual-card-left">
            {leftHeader}
            {leftContentNode && (
              <div className="dndev-dual-card-content">{leftContentNode}</div>
            )}
            {leftCTA && <div className="dndev-dual-card-cta">{leftCTA}</div>}
          </div>

          {/* Vertical separator */}
          <Separator
            orientation="vertical"
            variant={SEPARATOR_VARIANT.ACCENT}
            className="dndev-dual-card-separator"
          />

          {/* Right side */}
          <div className="dndev-dual-card-right">
            {rightHeader}
            {rightContentNode && (
              <div className="dndev-dual-card-content">{rightContentNode}</div>
            )}
            {rightCTA && <div className="dndev-dual-card-cta">{rightCTA}</div>}
          </div>
        </div>
      </div>
    );
  }
);

DualCard.displayName = 'DualCard';

export default DualCard;
