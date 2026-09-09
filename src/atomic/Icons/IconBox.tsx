// packages/components/src/atomic/Icons/IconBox.tsx

/**
 * @fileoverview Icon Box Component
 * @description Touch target container for icons with consistent sizing. Supports Lucide icons, emojis, and custom ReactNode icons.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { ComponentType } from 'react';

import Icon from './Icon';
import type { IconType } from '../../types';
import './IconBox.css';

/**
 * Icon box component props
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface IconBoxProps {
  /** Icon - Lucide component, emoji string, Lucide icon name string, or ReactNode */
  icon?: IconType;
  /** Additional className for the container */
  className?: string;
  /** Whether icon should be aria-hidden */
  ariaHidden?: boolean;
  /** Tooltip text (HTML title attribute) */
  tooltip?: string;
}

/**
 * IconBox Component
 *
 * A 48px touch target container for icons (Lucide, emoji, or custom).
 * Provides consistent sizing and styling for icon containers across the framework.
 *
 * Features:
 * - 48px default size (touch target standard)
 * - Inherits card/theme styles automatically
 * - Works with Lucide icons, emojis, and custom ReactNode
 * - Smart default sizing for emojis
 *
 * @example
 * ```tsx
 * import { Home } from 'lucide-react';
 *
 * // Lucide icon - default 48px (standalone)
 * <IconBox icon={Home} />
 *
 * // Emoji - default 48px
 * <IconBox icon="🏗️" />
 *
 * // Embedded icon - 20px
 * <IconBox icon={Home} />
 *
 * // Custom size
 * <IconBox icon="❤️" size={64} />
 * ```
 *
 * @param {IconBoxProps} props - Component props
 * @returns {JSX.Element} Icon box component
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
const IconBox: ComponentType<IconBoxProps> = ({
  icon,
  className,
  ariaHidden = false,
  tooltip,
}) => {
  return (
    <div className={`dndev-icon-box ${className || ''}`} title={tooltip}>
      <Icon icon={icon} ariaHidden={ariaHidden} />
    </div>
  );
};

/**
 * Default export of icon box component
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export default IconBox;
