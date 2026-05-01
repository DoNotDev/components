// packages/components/src/advanced/StackedCards/StackedCardsContent.tsx

/**
 * @fileoverview Stacked Cards Component
 * @description Simple stacked cards with scroll-reveal. Active card shows full content,
 * stacked cards show only bottom edge with number.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import Button from '../../atomic/Button';
import { renderCardHeader, renderCardContent } from '../../atomic/Card';
import Separator, { SEPARATOR_VARIANT } from '../../atomic/Separator';
import Text from '../../atomic/Text';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { cn, getVariantDataAttrs } from '../../utils/helpers';
import { surfaceVariants } from '../../utils/variants';

import type { ComponentData } from '../../types';
import type { SurfaceVariantProps } from '../../utils/variants';
import type { ComponentType, CSSProperties } from 'react';

/**
 * Card data for StackedCards
 */
export type StackedCardData = ComponentData & {
  /** Custom number/label (e.g. "01", "Week 1"). Defaults to index. */
  number?: string | number;
};

/** Kept for backwards compatibility */
export type ResponsiveHeight = [number, number];

/**
 * StackedCards props
 */
export type StackedCardsProps = {
  items: StackedCardData[];
  variant?: SurfaceVariantProps['variant'];
  ariaLabel?: string;
  /** Intersection threshold for reveal (0.0 - 1.0) @default 0.3 */
  threshold?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * StackedCards - Simple scroll-reveal stacked cards
 *
 * Active card renders at full height. Stacked cards show only bottom edge with number.
 * No height calculations - content determines size.
 *
 * @example
 * ```tsx
 * <StackedCards
 *   items={[
 *     { icon: Zap, title: "Fast", content: ["Quick setup", "Easy config"] },
 *     { icon: Shield, title: "Secure", content: ["Encrypted", "Private"] },
 *   ]}
 * />
 * ```
 */
const StackedCardsContent: ComponentType<StackedCardsProps> = ({
  items,
  className,
  ariaLabel,
  variant,
  style,
  threshold = 0.3,
}) => {
  return (
    <div
      className={cn('dndev-stacked-cards-container', className)}
      aria-label={ariaLabel ?? 'Stacked cards'}
      style={style}
    >
      {items.map((item, index) => (
        <StackItem
          key={index}
          item={item}
          index={index}
          variant={variant}
          threshold={threshold}
        />
      ))}
    </div>
  );
};

/** Individual stack item */
const StackItem: ComponentType<{
  item: StackedCardData;
  index: number;
  variant?: SurfaceVariantProps['variant'];
  threshold: number;
}> = ({ item, index, variant, threshold }) => {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLElement>({
    threshold,
    rootMargin: '0px 0px -20% 0px',
    once: true,
  });

  const header = renderCardHeader(item.icon, item.title, item.subtitle);
  const contentNode = renderCardContent(item.content);

  return (
    <section
      ref={ref}
      className="dndev-stack-item"
      data-stacked={isIntersecting ? 'false' : 'true'}
    >
      <div
        className={cn('dndev-card', surfaceVariants({ variant }))}
        {...getVariantDataAttrs({ variant })}
        data-role="card"
        data-clickable={item.onClick ? 'true' : undefined}
        onClick={item.onClick}
      >
        <div className="dndev-stack-content">
          <div className="dndev-stacked-cards-body">
            <div className="dndev-stacked-cards-left">
              {header}
              {item.description && (
                <Text as="p" level="small" variant="muted">
                  {item.description}
                </Text>
              )}
            </div>

            <Separator
              orientation="vertical"
              variant={SEPARATOR_VARIANT.ACCENT}
              className="dndev-stacked-cards-separator"
            />

            {contentNode && (
              <div className="dndev-stacked-cards-right">{contentNode}</div>
            )}
          </div>

          {item.cta && (
            <div className="dndev-stacked-cards-cta">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick?.();
                }}
                variant={item.cta.variant || 'primary'}
                icon={item.cta.icon}
              >
                {item.cta.text}
              </Button>
            </div>
          )}
        </div>

        <div className="dndev-stack-number">
          {item.number ?? String(index + 1).padStart(2, '0')}
        </div>
      </div>
    </section>
  );
};

export default StackedCardsContent;
