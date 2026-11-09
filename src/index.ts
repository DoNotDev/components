'use client';
// packages/components/src/index.ts

/**
 * @fileoverview Components package
 * @description UI component library for DoNotDev framework
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

// Export all atomic components
export * from './atomic';

// Export advanced components (optional peer dependencies)
export { default as Bento } from './advanced/Bento';
export type {
  BentoProps,
  BentoCellData,
  BentoGap,
  BentoColumns,
} from './advanced/Bento';
export { default as Code } from './advanced/Code';
export type { CodeProps } from './advanced/Code';
export { default as JsonViewer } from './advanced/JsonViewer';
export type { JsonViewerProps } from './advanced/JsonViewer';
export { default as ImageGallery } from './advanced/ImageGallery';
export type { ImageGalleryProps, ImageData, ImageFit } from './advanced/ImageGallery';

export { default as Carousel } from './advanced/Carousel';
export type { CarouselProps, CarouselRef } from './advanced/Carousel';
export { default as Crawl } from './advanced/Crawl';
export type { CrawlProps } from './advanced/Crawl/Crawl';

export { default as Marquee } from './advanced/Marquee';
export type { MarqueeProps } from './advanced/Marquee/MarqueeContent';
export { default as Reveal } from './advanced/Reveal';
export type { RevealProps } from './advanced/Reveal/Reveal';
export { default as Roadmap } from './advanced/Roadmap';
export type { RoadmapProps, RoadmapStep } from './advanced/Roadmap';
export { default as SplitReveal } from './advanced/SplitReveal';
export type { SplitRevealProps, StatCardData } from './advanced/SplitReveal';
export { default as StackedCards } from './advanced/StackedCards';
export type {
  StackedCardsProps,
  StackedCardData,
  ResponsiveHeight,
} from './advanced/StackedCards';

// Export Hooks, Styles, Types, and Utils
export * from './hooks';
export * from './styles';
export * from './types';
export * from './utils';
