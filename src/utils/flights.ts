// packages/components/src/utils/flights.ts

/**
 * @fileoverview Running fly-to flights
 * @description Internal registry of the {@link flyTo} flights in the air, per landing
 * element, so a component inside the target (Button's count bubble) can hold its update
 * until the image lands. Not exported from the package.
 *
 * @version 0.1.0
 * @since 0.3.5
 * @author AMBROISE PARK Consulting
 */

/** How a flight ended: on its target (`finish`) or cut short (`cancel`). */
export type FlightOutcome = 'landed' | 'cancelled';

const flights = new Map<Element, Set<Animation>>();

/**
 * Records `animation` as a flight landing on `target` until it finishes or is cancelled.
 * Called by {@link flyTo} for every flight it starts.
 */
export function trackFlight(target: Element, animation: Animation): void {
  let running = flights.get(target);
  if (!running) flights.set(target, (running = new Set()));
  running.add(animation);
  const set = running;
  const done = () => {
    set.delete(animation);
    if (set.size === 0 && flights.get(target) === set) flights.delete(target);
  };
  animation.addEventListener('finish', done);
  animation.addEventListener('cancel', done);
}

/**
 * The landing of the latest running flight whose target is `node` or contains it: a
 * promise resolving `'landed'` when that flight finishes, `'cancelled'` when it is
 * cancelled (never rejects). `null` when no flight is heading to `node`.
 *
 * @example
 * ```ts
 * const flight = landing(anchor);
 * if (flight) flight.then((outcome) => show(outcome === 'landed'));
 * ```
 */
export function landing(node: Element): Promise<FlightOutcome> | null {
  let latest: Animation | undefined;
  for (const [target, running] of flights) {
    if (target === node || target.contains(node)) for (const animation of running) latest = animation;
  }
  if (!latest) return null;
  const flight = latest;
  return new Promise((resolve) => {
    flight.addEventListener('finish', () => resolve('landed'));
    flight.addEventListener('cancel', () => resolve('cancelled'));
  });
}
