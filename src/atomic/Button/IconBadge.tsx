'use client';
// packages/components/src/atomic/Button/IconBadge.tsx

/**
 * @fileoverview Button icon with its count bubble
 * @description Client island of Button's `badge`: the bubble pops when its numeric value
 * increases after mount; while a {@link flyTo} flight heads to the button, the increase
 * waits for the landing.
 *
 * @version 0.2.0
 * @since 0.3.5
 * @author AMBROISE PARK Consulting
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentProps } from 'react';

import Icon from '../Icons/Icon';
import { landing } from '../../utils/flights';

/** Pop of the count bubble: up and back, on the compositor (transform only). */
const BUMP_KEYFRAMES: Keyframe[] = [
  { transform: 'scale(1)' },
  { transform: 'scale(1.35)', offset: 0.4 },
  { transform: 'scale(1)' },
];
const BUMP_TIMING: KeyframeAnimationOptions = { duration: 320, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' };

/** Numeric value of a badge, NaN for text ("99+") or empty. */
const toCount = (badge: number | string) => (typeof badge === 'number' ? badge : badge.trim() === '' ? NaN : Number(badge));

/** Displayed badge, and whether showing it pops the bubble. */
interface Shown {
  value: number | string;
  pop: boolean;
}

/**
 * Icon of a Button with `badge`, and the count bubble on its corner unless the shown value
 * is `0` or empty. A numeric increase pops the bubble (0 → 1 too); the first render (server
 * or hydration), a decrease or a text value never does.
 *
 * Increase while a {@link flyTo} flight heads to the button (its target contains this
 * icon): the previous value stays shown (no bubble if it was 0) until the flight ends;
 * landed → the latest badge value, with the pop; cancelled → the latest value, no pop.
 * Several flights: each landing shows the latest value and pops. Without a flight the value
 * shows (and pops) at once. The anchor is always rendered, so a flight can be found at 0.
 */
export default function IconBadge({ icon, badge }: { icon: ComponentProps<typeof Icon>['icon']; badge: number | string }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const bubble = useRef<HTMLSpanElement>(null);
  const latest = useRef(badge);
  const mounted = useRef(false);
  const [shown, setShown] = useState<Shown>({ value: badge, pop: false });

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Layout effect: the new value (or the held previous one) is decided before paint.
  useLayoutEffect(() => {
    if (badge === latest.current) return;
    const increase = toCount(badge) > toCount(latest.current);
    latest.current = badge;
    const flight = increase && anchor.current ? landing(anchor.current) : null;
    if (!flight) {
      setShown({ value: badge, pop: increase });
      return;
    }
    // Shows the latest badge, not this change's: a newer change supersedes it.
    void flight.then((outcome) => {
      if (mounted.current) setShown({ value: latest.current, pop: outcome === 'landed' });
    });
  }, [badge]);

  useLayoutEffect(() => {
    const node = bubble.current;
    if (!shown.pop || !node || typeof node.animate !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    node.animate(BUMP_KEYFRAMES, BUMP_TIMING);
  }, [shown]);

  return (
    <span ref={anchor} className="dndev-interactive-icon-anchor">
      <Icon icon={icon} />
      {shown.value !== 0 && shown.value !== '' && (
        <span ref={bubble} className="dndev-interactive-badge" aria-hidden="true">
          {shown.value}
        </span>
      )}
    </span>
  );
}
