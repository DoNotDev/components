// packages/components/src/advanced/Crawl/utils/parseHtml.tsx

/**
 * @fileoverview HTML Parser Utility
 * @description Parse simple HTML tags into React components. Provides safe HTML parsing with configurable allowed tags and line break preservation.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import {
  createElement,
  type JSX,
  type ReactNode,
  type ReactElement,
} from 'react';

/**
 * Supported HTML tags for parsing
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export type SupportedHtmlTag = 'p' | 'br' | 'u' | 'i' | 'em' | 'strong' | 'b';

/**
 * Options for HTML parsing
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface ParseHtmlOptions {
  /** Allowed HTML tags to parse */
  allowedTags?: SupportedHtmlTag[];
  /** Whether to preserve line breaks as <br/> tags */
  preserveLineBreaks?: boolean;
  /** Custom class names for parsed elements */
  className?: string;
}

/**
 * Parse HTML string into React components
 *
 * @param html - HTML string to parse
 * @param options - Parsing options
 * @returns Array of React elements
 *
 * @example
 * ```tsx
 * const html = "Hello <u>world</u> and <i>italic</i> text";
 * const elements = parseHtml(html);
 * // Returns: [React.Fragment with "Hello ", <u>world</u>, " and ", <i>italic</i>, " text"]
 * ```
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function parseHtml(
  html: string,
  options: ParseHtmlOptions = {}
): ReactNode[] {
  const {
    allowedTags = ['p', 'br', 'u', 'i', 'em', 'strong', 'b'],
    preserveLineBreaks = true,
    className,
  } = options;

  if (!html || typeof html !== 'string') {
    return [];
  }

  // Handle line breaks first if enabled
  let processedHtml = html;
  if (preserveLineBreaks) {
    processedHtml = processedHtml.replace(/\n/g, '<br/>');
  }

  // Split by opening tags
  const parts = processedHtml.split(/(<[^>]+>)/);
  const result: ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (!part) continue;

    // Check if it's a self-closing tag (like <br/> or <br />)
    const selfClosingMatch = part.match(/^<(\w+)(?:\s[^>]*)?\s*\/>$/);
    if (selfClosingMatch && selfClosingMatch[1]) {
      const tagName = selfClosingMatch[1].toLowerCase();

      if (isAllowedTag(tagName, allowedTags)) {
        // Create the React element for self-closing tags
        const element = createHtmlElement(tagName, '', className, key++);
        if (element) {
          result.push(element);
        }
        continue;
      }
    }

    // Check if it's an opening tag
    const openingTagMatch = part.match(/^<(\w+)(?:\s[^>]*)?>$/);
    if (openingTagMatch && openingTagMatch[1]) {
      const tagName = openingTagMatch[1].toLowerCase();

      if (isAllowedTag(tagName, allowedTags)) {
        // Find the corresponding closing tag using depth tracking
        // to handle nested identical tags (e.g., <b>outer <b>inner</b> outer</b>)
        const openingTag = `<${tagName}>`;
        const closingTag = `</${tagName}>`;
        let content = '';
        let j = i + 1;
        let depth = 1;

        while (j < parts.length && parts[j]) {
          if (parts[j] === openingTag) {
            depth++;
          } else if (parts[j] === closingTag) {
            depth--;
            if (depth === 0) {
              break;
            }
          }
          content += parts[j]!;
          j++;
        }

        // Skip past the closing tag part (don't append it to content)
        // Fall through if j >= parts.length (unclosed tag — render content as-is)

        // Create the React element
        const element = createHtmlElement(tagName, content, className, key++);
        if (element) {
          result.push(element);
        }

        // Skip processed parts
        i = j;
        continue;
      }
    }

    // Regular text content
    if (part && !part.startsWith('<')) {
      result.push(part);
    }
  }

  return result;
}

/**
 * Narrows a lowercased tag name to an allowed SupportedHtmlTag
 */
function isAllowedTag(
  tagName: string,
  allowedTags: readonly SupportedHtmlTag[]
): tagName is SupportedHtmlTag {
  const allowed: readonly string[] = allowedTags;
  return allowed.includes(tagName);
}

/**
 * Create a React element for the given HTML tag
 */
function createHtmlElement(
  tagName: SupportedHtmlTag,
  content: string,
  className?: string,
  key?: number
): ReactNode {
  const props: { key?: number; className?: string } = { key };
  if (className) {
    props.className = className;
  }

  switch (tagName) {
    case 'p':
      return createElement('p', props, content);
    case 'br':
      return createElement('br', props);
    case 'u':
      return createElement('u', props, content);
    case 'i':
    case 'em':
      return createElement('em', props, content);
    case 'strong':
    case 'b':
      return createElement('strong', props, content);
    default:
      return content;
  }
}

/**
 * Parse HTML and wrap in a single React element
 *
 * @param html - HTML string to parse
 * @param wrapper - Wrapper element type (default: 'div')
 * @param options - Parsing options
 * @returns React element containing parsed HTML
 *
 * @example
 * ```tsx
 * const html = "Hello <u>world</u>";
 * const element = parseHtmlElement(html, 'p');
 * // Returns: <p>Hello <u>world</u></p>
 * ```
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function parseHtmlElement(
  html: string,
  wrapper: keyof JSX.IntrinsicElements = 'div',
  options: ParseHtmlOptions = {}
): ReactElement {
  const parsed = parseHtml(html, options);
  const { className } = options;

  return createElement(wrapper, className ? { className } : {}, ...parsed);
}
