// packages/components/src/atomic/HoverCard/index.tsx

/**
 * @fileoverview HoverCard component
 * @description Accessible hover card component built on Radix UI primitives.
 * Accepts Card props and renders a Card internally.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useState } from 'react';
import type { ReactNode } from 'react';

import {
  HoverCardPrimitive,
  HoverCardTrigger,
  HoverCardContent,
} from './HoverCardPrimitive';
import { cn } from '../../utils/helpers';
import Card, { type CardProps } from '../Card';

/** Props for the HoverCard component -- Card content revealed on hover. */
export interface HoverCardProps extends Pick<
  CardProps,
  'title' | 'subtitle' | 'content' | 'footer' | 'icon' | 'variant'
> {
  /** Trigger element (button, text, avatar, etc.) */
  trigger?: ReactNode;
  /** HoverCard content (alternative to content prop, for full control) */
  children?: ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Delay before opening (ms) */
  openDelay?: number;
  /** Delay before closing (ms) */
  closeDelay?: number;
  /** Alignment relative to trigger */
  align?: 'start' | 'center' | 'end';
  /** Side to show hover card */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Side offset in pixels */
  sideOffset?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Accessible hover card component.
 * Shows rich content on hover using Radix HoverCard primitive.
 *
 * ⚠️ **Desktop only**: This component uses hover events and does not support touch/click interactions.
 * For mobile/click support, use {@link Popover} instead.
 *
 * Accepts Card props (title, subtitle, content, footer, variant, icon) and renders a Card internally.
 *
 * @component
 * @example
 * ```tsx
 * // Using Card props
 * <HoverCard
 *   trigger={<Avatar src="..." />}
 *   title="John Doe"
 *   subtitle="Software Engineer"
 *   content="Building amazing products"
 * />
 *
 * // Using children for full control
 * <HoverCard trigger={<Avatar src="..." />}>
 *   <Stack gap="tight">
 *     <Text>John Doe</Text>
 *     <Text variant="muted">Software Engineer</Text>
 *   </Stack>
 * </HoverCard>
 * ```
 * @param {HoverCardProps} props - The props for the hover card
 * @returns {JSX.Element} The rendered hover card
 */
function HoverCard({
  trigger,
  title,
  subtitle,
  content,
  footer,
  icon,
  variant,
  children,
  open,
  onOpenChange,
  openDelay = 0,
  closeDelay = 0,
  align = 'center',
  side = 'bottom',
  sideOffset = 4,
  className,
}: HoverCardProps) {
  const hasCardProps = !!(
    title ||
    subtitle ||
    content ||
    footer ||
    icon ||
    variant
  );
  const cardContent = hasCardProps ? (
    <Card
      title={title}
      subtitle={subtitle}
      content={content}
      footer={footer}
      icon={icon}
      variant={variant}
    />
  ) : (
    children
  );

  return (
    <HoverCardPrimitive
      open={open}
      onOpenChange={onOpenChange}
      openDelay={openDelay}
      closeDelay={closeDelay}
    >
      {trigger && <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>}
      <HoverCardContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn(
          'dndev-z-tooltip dndev-hovercard-content',
          !hasCardProps && 'dndev-surface',
          className
        )}
      >
        {cardContent}
      </HoverCardContent>
    </HoverCardPrimitive>
  );
}

export default HoverCard;
