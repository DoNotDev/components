// packages/components/src/types.ts

/**
 * @fileoverview Component Type Definitions
 * @description Type definitions for component props and data structures used across the components package.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { LucideProps } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

import type { ButtonVariant } from './atomic/Button';

/**
 * Icon type definition
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
// why: public type; accepts icon components with arbitrary props (narrowing is an API change, see any-audit)
export type IconType =
  | ComponentType<LucideProps>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- why: see the why: comment above
  | ComponentType<any>
  | string
  | ReactNode;

/**
 * Standardized content data structure for all marketing components.
 * This ensures consistency across Reveal, Carousel, etc.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export type ComponentData = {
  /** Icon to display (Lucide component or React node) */
  icon?: IconType | ReactNode;
  /** Main title/heading */
  title: string;
  /** Optional subtitle or secondary text */
  subtitle?: string;
  /** Optional description paragraph */
  description?: string;
  /** Optional content items - string, string[], or ReactNode for full control */
  content?: string | string[] | ReactNode;
  /** Optional unique identifier */
  id?: string;
  /** Optional URL for linking */
  href?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Optional CTA button configuration */
  cta?: {
    /** Button text */
    text: string;
    /** Button variant/style */
    variant?: ButtonVariant;
    /** Optional icon for the button */
    icon?: IconType | ReactNode;
  };
};
