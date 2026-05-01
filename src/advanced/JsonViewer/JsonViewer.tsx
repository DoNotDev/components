'use client';
// packages/components/src/advanced/JsonViewer/JsonViewer.tsx

/**
 * @fileoverview JSON Viewer Component
 * @description Interactive JSON viewer with collapsible nodes, syntax highlighting, and copy functionality
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { Copy, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import Button, { BUTTON_VARIANT } from '../../atomic/Button';
import { cn } from '../../utils/helpers';

/** Props for the JsonViewer component -- collapsible JSON tree viewer. */
export interface JsonViewerProps {
  /** JSON data to display */
  data: unknown;

  /** Maximum depth to expand by default */
  defaultDepth?: number;

  /** Show copy button */
  showCopyButton?: boolean;

  /** Custom className */
  className?: string;

  /** Collapse all by default */
  collapsed?: boolean;
}

interface JsonNodeProps {
  data: unknown;
  keyName?: string;
  depth: number;
  defaultDepth: number;
  path: string;
  collapsed: boolean;
  onToggle: (path: string) => void;
  expandedPaths: Record<string, true>;
}

const JsonNode = ({
  data,
  keyName,
  depth,
  defaultDepth,
  path,
  collapsed,
  onToggle,
  expandedPaths,
}: JsonNodeProps) => {
  const isExpanded =
    expandedPaths[path] === true || (depth < defaultDepth && !collapsed);
  const isObject =
    typeof data === 'object' && data !== null && !Array.isArray(data);
  const isArray = Array.isArray(data);
  const isExpandable = isObject || isArray;
  const isEmpty = isObject
    ? Object.keys(data as Record<string, unknown>).length === 0
    : isArray
      ? (data as unknown[]).length === 0
      : false;

  const handleToggle = () => {
    if (isExpandable && !isEmpty) {
      onToggle(path);
    }
  };

  const getValueColor = (value: unknown): string => {
    if (value === null) return 'dndev-json-value-null';
    if (typeof value === 'string') return 'dndev-json-value-string';
    if (typeof value === 'number') return 'dndev-json-value-number';
    if (typeof value === 'boolean') return 'dndev-json-value-boolean';
    return 'dndev-json-value';
  };

  const formatValue = (value: unknown): string => {
    if (value === null) return 'null';
    if (typeof value === 'string') return JSON.stringify(value);
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);
    return '';
  };

  if (!isExpandable) {
    return (
      <div className="dndev-json-node">
        {keyName && <span className="dndev-json-key">{keyName}:</span>}
        <span className={cn('dndev-json-value', getValueColor(data))}>
          {formatValue(data)}
        </span>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="dndev-json-node">
        {keyName && <span className="dndev-json-key">{keyName}:</span>}
        <span className="dndev-json-value dndev-json-value-null">
          {isArray ? '[]' : '{}'}
        </span>
      </div>
    );
  }

  const items = isArray
    ? data
    : Object.entries(data as Record<string, unknown>);
  const bracketOpen = isArray ? '[' : '{';
  const bracketClose = isArray ? ']' : '}';

  return (
    <div>
      <div className="dndev-json-toggle" onClick={handleToggle}>
        {keyName && <span className="dndev-json-key">{keyName}:</span>}
        <span className="dndev-json-bracket">{bracketOpen}</span>
        {isExpanded ? (
          <ChevronDown className="dndev-json-icon" />
        ) : (
          <ChevronRight className="dndev-json-icon" />
        )}
        {!isExpanded && (
          <span className="dndev-json-count">
            {isArray
              ? `${(data as unknown[]).length} item${(data as unknown[]).length !== 1 ? 's' : ''}`
              : `${Object.keys(data as Record<string, unknown>).length} key${Object.keys(data as Record<string, unknown>).length !== 1 ? 's' : ''}`}
          </span>
        )}
        {!isExpanded && (
          <span className="dndev-json-bracket">{bracketClose}</span>
        )}
      </div>

      {isExpanded && (
        <div className="dndev-json-children">
          {items.map((item: unknown, index: number) => {
            const [itemKey, itemValue] = isArray
              ? [index, item]
              : (item as [string, unknown]);
            const itemPath = `${path}.${itemKey}`;

            return (
              <JsonNode
                key={itemPath}
                data={itemValue}
                keyName={isArray ? undefined : String(itemKey)}
                depth={depth + 1}
                defaultDepth={defaultDepth}
                path={itemPath}
                collapsed={collapsed}
                onToggle={onToggle}
                expandedPaths={expandedPaths}
              />
            );
          })}
          <span className="dndev-json-bracket">{bracketClose}</span>
        </div>
      )}
    </div>
  );
};

/**
 * JSON Viewer - Interactive JSON display component
 *
 * Features:
 * - Collapsible objects and arrays
 * - Syntax highlighting (strings, numbers, booleans, null)
 * - Copy to clipboard
 * - Expand/collapse all
 * - Configurable default depth
 *
 * @component
 * @param props - JSON viewer props
 * @param props.data - JSON data to display
 * @param props.defaultDepth - Maximum depth to expand by default (default: 2)
 * @param props.showCopyButton - Show copy button (default: true)
 * @param props.className - Additional CSS classes
 * @param props.collapsed - Collapse all by default (default: false)
 *
 * @example
 * ```tsx
 * <JsonViewer data={{ name: 'John', age: 30 }} />
 *
 * <JsonViewer
 * data={complexObject}
 * defaultDepth={3}
 * showCopyButton={true}
 * />
 * ```
 */
const JsonViewer = ({
  data,
  defaultDepth = 2,
  showCopyButton = true,
  className,
  collapsed = false,
}: JsonViewerProps) => {
  // Use Record<string, true> instead of Set for stable equality semantics in React state
  const [expandedPaths, setExpandedPaths] = useState<Record<string, true>>({});
  const [allExpanded, setAllExpanded] = useState(!collapsed);

  const handleToggle = (path: string) => {
    setExpandedPaths((prev) => {
      const next = { ...prev };
      if (next[path]) {
        delete next[path];
      } else {
        next[path] = true;
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setAllExpanded(true);
    setExpandedPaths({});
  };

  const handleCollapseAll = () => {
    setAllExpanded(false);
    setExpandedPaths({});
  };

  const handleCopy = async () => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(jsonString);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to copy JSON:', error);
      }
    }
  };

  return (
    <div className={cn('dndev-json-viewer', className)}>
      {(showCopyButton || !allExpanded) && (
        <div className="dndev-json-viewer-actions">
          {!allExpanded ? (
            <Button
              onClick={handleExpandAll}
              variant={BUTTON_VARIANT.GHOST}
              style={{ fontSize: 'var(--font-size-sm)' }}
            >
              Expand All
            </Button>
          ) : (
            <Button
              onClick={handleCollapseAll}
              variant={BUTTON_VARIANT.GHOST}
              style={{ fontSize: 'var(--font-size-sm)' }}
            >
              Collapse All
            </Button>
          )}
          {showCopyButton && (
            <Button
              onClick={handleCopy}
              variant={BUTTON_VARIANT.GHOST}
              style={{ fontSize: 'var(--font-size-sm)' }}
              icon={Copy}
            >
              Copy
            </Button>
          )}
        </div>
      )}

      <div className="dndev-json-viewer-container">
        <JsonNode
          data={data}
          depth={0}
          defaultDepth={defaultDepth}
          path="root"
          collapsed={!allExpanded}
          onToggle={handleToggle}
          expandedPaths={expandedPaths}
        />
      </div>
    </div>
  );
};

JsonViewer.displayName = 'JsonViewer';

export default JsonViewer;
