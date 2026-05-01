// packages/components/src/advanced/Code/Code.tsx

/**
 * @fileoverview Code Component
 * @description Code component with lazy loading built-in. Features Shiki syntax highlighting, lazy-loaded language support, line numbers, copy to clipboard, theme-aware styling, and SSR/CSR compatibility.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { Suspense, lazy } from 'react';

import CodeSkeleton from './CodeSkeleton';

import type { CodeProps } from './CodeContent';
import type { ComponentType } from 'react';

export type { CodeProps };

const CodeContent = lazy(() => import('./CodeContent'));

/**
 * Code Component with lazy loading built-in
 *
 * Features:
 * - Shiki syntax highlighting
 * - Lazy-loaded language support
 * - Line numbers
 * - Copy to clipboard
 * - Theme-aware styling
 * - SSR/CSR compatible
 * - 100% Lighthouse compliant
 *
 * Automatically lazy-loads the heavy CodeContent component
 */
const Code: ComponentType<CodeProps> = (props) => {
  const {
    showLineNumbers = true,
    showCopyButton = true,
    compact = false,
    children,
  } = props;
  const lineCount =
    typeof children === 'string'
      ? Math.min(children.split('\n').length, 20)
      : 10;

  return (
    <Suspense
      fallback={
        <CodeSkeleton
          showLineNumbers={showLineNumbers}
          showCopyButton={showCopyButton}
          compact={compact}
          lineCount={lineCount}
        />
      }
    >
      <CodeContent {...props} />
    </Suspense>
  );
};

export default Code;
