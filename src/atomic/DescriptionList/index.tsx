// packages/components/src/atomic/DescriptionList/index.tsx

/**
 * @fileoverview DescriptionList component
 * @description Semantic description list for key-value pairs, specifications, and metadata
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { cn } from '../../utils/helpers';

import type { ReactNode, HTMLAttributes } from 'react';
import './DescriptionList.css';

/** Single term/definition pair within a DescriptionList. */
export interface DescriptionItem {
  /** Term/label (dt) */
  label: string;
  /** Definition/value (dd) */
  value: ReactNode;
  /** Optional additional CSS classes for this item */
  className?: string;
}

/** Props for the DescriptionList component -- semantic key-value pairs. */
export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  /** Array of term/definition pairs */
  items: DescriptionItem[];
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Additional CSS classes */
  className?: string;
}

/**
 * DescriptionList component for key-value pairs, specifications, and metadata.
 * Uses semantic HTML (dl, dt, dd) for proper accessibility.
 *
 * @component
 * @example
 * ```tsx
 * // User information
 * <DescriptionList items={[
 *   { label: 'Email', value: user.email },
 *   { label: 'Plan', value: 'Pro' },
 *   { label: 'Status', value: <Badge>Active</Badge> }
 * ]} />
 *
 * // Horizontal layout
 * <DescriptionList
 *   items={[{ label: 'Price', value: '$99' }]}
 *   orientation="horizontal"
 * />
 * ```
 * @param {DescriptionListProps} props - The props for the description list
 * @returns {JSX.Element} The rendered description list component
 */
const DescriptionList = ({
  items,
  orientation = 'vertical',
  className,
  ...props
}: DescriptionListProps) => {
  return (
    <dl
      className={cn('dndev-description-list', className)}
      data-orientation={orientation}
      {...props}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={cn('dndev-description-item', item.className)}
        >
          <dt className="dndev-description-term">{item.label || ''}</dt>
          <dd className="dndev-description-details">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export default DescriptionList;
