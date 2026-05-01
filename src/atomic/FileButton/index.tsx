// packages/components/src/atomic/FileButton/index.tsx

/**
 * @fileoverview File Button Component
 * @description Button component that triggers file input selection. Provides a styled button interface for file uploads.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '../../utils/helpers';
import { buttonVariants } from '../Button';
import Slot from '../Slot';
import './FileButton.css';

import type { VariantProps } from 'class-variance-authority';

/** Props for the FileButton component -- styled button that triggers file input selection. */
export interface FileButtonProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children' | 'size'>,
    VariantProps<typeof buttonVariants> {
  label?: ReactNode;
  asChild?: boolean;
}

/**
 * File button component
 *
 * Renders a button that triggers file input selection.
 *
 * @param {FileButtonProps} props - Component props
 * @returns {JSX.Element} File button component
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
const FileButton = ({
  label = 'Upload',
  variant = 'primary',
  className,
  asChild = false,
  onChange,
  ...inputProps
}: FileButtonProps) => {
  const internalRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    internalRef.current?.click();
  };

  const Comp = asChild ? Slot : 'label';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      <Comp
        onClick={handleClick}
        className={cn(
          buttonVariants({ variant, className }),
          'dndev-file-button-label'
        )}
        role="button"
        aria-label={typeof label === 'string' ? label : 'file-button'}
      >
        {label}
      </Comp>
      <input
        {...inputProps}
        ref={internalRef}
        type="file"
        className="dndev-sr-only"
        onChange={(event) => {
          onChange?.(event);
        }}
      />
    </div>
  );
};

/**
 * Default export of file button component
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export default FileButton;
