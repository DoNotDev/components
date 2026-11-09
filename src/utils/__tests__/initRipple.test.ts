import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { destroyRipple, initRipple } from '../initRipple';

function pressInteractive(
  rippleOpacity: string,
  borderWidth = 0,
  direction = 'ltr'
): HTMLElement {
  const target = document.createElement('button');
  target.className = 'dndev-interactive';
  target.style.setProperty('--ripple-opacity', rippleOpacity);
  target.style.direction = direction;
  Object.defineProperty(target, 'clientLeft', { value: borderWidth });
  Object.defineProperty(target, 'clientTop', { value: borderWidth });
  Object.defineProperty(target, 'clientWidth', { value: 100 });
  document.body.appendChild(target);
  target.dispatchEvent(
    new MouseEvent('pointerdown', { bubbles: true, clientX: 5, clientY: 5 })
  );
  return target;
}

describe('initRipple', () => {
  beforeEach(() => {
    initRipple();
  });

  afterEach(() => {
    destroyRipple();
    document.body.innerHTML = '';
  });

  it('renders the ripple inside a clip layer, independent of host overflow', () => {
    const target = pressInteractive('0.2');

    const clip = target.querySelector(':scope > .dndev-ripple-clip');
    expect(clip).not.toBeNull();
    expect(clip?.querySelector(':scope > .dndev-ripple')).not.toBeNull();
    expect(target.querySelector(':scope > .dndev-ripple')).toBeNull();
  });

  it('removes the clip layer when the animation ends', () => {
    const target = pressInteractive('0.2');

    target
      .querySelector('.dndev-ripple')
      ?.dispatchEvent(new Event('animationend'));

    expect(target.querySelector('.dndev-ripple-clip')).toBeNull();
  });

  it('renders nothing when --ripple-opacity is 0', () => {
    const target = pressInteractive('0');

    expect(target.children).toHaveLength(0);
  });

  it('renders nothing when --ripple-opacity is unset', () => {
    const target = pressInteractive('');

    expect(target.children).toHaveLength(0);
  });

  it('positions the ripple from the inline start of the padding box', () => {
    const target = pressInteractive('0.2', 1);

    const ripple = target.querySelector<HTMLElement>('.dndev-ripple');
    expect(ripple?.style.getPropertyValue('inset-inline-start')).toBe('4px');
    expect(ripple?.style.getPropertyValue('inset-block-start')).toBe('4px');
  });

  it('measures the inline offset from the right edge in RTL', () => {
    const target = pressInteractive('0.2', 1, 'rtl');

    const ripple = target.querySelector<HTMLElement>('.dndev-ripple');
    expect(ripple?.style.getPropertyValue('inset-inline-start')).toBe('96px');
  });
});
