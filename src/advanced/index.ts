// packages/components/src/advanced/index.ts

/**
 * @fileoverview Advanced Components
 * @description Complex, composite UI components for DoNotDev framework
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

export { default as Bento } from './Bento';
export type {
  BentoProps,
  BentoCellData,
  BentoGap,
  BentoColumns,
} from './Bento';

export { default as Code } from './Code';
export type { CodeProps } from './Code';

export { default as JsonViewer } from './JsonViewer';

export { default as ImageGallery } from './ImageGallery';
export type { ImageGalleryProps, ImageData, ImageFit } from './ImageGallery';

export { default as Carousel } from './Carousel';
export type { CarouselProps, CarouselRef } from './Carousel';

export { default as Crawl } from './Crawl';
export type { CrawlProps } from './Crawl/Crawl';

export { default as Marquee } from './Marquee';
export type { MarqueeProps } from './Marquee/MarqueeContent';

export { default as Reveal } from './Reveal';
export type { RevealProps } from './Reveal/Reveal';

export { default as Roadmap } from './Roadmap';
export type { RoadmapProps, RoadmapStep } from './Roadmap';

export { default as SplitReveal } from './SplitReveal';
export type { SplitRevealProps, StatCardData } from './SplitReveal';

export { default as StackedCards } from './StackedCards';
export type {
  StackedCardsProps,
  StackedCardData,
  ResponsiveHeight,
} from './StackedCards';
