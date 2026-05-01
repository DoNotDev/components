// packages/components/src/utils/variants.ts

/**
 * @fileoverview Shared variant utilities
 * @description DRY variant functions used across multiple components
 */

import { cva, type VariantProps } from 'class-variance-authority';

import { SURFACE_VARIANT } from './constants';

/**
 * Surface variants - base styling for all surface components
 * Only handles colors/variants, no layout
 * Used by: Card, DualCard, StackedCards, Dialog, Sheet, Alert
 */
export const surfaceVariants = cva('dndev-surface', {
  variants: {
    variant: {
      [SURFACE_VARIANT.DEFAULT]: '',
      [SURFACE_VARIANT.MUTED]: '',
      [SURFACE_VARIANT.PRIMARY]: '',
      [SURFACE_VARIANT.SECONDARY]: '',
      [SURFACE_VARIANT.ACCENT]: '',
      [SURFACE_VARIANT.SUCCESS]: '',
      [SURFACE_VARIANT.WARNING]: '',
      [SURFACE_VARIANT.DESTRUCTIVE]: '',
      [SURFACE_VARIANT.OUTLINE]: '',
      [SURFACE_VARIANT.GLASS]: '',
    },
  },
  defaultVariants: {
    variant: SURFACE_VARIANT.DEFAULT,
  },
});

/** CVA variant props for surface components (Card, DualCard, etc.). */
export type SurfaceVariantProps = VariantProps<typeof surfaceVariants>;
