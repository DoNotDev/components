// packages/components/src/rsc.ts

/**
 * @fileoverview Components package, React Server Components entry
 * @description `@donotdev/components/rsc`: resolves only under the `react-server`
 * export condition (Next's RSC graph); anywhere else the import fails to resolve.
 * Nothing imports it yet: `@donotdev/components` itself stays `index.ts` everywhere.
 *
 * Same exports as `index.ts`, without its `'use client'`: presentational modules
 * (Stack, Text, Grid, Button…) load as server components, and every interactive
 * module keeps its own per-file `'use client'`, so a server component that renders it
 * gets a client reference (an island). Values exported by a `'use client'` module
 * (hooks, providers, helpers) are client references here: calling them on the server
 * throws, which is the intended fail-loud.
 *
 * Keep in sync with `index.ts` (the entries test compares both export lists).
 *
 * @version 0.1.0
 * @since 0.3.2
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
