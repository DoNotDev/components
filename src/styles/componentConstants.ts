// packages/components/src/styles/componentConstants.ts

/**
 * @fileoverview Component Style Constants
 * @description Component class names and CSS variable definitions. Used for Tailwind safelist and IDE autocomplete. Defines all component classes, animation classes, debug classes, and CSS custom properties.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

/**
 * Component class names defined in patterns.css
 * Used for Tailwind safelist and IDE autocomplete
 */
export const componentClasses = {
  // Interactive elements
  srOnly: 'dndev-sr-only',
  interactive: 'dndev-interactive',
  control: 'dndev-control',
  notification: 'dndev-notification',

  // Form components
  input: 'dndev-input',

  // Container components
  surface: 'dndev-surface',
  overlay: 'dndev-overlay',

  // Utility components
  spinner: 'dndev-spinner',
} as const;

/**
 * Essential utility classes that cannot be replaced by Stack/Grid components
 * Only utilities that Stack/Grid don't cover (flex grow/shrink, visibility, height for modals, z-index)
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export const essentialUtilities = {
  // Flex utilities (not covered by Stack/Grid)
  flex1: 'dndev-flex-1',
  flexShrink0: 'dndev-flex-shrink-0',

  // Visibility
  hidden: 'dndev-hidden',

  // Height utilities (for modals/dialogs - not layout)
  hScreen: 'dndev-h-screen',
  minHScreen: 'dndev-min-h-screen',
  maxHScreen: 'dndev-max-h-screen',
  h90: 'dndev-h-90',
  minH90: 'dndev-min-h-90',
  maxH90: 'dndev-max-h-90',
  h80: 'dndev-h-80',
  minH80: 'dndev-min-h-80',
  maxH80: 'dndev-max-h-80',
  h60: 'dndev-h-60',
  minH60: 'dndev-min-h-60',
  maxH60: 'dndev-max-h-60',

  // Size utilities
  sizeMd: 'dndev-size-md',
  sizeTouch: 'dndev-size-touch',

  // Z-index utilities (for layering - not layout)
  zHeader: 'dndev-z-header',
  zSidebar: 'dndev-z-sidebar',
  zFooter: 'dndev-z-footer',
  zOverlay: 'dndev-z-overlay',
  zBreadcrumbs: 'dndev-z-breadcrumbs',
  zDropdown: 'dndev-z-dropdown',
  zModal: 'dndev-z-modal',
  zTooltip: 'dndev-z-tooltip',
  zToast: 'dndev-z-toast',
} as const;

/**
 * Animation class names defined in animations.css and utilities.css
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export const animationClasses = {
  // Basic animations
  spin: 'dndev-animate-spin',
  pulse: 'dndev-animate-pulse',
  bounce: 'dndev-animate-bounce',
  fadeIn: 'dndev-animate-fade-in',
  slideIn: 'dndev-animate-slide-in',
  scaleIn: 'dndev-animate-scale-in',
} as const;

/**
 * Debug utility class names defined in utilities.css
 * Only active when --debug-enabled CSS variable is set to 1
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export const debugClasses = {
  layout: 'debug-layout',
  flex: 'debug-flex',
  component: 'debug-component',
} as const;

/**
 * CSS custom property names for programmatic access
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export const cssVariables = {
  // Interactive elements
  touchTarget: '--touch-target',
  iconMd: '--icon-md',
  iconTouch: '--icon-touch',

  // Border radius
  radius: '--radius',
  radiusNone: '--radius-none',
  radiusMd: '--radius-md',
  radiusFull: '--radius-full',
  radiusInteractive: '--radius-interactive',
  radiusSurface: '--radius-surface',
  radiusFloating: '--radius-floating',

  // Typography scale
  fontSizeXs: '--font-size-xs',
  fontSizeSm: '--font-size-sm',
  fontSizeBase: '--font-size-base',
  fontSizeLg: '--font-size-lg',
  fontSizeXl: '--font-size-xl',
  fontSize2xl: '--font-size-2xl',
  fontSize3xl: '--font-size-3xl',

  // Line height
  lineHeight: '--line-height',

  // Character limits
  textMaxWidth: '--content-text',

  // Elevation system - STREAMLINED (3 levels)
  shadowSm: '--shadow-sm',
  shadowMd: '--shadow-md',
  shadowXl: '--shadow-xl',
  shadowNone: '--shadow-none',

  // Content-aware containers
  contentText: '--content-text',
  contentTable: '--content-table',
  contentDashboard: '--content-dashboard',

  // Gap system - 4 tiers only
  gapNone: '--gap-none',
  gapSm: '--gap-sm',
  gapMd: '--gap-md',
  gapLg: '--gap-lg',
} as const;

/**
 * Gap variant constants - DRY single source of truth
 * Used for gap/spacing props across all components
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export const GAP_VARIANT = {
  NONE: 'none',
  TIGHT: 'tight',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

/**
 * Display variant constants - DRY single source of truth
 * Used for display prop across UI/features components to control presentation in preset layouts
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export const DISPLAY = {
  COMPACT: 'compact',
  FULL: 'full',
  AUTO: 'auto',
} as const;

/**
 * Combined export of all classes for convenience
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export const allClasses = {
  ...componentClasses,
  ...essentialUtilities,
  ...animationClasses,
  ...debugClasses,
} as const;
