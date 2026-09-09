// packages/components/src/atomic/TreeView/index.tsx

/**
 * @fileoverview TreeView component
 * @description Accessible hierarchical tree component following the WAI-ARIA TreeView pattern.
 * Supports single/multi selection, keyboard navigation (arrow keys, type-ahead, Home/End),
 * roving tabindex, expand/collapse animation, connector lines, and custom icons.
 * SSR-safe — all DOM access is in event handlers only.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { ChevronRight } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { forwardRef, memo, useCallback, useRef, useState } from 'react';
import type {
  ComponentType,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
} from 'react';

import { cn } from '../../utils/helpers';
import Icon from '../Icons/Icon';

import './TreeView.css';

/** Recursive tree node data structure */
export interface TreeNode {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string | ReactNode;
  /** Icon for this node — Lucide component, string name, or ReactNode */
  icon?: ComponentType<LucideProps> | string | ReactNode;
  /** Child nodes. undefined = leaf. Empty array = empty branch. */
  children?: TreeNode[];
  /** Whether this node is disabled */
  disabled?: boolean;
  /** Arbitrary metadata passed through to callbacks */
  data?: unknown;
}

/** Props for the TreeView component -- hierarchical tree with keyboard navigation. */
export interface TreeViewProps extends Omit<
  HTMLAttributes<HTMLUListElement>,
  'role' | 'onSelect'
> {
  /** Tree data — array of root-level nodes */
  nodes: TreeNode[];

  /**
   * Selection mode.
   * - 'single': one node at a time
   * - 'multi': multiple nodes via Enter/Space
   * - 'none': no selection, Enter/Space toggles expansion on branches
   * @default 'single'
   */
  selectionMode?: 'single' | 'multi' | 'none';

  /** Controlled selected node IDs */
  selected?: Set<string> | string[];
  /** Default selected node IDs (uncontrolled) */
  defaultSelected?: string[];
  /** Callback when selection changes */
  onSelect?: (selected: Set<string>, node: TreeNode) => void;

  /** Controlled expanded node IDs */
  expanded?: Set<string> | string[];
  /** Default expanded node IDs (uncontrolled) */
  defaultExpanded?: string[];
  /** Callback when expansion changes. Use for lazy loading children. */
  onExpand?: (expanded: Set<string>, node: TreeNode) => void;

  /**
   * Show connector lines between parent and children.
   * @default false
   */
  showLines?: boolean;

  /**
   * Default icon for branch nodes (nodes with children array).
   * Individual node icons take precedence.
   */
  branchIcon?: ComponentType<LucideProps> | string | ReactNode;

  /**
   * Default icon for leaf nodes (nodes without children).
   * Individual node icons take precedence.
   */
  leafIcon?: ComponentType<LucideProps> | string | ReactNode;

  /** Accessible label for the tree */
  'aria-label': string;
  /** Additional CSS classes */
  className?: string;
}

/** Flatten visible nodes for keyboard navigation */
function getVisibleNodes(
  nodes: TreeNode[],
  expandedSet: Set<string>
): TreeNode[] {
  const result: TreeNode[] = [];
  function walk(items: TreeNode[]) {
    for (const node of items) {
      result.push(node);
      if (node.children && expandedSet.has(node.id)) {
        walk(node.children);
      }
    }
  }
  walk(nodes);
  return result;
}

/** Type-ahead search timeout */
const TYPE_AHEAD_TIMEOUT = 500;

// --- TreeViewNode (recursive, memoized) ---

interface TreeViewNodeProps {
  node: TreeNode;
  level: number;
  posInSet: number;
  setSize: number;
  expandedSet: Set<string>;
  selectedSet: Set<string>;
  focusedId: string | null;
  selectionMode: 'single' | 'multi' | 'none';
  branchIcon?: ComponentType<LucideProps> | string | ReactNode;
  leafIcon?: ComponentType<LucideProps> | string | ReactNode;
  onToggleExpand: (node: TreeNode) => void;
  onToggleSelect: (node: TreeNode) => void;
  onFocus: (id: string) => void;
}

const TreeViewNode = memo(function TreeViewNode({
  node,
  level,
  posInSet,
  setSize,
  expandedSet,
  selectedSet,
  focusedId,
  selectionMode,
  branchIcon,
  leafIcon,
  onToggleExpand,
  onToggleSelect,
  onFocus,
}: TreeViewNodeProps) {
  const isBranch = node.children !== undefined;
  const isExpanded = isBranch && expandedSet.has(node.id);
  const isSelected = selectedSet.has(node.id);
  const isFocused = focusedId === node.id;

  const nodeIcon = node.icon ?? (isBranch ? branchIcon : leafIcon);

  const handleClick = () => {
    if (node.disabled) return;
    onFocus(node.id);
    if (isBranch) {
      onToggleExpand(node);
    }
    if (selectionMode !== 'none') {
      onToggleSelect(node);
    }
  };

  return (
    <li
      role="treeitem"
      aria-expanded={isBranch ? isExpanded : undefined}
      aria-selected={selectionMode !== 'none' ? isSelected : undefined}
      aria-level={level}
      aria-setsize={setSize}
      aria-posinset={posInSet}
      aria-disabled={node.disabled || undefined}
      tabIndex={isFocused ? 0 : -1}
      data-id={node.id}
      onFocus={() => onFocus(node.id)}
    >
      <span className="dndev-tree-node-content" onClick={handleClick}>
        {/* Expand chevron or leaf spacer */}
        <span
          className="dndev-tree-node-expand"
          data-leaf={!isBranch || undefined}
          aria-hidden="true"
        >
          {isBranch && <ChevronRight />}
        </span>

        {/* Node icon */}
        {nodeIcon && (
          <span className="dndev-tree-node-icon" aria-hidden="true">
            <Icon icon={nodeIcon} />
          </span>
        )}

        {/* Label */}
        <span className="dndev-tree-node-label">{node.label}</span>
      </span>

      {/* Children group */}
      {isBranch && node.children!.length > 0 && (
        <ul role="group" data-state={isExpanded ? 'open' : 'closed'}>
          {node.children!.map((child, i) => (
            <TreeViewNode
              key={child.id}
              node={child}
              level={level + 1}
              posInSet={i + 1}
              setSize={node.children!.length}
              expandedSet={expandedSet}
              selectedSet={selectedSet}
              focusedId={focusedId}
              selectionMode={selectionMode}
              branchIcon={branchIcon}
              leafIcon={leafIcon}
              onToggleExpand={onToggleExpand}
              onToggleSelect={onToggleSelect}
              onFocus={onFocus}
            />
          ))}
        </ul>
      )}
    </li>
  );
});

// --- TreeView (root) ---

/**
 * Accessible hierarchical tree component following the WAI-ARIA TreeView pattern.
 *
 * @component
 * @example
 * ```tsx
 * const nodes: TreeNode[] = [
 *   {
 *     id: 'src',
 *     label: 'src',
 *     icon: Folder,
 *     children: [
 *       { id: 'app', label: 'App.tsx', icon: FileCode },
 *       { id: 'index', label: 'index.ts', icon: FileCode },
 *       {
 *         id: 'components',
 *         label: 'components',
 *         icon: Folder,
 *         children: [
 *           { id: 'header', label: 'Header.tsx', icon: FileCode },
 *           { id: 'footer', label: 'Footer.tsx', icon: FileCode },
 *         ],
 *       },
 *     ],
 *   },
 *   { id: 'readme', label: 'README.md', icon: FileText },
 * ];
 *
 * <TreeView
 *   nodes={nodes}
 *   aria-label="Project files"
 *   defaultExpanded={['src']}
 *   showLines
 *   onSelect={(selected, node) => console.log('Selected:', node.id)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Multi-select, no icons
 * <TreeView
 *   nodes={categories}
 *   aria-label="Categories"
 *   selectionMode="multi"
 *   selected={selectedIds}
 *   onSelect={setSelectedIds}
 * />
 * ```
 *
 * @param {TreeViewProps} props - The props for the tree view
 * @returns {JSX.Element} The rendered tree view
 */
const TreeView = forwardRef<HTMLUListElement, TreeViewProps>(function TreeView(
  {
    nodes,
    selectionMode = 'single',
    selected,
    defaultSelected,
    onSelect,
    expanded,
    defaultExpanded,
    onExpand,
    showLines = false,
    branchIcon,
    leafIcon,
    'aria-label': ariaLabel,
    className,
    ...props
  },
  ref
) {
  // --- Expanded state ---
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(
    () => new Set(defaultExpanded ?? [])
  );
  const isExpandedControlled = expanded !== undefined;
  const expandedSet: Set<string> = isExpandedControlled
    ? expanded instanceof Set
      ? expanded
      : new Set(expanded)
    : internalExpanded;

  // --- Selected state ---
  const [internalSelected, setInternalSelected] = useState<Set<string>>(
    () => new Set(defaultSelected ?? [])
  );
  const isSelectedControlled = selected !== undefined;
  const selectedSet: Set<string> = isSelectedControlled
    ? selected instanceof Set
      ? selected
      : new Set(selected)
    : internalSelected;

  // --- Focus state (ref-based, no re-render) ---
  const [focusedId, setFocusedId] = useState<string | null>(
    nodes[0]?.id ?? null
  );

  // --- Type-ahead ---
  const typeAheadRef = useRef('');
  const typeAheadTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // --- Node map for O(1) lookups ---
  const nodeMapRef = useRef<Map<string, TreeNode>>(new Map());
  const parentMapRef = useRef<Map<string, string | null>>(new Map());

  // Rebuild maps when nodes change
  const buildMaps = useCallback(
    (items: TreeNode[], parentId: string | null = null) => {
      for (const node of items) {
        nodeMapRef.current.set(node.id, node);
        parentMapRef.current.set(node.id, parentId);
        if (node.children) buildMaps(node.children, node.id);
      }
    },
    []
  );

  // Rebuild on every render (cheap for <1000 nodes)
  nodeMapRef.current.clear();
  parentMapRef.current.clear();
  buildMaps(nodes);

  // --- Actions ---
  const toggleExpand = useCallback(
    (node: TreeNode) => {
      const next = new Set(expandedSet);
      if (next.has(node.id)) {
        next.delete(node.id);
      } else {
        next.add(node.id);
      }
      if (!isExpandedControlled) setInternalExpanded(next);
      onExpand?.(next, node);
    },
    [expandedSet, isExpandedControlled, onExpand]
  );

  const toggleSelect = useCallback(
    (node: TreeNode) => {
      if (node.disabled) return;
      let next: Set<string>;
      if (selectionMode === 'single') {
        next = new Set(selectedSet.has(node.id) ? [] : [node.id]);
      } else {
        next = new Set(selectedSet);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
      }
      if (!isSelectedControlled) setInternalSelected(next);
      onSelect?.(next, node);
    },
    [selectionMode, selectedSet, isSelectedControlled, onSelect]
  );

  // --- Keyboard handler (WAI-ARIA TreeView pattern) ---
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLUListElement>) => {
      const visible = getVisibleNodes(nodes, expandedSet);
      const currentIndex = visible.findIndex((n) => n.id === focusedId);

      const focusNode = (id: string) => {
        setFocusedId(id);
        // Focus the DOM element
        const el = e.currentTarget.querySelector<HTMLElement>(
          `[data-id="${CSS.escape(id)}"]`
        );
        el?.focus();
      };

      const current = visible[currentIndex] ?? visible[0];
      if (!current) return;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const next = visible[currentIndex + 1];
          if (next) focusNode(next.id);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prev = visible[currentIndex - 1];
          if (prev) focusNode(prev.id);
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          if (current.children !== undefined) {
            if (!expandedSet.has(current.id)) {
              // Expand
              toggleExpand(current);
            } else if (current.children.length > 0 && current.children[0]) {
              // Move to first child
              focusNode(current.children[0].id);
            }
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          if (current.children !== undefined && expandedSet.has(current.id)) {
            // Collapse
            toggleExpand(current);
          } else {
            // Move to parent
            const parentId = parentMapRef.current.get(current.id);
            if (parentId) focusNode(parentId);
          }
          break;
        }
        case 'Home': {
          e.preventDefault();
          const first = visible[0];
          if (first) focusNode(first.id);
          break;
        }
        case 'End': {
          e.preventDefault();
          const last = visible[visible.length - 1];
          if (last) focusNode(last.id);
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          if (current.disabled) break;
          if (selectionMode === 'none' && current.children !== undefined) {
            toggleExpand(current);
          } else if (selectionMode !== 'none') {
            toggleSelect(current);
          }
          break;
        }
        case '*': {
          // Expand all siblings at current level
          e.preventDefault();
          const parentId = parentMapRef.current.get(current.id);
          const siblings = parentId
            ? (nodeMapRef.current.get(parentId)?.children ?? [])
            : nodes;
          const next = new Set(expandedSet);
          let changed = false;
          for (const sib of siblings) {
            if (sib.children !== undefined && !next.has(sib.id)) {
              next.add(sib.id);
              changed = true;
            }
          }
          if (changed) {
            if (!isExpandedControlled) setInternalExpanded(next);
            onExpand?.(next, current);
          }
          break;
        }
        default: {
          // Type-ahead: single printable character
          if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            clearTimeout(typeAheadTimerRef.current);
            typeAheadRef.current += e.key.toLowerCase();
            typeAheadTimerRef.current = setTimeout(() => {
              typeAheadRef.current = '';
            }, TYPE_AHEAD_TIMEOUT);

            const search = typeAheadRef.current;
            const match = visible.find((n) => {
              const label = typeof n.label === 'string' ? n.label : '';
              return label.toLowerCase().startsWith(search);
            });
            if (match) focusNode(match.id);
          }
          break;
        }
      }
    },
    [
      nodes,
      expandedSet,
      focusedId,
      selectionMode,
      toggleExpand,
      toggleSelect,
      isExpandedControlled,
      onExpand,
    ]
  );

  return (
    <ul
      ref={ref}
      role="tree"
      aria-label={ariaLabel}
      aria-multiselectable={selectionMode === 'multi' ? true : undefined}
      data-show-lines={showLines || undefined}
      className={cn('dndev-tree', className)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {nodes.map((node, i) => (
        <TreeViewNode
          key={node.id}
          node={node}
          level={1}
          posInSet={i + 1}
          setSize={nodes.length}
          expandedSet={expandedSet}
          selectedSet={selectedSet}
          focusedId={focusedId}
          selectionMode={selectionMode}
          branchIcon={branchIcon}
          leafIcon={leafIcon}
          onToggleExpand={toggleExpand}
          onToggleSelect={toggleSelect}
          onFocus={setFocusedId}
        />
      ))}
    </ul>
  );
});

TreeView.displayName = 'TreeView';

export default TreeView;
