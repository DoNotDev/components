// packages/components/src/atomic/CallToAction/index.tsx

/**
 * @fileoverview Call To Action Component
 * @description Simple, conversion-focused CTA section with title, subtitle, and actions.
 * Content width is automatically constrained by PageContainer's --content-width variable.
 *
 * **Polymorphic Component**: Can render as `section`, `aside`, or `div` based on semantic needs.
 * Defaults to `section` for semantic HTML. Use `aside` for sidebar promotional CTAs.
 *
 * **Bleed mode:** When `bleed` is set, the CTA breaks out of `PageContainer`
 * content constraints to span the full viewport width — ideal for immersive CTAs.
 *
 * **Background image:** When `backgroundImage` is set, a cover image fills the CTA
 * with a dark gradient overlay for text readability. Text automatically turns white.
 * Combine with `bleed` for edge-to-edge CTA banners.
 *
 * @example
 * ```tsx
 * // Standard CTA section (default)
 * <CallToAction
 *   title="Ready to launch?"
 *   subtitle="Get started in minutes."
 *   primaryAction={<Button>Sign Up</Button>}
 *   secondaryAction={<Button variant="outline">Learn More</Button>}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Full-width CTA with background image
 * <CallToAction
 *   bleed
 *   backgroundImage="/images/cta-bg.jpg"
 *   title="Ready to move in?"
 *   subtitle="Book a viewing today"
 *   primaryAction={<Button>Contact Us</Button>}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Sidebar promotional CTA
 * <CallToAction
 *   as="aside"
 *   title="Try Premium"
 *   subtitle="Unlock all features"
 *   primaryAction={<Button>Upgrade</Button>}
 * />
 * ```
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import {
  createElement,
  forwardRef,
  type ElementType,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';

import { TONE, type Tone, type TextAlign } from '../../utils/constants';
import { cn } from '../../utils/helpers';
import Text, { TEXT_VARIANT } from '../Text';

import './CallToAction.css';

/**
 * CallToAction-specific props (content directives)
 */
interface CallToActionOwnProps {
  /**
   * Element type to render as
   * @default 'section'
   * @example 'section' - Standard CTA section (default)
   * @example 'aside' - Sidebar promotional CTA
   * @example 'div' - Generic container when semantic meaning not needed
   */
  as?: 'section' | 'aside' | 'div';

  /** Main title */
  title?: string;

  /** Subtitle or description */
  subtitle?: string;

  /** Primary action button (ReactNode - bring your own Button+Link) */
  primaryAction?: ReactNode;

  /** Secondary action button (ReactNode - bring your own Button+Link) */
  secondaryAction?: ReactNode;

  /** Third action button (optional; e.g. tertiary CTA alongside primary + secondary) */
  thirdAction?: ReactNode;

  /**
   * Text alignment (text-align)
   * @default 'center'
   */
  textAlign?: TextAlign;

  /**
   * Item alignment (align-items on content container)
   * @default 'center'
   */
  align?: 'start' | 'center' | 'end' | 'stretch';

  /**
   * Content justification (justify-content on content container)
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

  /**
   * Tone system for background colors (matches Section component)
   * @default 'ghost'
   */
  tone?: Tone;

  /**
   * Full-width bleed — breaks out of content-width constraints
   * to span the full viewport width
   * @default false
   */
  bleed?: boolean;

  /** Background image URL — applies cover image with dark overlay for text readability */
  backgroundImage?: string;

  /** Additional children (for custom content) */
  children?: ReactNode;
}

/**
 * Polymorphic CallToAction props
 * Combines CallToAction-specific props with native element props based on 'as' prop
 */
export type CallToActionProps<T extends ElementType = 'section'> =
  CallToActionOwnProps &
    Omit<ComponentPropsWithRef<T>, keyof CallToActionOwnProps>;

const CallToAction = forwardRef<HTMLElement, CallToActionProps>(
  function CallToAction(
    {
      as = 'section',
      title,
      subtitle,
      primaryAction,
      secondaryAction,
      thirdAction,
      textAlign = 'center',
      align = 'center',
      justify,
      tone = TONE.GHOST,
      bleed = false,
      backgroundImage,
      children,
      className,
      ...props
    },
    ref
  ) {
    const Component = as;

    return createElement(
      Component,
      {
        ref,
        'aria-label': props['aria-label'] || 'Call to Action',
        className: cn(
          'dndev-cta',
          bleed && 'dndev-cta--bleed',
          backgroundImage && 'dndev-cta--bg-image',
          className
        ),
        'data-tone': tone,
        style: {
          ...(backgroundImage
            ? { backgroundImage: `url(${backgroundImage})` }
            : {}),
          ...props.style,
        },
        ...props,
      },
      <div
        className="dndev-cta-content"
        data-text-align={textAlign}
        data-align={align}
        data-justify={justify || undefined}
      >
        {title && (
          <Text
            as="div"
            level="h2"
            style={{ fontSize: 'var(--font-size-2xl)' }}
          >
            {title}
          </Text>
        )}

        {subtitle && (
          <Text as="span" level="h4">
            {subtitle}
          </Text>
        )}

        {(primaryAction || secondaryAction || thirdAction) && (
          <div className="dndev-cta-actions">
            {primaryAction}
            {secondaryAction}
            {thirdAction}
          </div>
        )}

        {children}
      </div>
    );
  }
);

CallToAction.displayName = 'CallToAction';

export default CallToAction;
