// packages/components/src/atomic/SkipLink/index.tsx

/**
 * @fileoverview SkipLink component
 * @description Accessibility skip-to-content links that become visible only on keyboard focus.
 * Should be placed as the first focusable element in the DOM. Supports multiple targets.
 * Gracefully degrades without JS via native anchor behavior.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { HTMLAttributes, MouseEvent } from 'react';

import { cn } from '../../utils/helpers';

import './SkipLink.css';

/** Single target within a SkipLink navigation. */
export interface SkipLinkItem {
  /** Target element ID (without #). The href will be `#${targetId}` */
  targetId: string;
  /** Visible label when focused (e.g., "Skip to main content") */
  label: string;
}

/** Props for the SkipLink component -- accessibility skip-to-content links. */
export interface SkipLinkProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'role'
> {
  /**
   * Array of skip link targets.
   * Each renders as a focusable anchor that scrolls to and focuses the target.
   */
  items: SkipLinkItem[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Handle skip link click: scroll to target and focus it.
 * Makes non-focusable targets temporarily focusable via tabindex="-1".
 */
function handleSkipClick(e: MouseEvent<HTMLAnchorElement>, targetId: string) {
  e.preventDefault();
  const target = document.getElementById(targetId);
  if (!target) return;

  // Make target focusable if it isn't already
  const isFocusable = target.matches(
    'a, button, input, select, textarea, [tabindex]'
  );
  if (!isFocusable) {
    target.setAttribute('tabindex', '-1');
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), {
      once: true,
    });
  }

  target.scrollIntoView({ behavior: 'smooth' });
  target.focus({ preventScroll: true });
}

/**
 * Accessibility skip links — invisible until focused via keyboard.
 * Place as the first element in the page body.
 *
 * @component
 * @example
 * ```tsx
 * <SkipLink
 *   items={[
 *     { targetId: 'main-content', label: 'Skip to main content' },
 *     { targetId: 'navigation', label: 'Skip to navigation' },
 *   ]}
 * />
 * ```
 *
 * @param {SkipLinkProps} props - The props for the skip links
 * @returns {JSX.Element} The rendered skip link navigation
 */
function SkipLink({ items, className, ...props }: SkipLinkProps) {
  return (
    <nav
      aria-label="Skip links"
      className={cn('dndev-skip-links', className)}
      {...props}
    >
      {items.map((item) => (
        <a
          key={item.targetId}
          href={`#${item.targetId}`}
          className="dndev-skip-link"
          onClick={(e) => handleSkipClick(e, item.targetId)}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export default SkipLink;
