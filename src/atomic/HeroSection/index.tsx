// packages/components/src/atomic/HeroSection/index.tsx

/**
 * @fileoverview Hero Section Component
 * @description Punchy hero section with gradient title, subtitle, and optional children.
 * Title always renders as h1 with maximum impact. Users who need different sizing make their own.
 *
 * **Polymorphic Component**: Can render as `section`, `header`, or `div` based on semantic needs.
 *
 * **Bleed mode:** When `bleed` is set, the hero breaks out of `PageContainer`
 * content constraints to span the full viewport width — ideal for immersive hero banners.
 *
 * **Background image:** When `backgroundImage` is set, a cover image fills the hero
 * with a dark gradient overlay for text readability. Text automatically turns white.
 * Combine with `bleed` for edge-to-edge hero banners.
 *
 * @example
 * ```tsx
 * // Basic hero
 * <HeroSection
 *   title="Build Faster"
 *   subtitle="The ultimate framework"
 *   badge="New v2.0"
 * >
 *   <Button>Get Started</Button>
 * </HeroSection>
 *
 * // Full-width hero with background image
 * <HeroSection
 *   bleed
 *   backgroundImage="/images/hero-banner.jpg"
 *   title="Find Your Dream Home"
 *   subtitle="Premium apartments in Paris"
 *   fullHeight
 * >
 *   <Button>Browse Listings</Button>
 * </HeroSection>
 * ```
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { cva, type VariantProps } from 'class-variance-authority';
import {
  createElement,
  forwardRef,
  type ElementType,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';

import { TONE, type Tone, type TextAlign } from '../../utils/constants';
import { cn } from '../../utils/helpers';
import Badge, { BADGE_VARIANT } from '../Badge';
import Stack from '../Stack';
import Text from '../Text';

import './HeroSection.css';

const heroSectionVariants = cva('', {
  variants: {
    variant: {
      primary: '',
      subtle: '',
      accent: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

interface HeroSectionOwnProps extends VariantProps<typeof heroSectionVariants> {
  /** Element type to render as @default 'section' */
  as?: 'section' | 'header' | 'div';
  /** Badge text */
  badge?: string;
  /** Hero title (renders as h1 with gradient) - string or ReactNode for Trans */
  title?: string | ReactNode;
  /** Hero subtitle - string or ReactNode for Trans */
  subtitle?: string | ReactNode;
  /** Full viewport height */
  fullHeight?: boolean;
  /**
   * Text alignment (text-align)
   * @default 'center'
   */
  textAlign?: TextAlign;

  /**
   * Item alignment (align-items)
   * @default 'center'
   */
  align?: 'start' | 'center' | 'end' | 'stretch';

  /**
   * Content justification (justify-content)
   * @default 'center'
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Tone system for background colors (matches Section/CallToAction) */
  tone?: Tone;
  /**
   * Full-width bleed — breaks out of content-width constraints
   * to span the full viewport width
   * @default false
   */
  bleed?: boolean;
  /** Background image URL — applies cover image with dark overlay for text readability */
  backgroundImage?: string;
  /**
   * How the background image fits the hero.
   * - `'cover'` — fills the section, may crop (default)
   * - `'contain'` — shows the full image, width 100%, height follows aspect ratio
   * @default 'cover'
   */
  backgroundFit?: 'cover' | 'contain';
  /** Content */
  children?: ReactNode;
}

/**
 * Polymorphic HeroSection props
 * Combines HeroSection-specific props with native element props based on 'as' prop
 */
export type HeroSectionProps<T extends ElementType = 'section'> =
  HeroSectionOwnProps &
    Omit<ComponentPropsWithRef<T>, keyof HeroSectionOwnProps>;

const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(
  function HeroSection(
    {
      as = 'section',
      badge,
      title,
      subtitle,
      variant,
      fullHeight = false,
      textAlign = 'center',
      align = 'center',
      justify = 'center',
      tone = TONE.GHOST,
      bleed = false,
      backgroundImage,
      backgroundFit = 'cover',
      children,
      className,
      ...props
    },
    ref
  ) {
    return createElement(
      as,
      {
        ref,
        className: cn(
          'dndev-hero-section',
          bleed && 'dndev-hero-section--bleed',
          backgroundImage &&
            backgroundFit !== 'contain' &&
            'dndev-hero-section--bg-image',
          backgroundImage &&
            backgroundFit === 'contain' &&
            'dndev-hero-section--bg-contain',
          className
        ),
        'data-text-align': textAlign,
        'data-align': align,
        'data-justify': justify,
        'data-variant': variant || undefined,
        'data-tone': tone,
        style: {
          ...(fullHeight
            ? {
                height:
                  'calc(100dvh - var(--header-height, 0px) - var(--footer-height, 0px))',
                minHeight:
                  'calc(100dvh - var(--header-height, 0px) - var(--footer-height, 0px))',
              }
            : {}),
          ...(backgroundImage && backgroundFit !== 'contain'
            ? { backgroundImage: `url(${backgroundImage})` }
            : {}),
          ...props.style,
        },
        ...props,
      },
      ...(backgroundFit === 'contain' && backgroundImage
        ? [
            <img
              key="hero-img"
              src={backgroundImage}
              alt=""
              aria-hidden="true"
              className="dndev-hero-section__img"
            />,
            <div key="hero-text" className="dndev-hero-section__text">
              <Stack>
                {badge && <Badge variant={BADGE_VARIANT.ACCENT}>{badge}</Badge>}
                {title && (
                  <Text
                    as="div"
                    level="h1"
                    className="dndev-hero-title"
                    data-gradient-text={
                      variant === 'subtle' ? undefined : variant || 'primary'
                    }
                  >
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text as="p" level="body" className="dndev-hero-subtitle">
                    {subtitle}
                  </Text>
                )}
                {children}
              </Stack>
            </div>,
          ]
        : [
            <Stack key="hero-content">
              {badge && <Badge variant={BADGE_VARIANT.ACCENT}>{badge}</Badge>}
              {title && (
                <Text
                  as="div"
                  level="h1"
                  className="dndev-hero-title"
                  data-gradient-text={
                    variant === 'subtle' ? undefined : variant || 'primary'
                  }
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text as="p" level="body" className="dndev-hero-subtitle">
                  {subtitle}
                </Text>
              )}
              {children}
            </Stack>,
          ])
    );
  }
);

HeroSection.displayName = 'HeroSection';

export default HeroSection;
