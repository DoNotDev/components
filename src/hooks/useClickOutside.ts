// packages/components/src/hooks/useClickOutside.ts

/**
 * @fileoverview useClickOutside Hook - Click Outside Detection
 * @description Framework hook for detecting clicks outside of a specified element
 * @package @donotdev/components
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 *
 * Features:
 * - CSR/SSR safe with proper fallbacks
 * - Automatic cleanup prevents memory leaks
 * - TypeScript support with full type safety
 * - Zero dependencies beyond React
 * - Reusable for any click outside detection
 *
 * Performance:
 * - Efficient event handling with proper cleanup
 * - Minimal re-renders with optimized state updates
 * - Automatic cleanup prevents memory leaks
 */

import { useEffect, useRef } from 'react';

/**
 * useClickOutside - Click Outside Detection Hook
 *
 * Framework hook for detecting clicks outside of a specified element.
 * Perfect for closing modals, dropdowns, or any component that should
 * close when clicking outside of it.
 *
 * @param ref - React ref to the element to watch for outside clicks
 * @param handler - Function to call when clicking outside
 * @param enabled - Whether the hook is enabled (default: true)
 *
 * @example Basic usage
 * ```tsx
 * function Modal() {
 *   const modalRef = useRef<HTMLDivElement>(null);
 *   const [isOpen, setIsOpen] = useState(false);
 *
 *   useClickOutside(modalRef, () => setIsOpen(false));
 *
 *   return (
 *     <div ref={modalRef}>
 *       <p>Modal content</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Conditional usage
 * ```tsx
 * function Dropdown() {
 *   const dropdownRef = useRef<HTMLDivElement>(null);
 *   const [isOpen, setIsOpen] = useState(false);
 *
 *   useClickOutside(
 *     dropdownRef,
 *     () => setIsOpen(false),
 *     isOpen // Only listen when dropdown is open
 *   );
 *
 *   return (
 *     <div ref={dropdownRef}>
 *       <button onClick={() => setIsOpen(!isOpen)}>
 *         Toggle Dropdown
 *       </button>
 *       {isOpen && <div>Dropdown content</div>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Advanced usage with cleanup
 * ```tsx
 * function AdvancedComponent() {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   const [isVisible, setIsVisible] = useState(false);
 *
 *   const handleClickOutside = useCallback(() => {
 *     console.log('Clicked outside!');
 *     setIsVisible(false);
 *   }, []);
 *
 *   useClickOutside(containerRef, handleClickOutside, isVisible);
 *
 *   return (
 *     <div ref={containerRef}>
 *       <button onClick={() => setIsVisible(true)}>
 *         Show Content
 *       </button>
 *       {isVisible && <div>Content that closes on outside click</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): void {
  const handlerRef = useRef(handler);

  // Update handler ref when handler changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // CSR/SSR safe check
    if (typeof window === 'undefined') {
      return;
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!event.target) return;
      // Check if ref exists and if the click is outside
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handlerRef.current(event);
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref, enabled]);
}
