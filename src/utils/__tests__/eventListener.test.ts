import { describe, it, expect, vi } from 'vitest';

import { addEventListener, addEventListeners } from '../eventListener';

// --- addEventListener ---

describe('addEventListener', () => {
  it('returns noop cleanup for null target', () => {
    const handler = vi.fn();
    const cleanup = addEventListener(null, 'click', handler);
    expect(typeof cleanup).toBe('function');
    cleanup(); // should not throw
    expect(handler).not.toHaveBeenCalled();
  });

  it('attaches event listener to target', () => {
    const target = document.createElement('div');
    const handler = vi.fn();

    addEventListener(target, 'click', handler);
    target.dispatchEvent(new Event('click'));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('removes event listener on cleanup', () => {
    const target = document.createElement('div');
    const handler = vi.fn();

    const cleanup = addEventListener(target, 'click', handler);
    cleanup();
    target.dispatchEvent(new Event('click'));

    expect(handler).not.toHaveBeenCalled();
  });

  it('passes options to addEventListener', () => {
    const target = document.createElement('div');
    const addSpy = vi.spyOn(target, 'addEventListener');
    const handler = vi.fn();

    addEventListener(target, 'scroll', handler, {
      passive: true,
      capture: true,
    });

    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), {
      passive: true,
      capture: true,
    });
  });

  it('passes same options to removeEventListener on cleanup', () => {
    const target = document.createElement('div');
    const removeSpy = vi.spyOn(target, 'removeEventListener');
    const handler = vi.fn();
    const options = { passive: true, capture: true };

    const cleanup = addEventListener(target, 'scroll', handler, options);
    cleanup();

    expect(removeSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      options
    );
  });

  it('works with window as target', () => {
    const handler = vi.fn();

    const cleanup = addEventListener(window, 'resize', handler);
    window.dispatchEvent(new Event('resize'));

    expect(handler).toHaveBeenCalledTimes(1);
    cleanup();
  });
});

// --- addEventListeners ---

describe('addEventListeners', () => {
  it('returns noop cleanup for null target', () => {
    const cleanup = addEventListeners(null, [
      { type: 'click', handler: vi.fn() },
    ]);
    expect(typeof cleanup).toBe('function');
    cleanup(); // should not throw
  });

  it('attaches multiple event listeners', () => {
    const target = document.createElement('div');
    const clickHandler = vi.fn();
    const mouseoverHandler = vi.fn();

    addEventListeners(target, [
      { type: 'click', handler: clickHandler },
      { type: 'mouseover', handler: mouseoverHandler },
    ]);

    target.dispatchEvent(new Event('click'));
    target.dispatchEvent(new Event('mouseover'));

    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(mouseoverHandler).toHaveBeenCalledTimes(1);
  });

  it('removes all event listeners on cleanup', () => {
    const target = document.createElement('div');
    const clickHandler = vi.fn();
    const mouseoverHandler = vi.fn();

    const cleanup = addEventListeners(target, [
      { type: 'click', handler: clickHandler },
      { type: 'mouseover', handler: mouseoverHandler },
    ]);

    cleanup();
    target.dispatchEvent(new Event('click'));
    target.dispatchEvent(new Event('mouseover'));

    expect(clickHandler).not.toHaveBeenCalled();
    expect(mouseoverHandler).not.toHaveBeenCalled();
  });

  it('merges per-event options with default options', () => {
    const target = document.createElement('div');
    const addSpy = vi.spyOn(target, 'addEventListener');
    const handler = vi.fn();

    addEventListeners(
      target,
      [{ type: 'scroll', handler, options: { capture: true } }],
      { passive: true }
    );

    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), {
      passive: true,
      capture: true,
    });
  });

  it('per-event options override default options', () => {
    const target = document.createElement('div');
    const addSpy = vi.spyOn(target, 'addEventListener');
    const handler = vi.fn();

    addEventListeners(
      target,
      [{ type: 'click', handler, options: { passive: false } }],
      { passive: true }
    );

    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function), {
      passive: false,
    });
  });
});
