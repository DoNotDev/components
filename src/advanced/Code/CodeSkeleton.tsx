// packages/components/src/advanced/Code/CodeSkeleton.tsx

/**
 * @fileoverview Code Skeleton Component
 * @description Loading skeleton for Code component
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import Stack from '../../atomic/Stack';
import { cn } from '../../utils/helpers';

/** Props for the Code loading skeleton. */
export type CodeSkeletonProps = {
  className?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  compact?: boolean;
  lineCount?: number;
};

function CodeSkeleton({
  className,
  showLineNumbers = true,
  showCopyButton = true,
  compact = false,
  lineCount = 10,
}: CodeSkeletonProps) {
  return (
    <div
      className={cn('dndev-relative', className)}
      style={{
        opacity: 'var(--opacity-muted)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--muted)',
      }}
      role="status"
      aria-label="Loading code"
    >
      <Stack direction="row">
        {showLineNumbers && (
          <div
            className="dndev-flex-shrink-0"
            style={{
              borderInlineEnd: '1px solid var(--border)',
              backgroundColor: 'var(--muted)',
              padding: '1rem',
              textAlign: 'end',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--muted-foreground)',
              opacity: 'var(--opacity-subtle)',
              fontFamily: 'var(--font-mono)',
              userSelect: 'none',
            }}
          >
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i} style={{ height: '1.25rem', lineHeight: '1.25rem' }}>
                {i + 1}
              </div>
            ))}
          </div>
        )}

        <div className="dndev-flex-1 dndev-min-w-0">
          <div className="dndev-relative">
            {showCopyButton && (
              <div
                className="dndev-absolute dndev-z-breadcrumbs dndev-animate-pulse"
                style={{
                  top: '0.5rem',
                  insetInlineEnd: '0.5rem',
                  width: '2rem',
                  height: '2rem',
                  backgroundColor: 'var(--muted)',
                  borderRadius: 'var(--radius)',
                }}
              />
            )}

            <pre className="dndev-overflow-x-auto" style={{ padding: '1rem' }}>
              <code
                className="dndev-block"
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {Array.from({ length: lineCount }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: '1.25rem',
                      lineHeight: '1.25rem',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <span
                      className="dndev-inline dndev-animate-pulse"
                      style={{
                        display: 'inline-block',
                        width: `${((i * 37 + 13) % 40) + 20}%`,
                        height: '1em',
                        backgroundColor: 'var(--muted)',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </Stack>
    </div>
  );
}

export default CodeSkeleton;
