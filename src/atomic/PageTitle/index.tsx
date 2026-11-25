'use client';
// packages/components/src/atomic/PageTitle/index.tsx

/**
 * @fileoverview PageTitle component
 * @description The page's title block: the page's one `<h1>` (theme h1 size, start edge) and
 * an optional line under it, in its own Section.
 *
 * @version 0.1.0
 * @since 0.3.7
 * @author AMBROISE PARK Consulting
 */

import type { ReactNode } from 'react';

import Section, { type ContentWidth } from '../Section';
import Stack from '../Stack';
import Text from '../Text';

/** Props for PageTitle. */
export interface PageTitleProps {
  /** The page title, rendered as the page's only `<h1>`. */
  title: string;
  /**
   * Line under the title. A string is a muted line (version, lead); a node is rendered as is
   * (status badge and date).
   */
  meta?: ReactNode;
  /**
   * Width of the title block, as `Section`: match the page's content Sections (e.g. `docs`
   * on a legal page).
   */
  contentWidth?: ContentWidth;
}

/**
 * Page title block. Renders the page's `<h1>` at the theme's h1 size, aligned to the start
 * edge (RTL-aware), with an optional `meta` line, in its own `Section`. Place it first in
 * the `PageContainer`; the page's content follows in its own Sections (consecutive Sections
 * share one gap). One per page: a page laid out around its title (a hero, a product) keeps
 * its own h1 instead. `Section` `title` is a section label (h2-h6) and `HeroSection` `title`
 * is not a heading element, so neither gives a page its h1.
 *
 * @component
 * @example
 * ```tsx
 * <PageContainer>
 *   <PageTitle title={t('orders.title')} />
 *   <Section>...</Section>
 * </PageContainer>
 *
 * // Version line, same width as the content Sections
 * <PageTitle title={t('cgv.title')} meta={t('cgv.version')} contentWidth="docs" />
 *
 * // Node meta: rendered as is
 * <PageTitle title={order.ref} meta={<Badge>{status}</Badge>} />
 * ```
 */
function PageTitle({ title, meta, contentWidth }: PageTitleProps) {
  return (
    <Section textAlign="start" contentWidth={contentWidth}>
      <Stack gap="tight">
        <Text as="h1" textAlign="start">
          {title}
        </Text>
        {typeof meta === 'string' ? <Text variant="muted">{meta}</Text> : meta}
      </Stack>
    </Section>
  );
}

export default PageTitle;
