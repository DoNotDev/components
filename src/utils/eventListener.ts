// packages/components/src/utils/eventListener.ts

/**
 * @fileoverview Event Listener Utilities
 * @description Utility functions for managing event listeners in components. Provides helper functions for adding and removing event listeners with proper cleanup.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

/**
 * Add event listener with proper cleanup
 * @param target - Event target to attach listener to
 * @param eventType - Type of event to listen for
 * @param handler - Event handler function
 * @param options - Event listener options
 * @returns Cleanup function
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function addEventListener<T extends Event = Event>(
  target: EventTarget | null,
  eventType: string,
  handler: (event: T) => void,
  options?: AddEventListenerOptions
): () => void {
  if (!target) return () => {};

  const wrappedHandler = handler as EventListenerOrEventListenerObject;
  target.addEventListener(eventType, wrappedHandler, options);

  return () => {
    target.removeEventListener(eventType, wrappedHandler, options);
  };
}

/**
 * Add multiple event listeners with proper cleanup
 * @param target - Event target to attach listeners to
 * @param events - Array of event types and handlers
 * @param options - Event listener options
 * @returns Cleanup function
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function addEventListeners<T extends Event = Event>(
  target: EventTarget | null,
  events: Array<{
    type: string;
    handler: (event: T) => void;
    options?: AddEventListenerOptions;
  }>,
  defaultOptions?: AddEventListenerOptions
): () => void {
  if (!target) return () => {};

  const cleanupFunctions: (() => void)[] = [];

  events.forEach(({ type, handler, options }) => {
    const finalOptions = { ...defaultOptions, ...options };
    const wrappedHandler = handler as EventListenerOrEventListenerObject;
    target.addEventListener(type, wrappedHandler, finalOptions);
    cleanupFunctions.push(() => {
      target.removeEventListener(type, wrappedHandler, finalOptions);
    });
  });

  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
}
