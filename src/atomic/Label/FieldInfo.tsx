'use client';
// packages/components/src/atomic/Label/FieldInfo.tsx

/**
 * @fileoverview FieldInfo component
 * @description (i) button next to a field label: its help text shows on hover and
 * keyboard focus (tooltip), and on tap for touch screens, where hover does not exist.
 *
 * @version 0.1.0
 * @since 0.2.5
 * @author AMBROISE PARK Consulting
 */

import { useState } from 'react';

import { Info } from 'lucide-react';

import Icon from '../Icons/Icon';
import Tooltip from '../Tooltip';

/** Props for {@link FieldInfo}. */
export interface FieldInfoProps {
  /** Help text: what the field is for, in the reader's words. Also the button's accessible name. */
  text: string;
}

/**
 * (i) help button for a field label. Hover or focus shows the text; a tap (or click)
 * pins it open until the button loses focus or Escape is pressed.
 *
 * @component
 * @example
 * ```tsx
 * <FieldInfo text="Address of the page: /routines/oily-skin" />
 * ```
 */
export function FieldInfo({ text }: FieldInfoProps) {
  const [pinned, setPinned] = useState(false);
  return (
    <Tooltip content={text} side="top" forceOpen={pinned || undefined}>
      <button
        type="button"
        className="dndev-field-info"
        aria-label={text}
        onClick={() => setPinned((open) => !open)}
        onBlur={() => setPinned(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setPinned(false);
        }}
      >
        <Icon icon={Info} ariaHidden={true} />
      </button>
    </Tooltip>
  );
}

export default FieldInfo;
