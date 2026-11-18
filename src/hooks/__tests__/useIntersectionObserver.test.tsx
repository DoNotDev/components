import { useSyncExternalStore } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useIntersectionObserver } from '../useIntersectionObserver';

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  return {
    ...react,
    useSyncExternalStore: vi.fn(react.useSyncExternalStore),
  };
});

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds = [0];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [];

  constructor(private callback: IntersectionObserverCallback) {}

  intersect(target: Element) {
    this.callback([{
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRatio: 1,
      intersectionRect: target.getBoundingClientRect(),
      isIntersecting: true,
      rootBounds: null,
      target,
      time: 0,
    }], this);
  }
}

function Probe({ fallbackIntersecting }: { fallbackIntersecting: boolean }) {
  const { ref, isIntersecting, hasTriggered } = useIntersectionObserver({
    fallbackIntersecting,
  });
  return <div ref={ref}>{String(isIntersecting)}:{String(hasTriggered)}</div>;
}

function snapshots() {
  const call = vi.mocked(useSyncExternalStore).mock.calls.at(-1);
  if (!call || !call[2]) throw new Error('Expected client and server snapshot getters');
  return { getSnapshot: call[1], getServerSnapshot: call[2] };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('useIntersectionObserver snapshots', () => {
  it.each([false, true])('keeps the server snapshot stable without window (fallback %s)', (fallbackIntersecting) => {
    vi.stubGlobal('window', undefined);
    const html = renderToString(<Probe fallbackIntersecting={fallbackIntersecting} />);
    const { getSnapshot, getServerSnapshot } = snapshots();
    const serverSnapshot = getServerSnapshot();

    expect(serverSnapshot).toEqual({ isIntersecting: fallbackIntersecting, hasTriggered: false, entry: null });
    expect(getServerSnapshot()).toBe(serverSnapshot);
    expect(getSnapshot()).toBe(serverSnapshot);
    expect(html).toContain(`${String(fallbackIntersecting)}<!-- -->:<!-- -->false`);
  });

  it.each([false, true])('updates the CSR snapshot without changing the server snapshot (fallback %s)', (fallbackIntersecting) => {
    const observers: MockIntersectionObserver[] = [];
    vi.stubGlobal('IntersectionObserver', class extends MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        super(callback);
        observers.push(this);
      }
    });
    const { container, unmount } = render(<Probe fallbackIntersecting={fallbackIntersecting} />);
    const { getSnapshot, getServerSnapshot } = snapshots();
    const serverSnapshot = getServerSnapshot();
    const observer = observers.at(-1);
    const target = container.firstElementChild;
    if (!observer || !target) throw new Error('Expected an observed element');

    expect(container.textContent).toBe(`${String(fallbackIntersecting)}:false`);
    expect(getSnapshot()).toBe(getSnapshot());
    act(() => observer.intersect(target));

    expect(container.textContent).toBe('true:true');
    expect(getSnapshot()).not.toBe(serverSnapshot);
    expect(getSnapshot()).toBe(getSnapshot());
    expect(getServerSnapshot()).toBe(serverSnapshot);
    expect(serverSnapshot).toEqual({ isIntersecting: fallbackIntersecting, hasTriggered: false, entry: null });
    unmount();
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it.each([false, true])('hydrates without snapshot warnings or recovery (fallback %s)', async (fallbackIntersecting) => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    const element = <Probe fallbackIntersecting={fallbackIntersecting} />;
    const container = document.createElement('div');
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onRecoverableError = vi.fn();

    try {
      const root = await act(async () => hydrateRoot(container, element, { onRecoverableError }));
      try {
        expect(container.textContent).toBe(`${String(fallbackIntersecting)}:false`);
        expect(onRecoverableError).not.toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
      } finally {
        await act(async () => root.unmount());
      }
    } finally {
      container.remove();
    }
  });
});
