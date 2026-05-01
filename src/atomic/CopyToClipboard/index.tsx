// packages/components/src/atomic/CopyToClipboard/index.tsx

/**
 * @fileoverview Copy to clipboard component with visual feedback
 * @description Reusable component for copying text to clipboard using the modern Clipboard API. Features visual feedback, tooltip support, accessibility, and consistent styling with framework components.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { Copy, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import { DISPLAY } from '../../styles/componentConstants';
import { cn } from '../../utils/helpers';
import Button, { type ButtonProps } from '../Button';
import './CopyToClipboard.css';

/** Props for the CopyToClipboard component -- button that copies text to clipboard with visual feedback. */
export interface CopyToClipboardProps extends Omit<
  ButtonProps,
  'children' | 'icon' | 'onCopy'
> {
  /** Text to copy to clipboard */
  text: string;
  /** Custom copy button content */
  children?: React.ReactNode;
  /** Callback when copy is successful */
  onCopy?: (text: string) => void;
  /** Optional onClick handler (called after copy, can be used for stopPropagation) */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Tooltip text when not copied */
  tooltipText?: string;
  /** Tooltip text when copied */
  copiedTooltipText?: string;
  /** Whether to show tooltip */
  showTooltip?: boolean;
  /** Custom aria label */
  ariaLabel?: string;
}
/**
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export const CopyToClipboard: React.ComponentType<CopyToClipboardProps> = ({
  text,
  children,
  variant = 'ghost',
  className,
  onCopy,
  onClick,
  tooltipText = 'Copy to clipboard',
  copiedTooltipText = 'Copied!',
  showTooltip = true,
  ariaLabel,
  ...buttonProps
}) => {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the reset timer on unmount to avoid setState on unmounted component
  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (typeof window === 'undefined' || !navigator?.clipboard) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Clipboard API not available');
        }
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.(text);
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = setTimeout(() => setCopied(false), 2000);
      onClick?.(e);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to copy to clipboard:', error);
      }
      // No fallback - modern browsers should support clipboard API
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      display={children ? DISPLAY.FULL : DISPLAY.COMPACT}
      icon={copied ? Check : Copy}
      onClick={handleCopy}
      tooltip={
        showTooltip ? (copied ? copiedTooltipText : tooltipText) : undefined
      }
      tooltipForceOpen={copied}
      className={cn(
        'dndev-copy-button-transition',
        copied && 'dndev-copy-button-scaled',
        className
      )}
      aria-label={
        ariaLabel || (copied ? 'Copied to clipboard' : 'Copy to clipboard')
      }
      {...buttonProps}
    >
      {children}
    </Button>
  );
};

export default CopyToClipboard;
