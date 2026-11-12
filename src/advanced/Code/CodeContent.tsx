// packages/components/src/advanced/Code/CodeContent.tsx

/**
 * @fileoverview Code Display Component
 * @description Professional IDE-style code display component with Shiki syntax highlighting
 *
 * Gracefully degrades to basic <pre><code> if shiki is not installed.
 * To enable syntax highlighting: npm install shiki
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useEffect, useMemo, useState } from 'react';

import CopyToClipboard from '../../atomic/CopyToClipboard';
import ScrollArea from '../../atomic/ScrollArea';
import Stack from '../../atomic/Stack';
import Text from '../../atomic/Text';
import { useIsDark } from '../../utils/isDark';

// Optional peer dependency - graceful degradation if not installed
/** Minimal shape of Shiki's HighlighterGeneric — avoids hard dependency on shiki types */
interface Highlighter {
  getLoadedLanguages(): string[];
  codeToHtml(code: string, options: { lang: string; theme: string }): string;
}

/** Props for the Code component -- syntax-highlighted code block. */
export interface CodeProps {
  /**
   * Code content to display
   */
  children: string;
  /**
   * Programming language for syntax highlighting
   * @default 'tsx'
   */
  language?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Show line numbers
   * @default true
   */
  showLineNumbers?: boolean;
  /**
   * Enable word wrapping for long lines
   * @default false
   */
  wrapLines?: boolean;
  /**
   * Show copy button
   * @default true
   */
  showCopyButton?: boolean;
  /**
   * Callback when copy button is clicked
   */
  onCopy?: (code: string) => void;
  /**
   * Compact/minimalist mode - hides header, reduces padding, hides copy button
   * @default false
   */
  compact?: boolean;
}

/**
 * Professional IDE-style code display component with Shiki syntax highlighting
 *
 * Features:
 * - Shiki-based syntax highlighting (better quality, smaller bundle)
 * - Lazy-loaded highlighter (zero bundle impact until used)
 * - CSR/SSR safe with proper hydration handling
 * - IDE-style appearance with traffic lights
 * - Copy to clipboard functionality
 * - Line numbers and responsive design
 * - 100% Lighthouse compliant when lazy-loaded
 *
 * @example
 * ```tsx
 * <div style={{ maxHeight: '24rem' }}>
 * <Code language="tsx">
 * {`const MyComponent = () => {
 * return <div>Hello World</div>;
 * };`}
 * </Code>
 * </div>
 * ```
 */
function Code({
  children,
  language = 'tsx',
  className,
  showLineNumbers = true,
  wrapLines = false,
  showCopyButton = true,
  onCopy,
  compact = false,
}: CodeProps) {
  const [isClient, setIsClient] = useState(false);
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shikiFailed, setShikiFailed] = useState(false);

  // Use the framework's theme system via utility
  const isDarkMode = useIsDark();

  const lines = children.trim().split('\n');

  // Initialize Shiki highlighter (lazy-loaded, optional peer dependency)
  useEffect(() => {
    if (!isClient) return;

    let mounted = true;

    const initHighlighter = async () => {
      try {
        // Dynamic import - gracefully fails if shiki not installed
        // Use shiki/core + explicit imports — only bundled langs/themes end up in dist
        // Use JavaScript RegExp engine (no WASM) for best performance and Lighthouse scores
        // All imports use shiki/* subpaths so the existing optional-dep
        // aliasing (matches shiki + shiki/...) catches them when shiki is missing.
        // Wildcard export ./* → ./dist/* requires the .mjs extension.
        const [
          { createHighlighterCore },
          { createJavaScriptRegexEngine },
          darkThemeModule,
          lightThemeModule,
          ...langModules
        ] = await Promise.all([
          import('shiki/core'),
          import('shiki/engine/javascript'),
          import('shiki/themes/github-dark.mjs'),
          import('shiki/themes/github-light.mjs'),
          import('shiki/langs/typescript.mjs'),
          import('shiki/langs/tsx.mjs'),
          import('shiki/langs/javascript.mjs'),
          import('shiki/langs/jsx.mjs'),
          import('shiki/langs/json.mjs'),
          import('shiki/langs/css.mjs'),
          import('shiki/langs/html.mjs'),
          import('shiki/langs/bash.mjs'),
          import('shiki/langs/sql.mjs'),
          import('shiki/langs/yaml.mjs'),
          import('shiki/langs/markdown.mjs'),
        ]);

        const themes = [darkThemeModule.default, lightThemeModule.default];
        const langs = langModules.map((m) => m.default);

        const shiki = await createHighlighterCore({
          themes,
          langs,
          engine: createJavaScriptRegexEngine(),
        });

        if (mounted) {
          setHighlighter(shiki);
          setIsLoading(false);
        }
      } catch (error) {
        // Shiki not installed or failed to load - use Text code variant fallback
        if (
          error instanceof Error &&
          (error.message.includes("Cannot find module 'shiki'") ||
            error.message.includes(
              'Failed to fetch dynamically imported module'
            ))
        ) {
          if (process.env.NODE_ENV === 'development') {
            console.info(
              '[Code] Shiki not available. Using Text code variant fallback. To enable syntax highlighting: npm install shiki'
            );
          }
        } else if (process.env.NODE_ENV === 'development') {
          console.warn('[Code] Failed to initialize Shiki:', error);
        }
        if (mounted) {
          setShikiFailed(true);
          setIsLoading(false);
        }
      }
    };

    initHighlighter();

    return () => {
      mounted = false;
    };
  }, [isClient]);

  // Memoize highlighted code using Shiki
  // Returns null when fallback should be used (rendered separately)
  const highlightedCode = useMemo(() => {
    if (!isClient || !children || shikiFailed || !highlighter || isLoading) {
      return null; // Use Text code variant fallback
    }

    try {
      const theme = isDarkMode ? 'github-dark' : 'github-light';
      const lang = language || 'text';

      // Check if language is supported
      if (!highlighter.getLoadedLanguages().includes(lang)) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[Code] Language '${language}' not supported by Shiki`);
        }
        return null; // Use Text code variant fallback
      }

      const html = highlighter.codeToHtml(children, {
        lang,
        theme,
      });

      // Strip Shiki's outer <pre><code>...</code></pre> wrapper.
      // We already render our own <pre> and <code> — nesting them
      // creates conflicting line-height/font-size and breaks sync
      // between line numbers and content.
      // Also strip \n between </span> and <span — the .line spans
      // are display:block, so newlines would create double line breaks
      // under white-space:pre.
      //
      // Safety: This HTML is trusted — produced by Shiki's codeToHtml()
      // from the `children` string prop. Shiki only emits <span> tags
      // with class/style attributes. No user-provided HTML reaches here.
      const inner = html
        .replace(/^<pre[^>]*><code[^>]*>/, '')
        .replace(/<\/code><\/pre>$/, '')
        .replace(/\n/g, '');

      return inner;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[Code] Failed to highlight code for language: ${language}`,
          error
        );
      }
      return null; // Use Text code variant fallback
    }
  }, [
    children,
    language,
    isClient,
    highlighter,
    isLoading,
    isDarkMode,
    shikiFailed,
  ]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Stack
      gap="none"
      className="dndev-code dndev-surface"
      data-glow="blank"
      data-compact={compact}
    >
      {/* Header */}
      {!compact && (
        <div className="dndev-code-header">
          <Stack direction="row" align="center" justify="between">
            <Stack direction="row" align="center" gap="tight">
              <div className="dndev-code-traffic-lights">
                <div className="dndev-code-traffic-light" data-color="red" />
                <div className="dndev-code-traffic-light" data-color="yellow" />
                <div className="dndev-code-traffic-light" data-color="green" />
              </div>
              <Text as="span" className="dndev-code-language">
                {language}
              </Text>
              <Text as="span" className="dndev-code-line-count">
                {lines.length} line{lines.length !== 1 ? 's' : ''}
              </Text>
            </Stack>
            {showCopyButton && isClient && (
              <CopyToClipboard text={children} onCopy={onCopy} />
            )}
          </Stack>
        </div>
      )}

      {/* Code Content - Scrollable */}
      <ScrollArea
        className="dndev-code-content"
        showHorizontal={!wrapLines}
        showVertical={true}
      >
        <pre
          className="dndev-code-pre"
          data-wrap={wrapLines}
          data-compact={compact}
        >
          {showLineNumbers ? (
            <Stack direction="row" gap="none">
              {/* Line numbers */}
              <div className="dndev-code-line-numbers">
                {lines.map((_, index) => (
                  <div key={index} className="dndev-code-line-number">
                    {String(index + 1).padStart(2, ' ')}
                  </div>
                ))}
              </div>
              {/* Code content */}
              {highlightedCode ? (
                <code
                  className="dndev-code-code"
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              ) : (
                <code className="dndev-code-code">
                  {lines.map((line, index) => (
                    <Text
                      key={index}
                      as="code"
                      variant="code"
                      style={{
                        display: 'block',
                        background: 'transparent',
                        padding: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {line || '\u00A0'}
                    </Text>
                  ))}
                </code>
              )}
            </Stack>
          ) : highlightedCode ? (
            <code
              className="dndev-code-code"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          ) : (
            <code className="dndev-code-code">
              {lines.map((line, index) => (
                <Text
                  key={index}
                  as="code"
                  variant="code"
                  style={{
                    display: 'block',
                    background: 'transparent',
                    padding: 0,
                  }}
                >
                  {line || '\u00A0'}
                </Text>
              ))}
            </code>
          )}
        </pre>
      </ScrollArea>
    </Stack>
  );
}

export default Code;
