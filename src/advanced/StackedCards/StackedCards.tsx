// packages/components/src/advanced/StackedCards/StackedCards.tsx

/**
 * @fileoverview Stacked Cards Component
 * @description Simple scroll-reveal stacked cards. Active card shows full content,
 * stacked cards show only bottom edge with number. No height calculations.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import StackedCardsContent, {
  type StackedCardsProps,
} from './StackedCardsContent';

/**
 * StackedCards - Scroll-reveal card stack
 *
 * Cards reveal as user scrolls. Each card shows at natural height.
 * Stacked cards collapse to show only bottom edge with number.
 */
const StackedCards = (props: StackedCardsProps) => {
  return <StackedCardsContent {...props} />;
};

export default StackedCards;
