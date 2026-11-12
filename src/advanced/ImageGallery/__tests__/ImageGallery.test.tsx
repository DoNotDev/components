// packages/components/src/advanced/ImageGallery/__tests__/ImageGallery.test.tsx

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

import { ImageGallery } from '../ImageGallery';

const IMAGES = [
  { fullUrl: '/a-full.jpg', thumbUrl: '/a-thumb.jpg' },
  { fullUrl: '/b-full.jpg', thumbUrl: '/b-thumb.jpg' },
  { fullUrl: '/c-full.jpg', thumbUrl: '/c-thumb.jpg' },
];

/** IntersectionObserver the test drives: `show(slide)` reports it fully visible. */
class ControlledObserver {
  static instances: ControlledObserver[] = [];
  targets: Element[] = [];
  constructor(
    private callback: IntersectionObserverCallback,
    public options: IntersectionObserverInit
  ) {
    ControlledObserver.instances.push(this);
  }
  observe(target: Element): void {
    this.targets.push(target);
  }
  disconnect(): void {
    this.targets = [];
  }
  show(target: Element): void {
    this.callback(
      [{ target, intersectionRatio: 1 } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
}

/** Simulates a native swipe that lands on `slide`. */
function swipeTo(slide: Element): void {
  const observer = ControlledObserver.instances.find((o) =>
    o.targets.includes(slide)
  )!;
  act(() => observer.show(slide));
}

beforeEach(() => {
  ControlledObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', ControlledObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function openLightbox(container: HTMLElement): HTMLElement {
  fireEvent.click(container.querySelector('.image-gallery__main')!);
  return document.querySelector<HTMLElement>('.image-gallery__lightbox-stage')!;
}

function drag(
  target: Element,
  from: { x: number; y: number },
  to: { x: number; y: number },
  pointerType = 'touch'
): void {
  const base = { pointerId: 1, pointerType, isPrimary: true, button: 0 };
  fireEvent.pointerDown(target, { ...base, clientX: from.x, clientY: from.y });
  fireEvent.pointerMove(target, {
    ...base,
    clientX: (from.x + to.x) / 2,
    clientY: (from.y + to.y) / 2,
  });
  fireEvent.pointerMove(target, { ...base, clientX: to.x, clientY: to.y });
  fireEvent.pointerUp(target, { ...base, clientX: to.x, clientY: to.y });
}

describe('ImageGallery', () => {
  it('renders one swipeable slide per image, neighbours eager, the rest lazy', () => {
    const { container } = render(
      <ImageGallery images={[...IMAGES, '/d.jpg', '/e.jpg']} />
    );
    const slides = container.querySelectorAll('.image-gallery__slide');
    expect(slides).toHaveLength(5);
    const loading = [...slides].map(
      (slide) =>
        slide
          .querySelector('.image-gallery__slide-img:not(.image-gallery__slide-placeholder)')!
          .getAttribute('loading')
    );
    // Current (0), next (1) and previous by wrap-around (4) load now
    expect(loading).toEqual(['eager', 'eager', 'lazy', 'lazy', 'eager']);
  });

  it('selects an image from its thumbnail and reports it', () => {
    const onImageChange = vi.fn();
    render(<ImageGallery images={IMAGES} onImageChange={onImageChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'View image 3' }));
    expect(
      screen.getByRole('tab', { name: 'View image 3' }).getAttribute('aria-selected')
    ).toBe('true');
    expect(onImageChange).toHaveBeenCalledWith(2);
  });

  it('follows a native swipe of the main view', () => {
    const onImageChange = vi.fn();
    const { container } = render(
      <ImageGallery images={IMAGES} onImageChange={onImageChange} />
    );
    swipeTo(container.querySelectorAll('.image-gallery__slide')[1]!);
    expect(
      screen.getByRole('tab', { name: 'View image 2' }).getAttribute('aria-selected')
    ).toBe('true');
    expect(onImageChange).toHaveBeenCalledWith(1);
  });

  it('opens the lightbox on the current image, full size, only neighbours mounted', () => {
    const { container } = render(
      <ImageGallery images={[...IMAGES, '/d.jpg', '/e.jpg']} />
    );
    fireEvent.click(screen.getByRole('tab', { name: 'View image 2' }));
    openLightbox(container);
    const sources = [
      ...document.querySelectorAll('.image-gallery__lightbox-slide'),
    ].map((slide) =>
      slide.querySelector('.image-gallery__lightbox-img')?.getAttribute('src')
    );
    expect(sources).toEqual([
      '/a-full.jpg',
      '/b-full.jpg',
      '/c-full.jpg',
      undefined,
      undefined,
    ]);
    expect(screen.getByText('2 / 5')).toBeTruthy();
  });

  it('shows the cached thumbnail under each full image until it loads', () => {
    const { container } = render(<ImageGallery images={IMAGES} />);
    const stage = openLightbox(container);
    const frame = stage.querySelector<HTMLElement>(
      '.image-gallery__lightbox-slide:not([aria-hidden]) .image-gallery__lightbox-frame'
    )!;
    const [placeholder, full] = frame.querySelectorAll('img');
    expect(placeholder!.getAttribute('src')).toBe('/a-thumb.jpg');
    expect(full!.getAttribute('src')).toBe('/a-full.jpg');
    expect(frame.hasAttribute('data-loaded')).toBe(false);
    fireEvent.load(full!);
    expect(frame.hasAttribute('data-loaded')).toBe(true);
  });

  it('fetches the current lightbox image first, its neighbours at low priority', () => {
    const { container } = render(<ImageGallery images={IMAGES} />);
    const stage = openLightbox(container);
    const priorities = [
      ...stage.querySelectorAll('.image-gallery__lightbox-img'),
    ].map((img) => img.getAttribute('fetchpriority'));
    expect(priorities).toEqual(['high', 'low', 'low']);
  });

  it('morphs the image into the lightbox and back with a view transition', async () => {
    /** Name of the element carrying the morph name in the old / new state of each call. */
    const states: Array<{ old: string; next: string }> = [];
    const named = (): string => {
      const el = document.querySelector<HTMLElement>(
        '[style*="view-transition-name"]'
      );
      if (!el) return 'none';
      return el.classList.contains('image-gallery__slide') ? 'slide' : 'frame';
    };
    const startViewTransition = vi.fn((update: () => Promise<void>) => {
      const old = named();
      const updated = update().then(() => {
        states.push({ old, next: named() });
      });
      return { finished: updated, updateCallbackDone: updated, ready: updated };
    });
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    Object.assign(document, { startViewTransition });
    try {
      const { container } = render(<ImageGallery images={IMAGES} />);
      fireEvent.click(container.querySelector('.image-gallery__main')!);
      await waitFor(() => expect(states).toHaveLength(1));
      expect(states[0]).toEqual({ old: 'slide', next: 'frame' });
      fireEvent.keyDown(
        document.querySelector('.image-gallery__lightbox-stage')!,
        { key: 'Escape' }
      );
      await waitFor(() => expect(states).toHaveLength(2));
      expect(states[1]).toEqual({ old: 'frame', next: 'slide' });
      expect(document.querySelector('.image-gallery__lightbox-stage')).toBeNull();
      // Cleared once the transition finished: one name at a time, none at rest
      await waitFor(() => expect(named()).toBe('none'));
    } finally {
      Reflect.deleteProperty(document, 'startViewTransition');
    }
  });

  it('pages the lightbox with a native swipe and reports it to the gallery', () => {
    const onImageChange = vi.fn();
    const { container } = render(
      <ImageGallery images={IMAGES} onImageChange={onImageChange} />
    );
    openLightbox(container);
    swipeTo(document.querySelectorAll('.image-gallery__lightbox-slide')[1]!);
    expect(screen.getByText('2 / 3')).toBeTruthy();
    expect(onImageChange).toHaveBeenCalledWith(1);
    expect(
      screen
        .getByRole('tab', { name: 'View image 2', hidden: true })
        .getAttribute('aria-selected')
    ).toBe('true');
  });

  it('pages the lightbox with the arrow keys', async () => {
    const { container } = render(<ImageGallery images={IMAGES} />);
    const stage = openLightbox(container);
    fireEvent.keyDown(stage, { key: 'ArrowLeft' });
    await waitFor(() => expect(screen.getByText('3 / 3')).toBeTruthy());
  });

  it('closes the lightbox with a vertical swipe', async () => {
    const { container } = render(<ImageGallery images={IMAGES} />);
    const stage = openLightbox(container);
    drag(stage, { x: 200, y: 100 }, { x: 205, y: 400 });
    await waitFor(() =>
      expect(document.querySelector('.image-gallery__lightbox-stage')).toBeNull()
    );
  });

  it('closes the lightbox on a background tap', async () => {
    const { container } = render(<ImageGallery images={IMAGES} />);
    const stage = openLightbox(container);
    drag(stage, { x: 500, y: 500 }, { x: 500, y: 500 });
    await waitFor(() =>
      expect(document.querySelector('.image-gallery__lightbox-stage')).toBeNull()
    );
  });

  it('zooms the image on a mouse click instead of closing, and back', () => {
    const { container } = render(<ImageGallery images={IMAGES} />);
    const stage = openLightbox(container);
    const frame = stage.querySelector<HTMLElement>(
      '.image-gallery__lightbox-slide:not([aria-hidden]) .image-gallery__lightbox-frame'
    )!;
    const img = frame.querySelector('.image-gallery__lightbox-img')!;
    drag(img, { x: 200, y: 200 }, { x: 200, y: 200 }, 'mouse');
    expect(stage.hasAttribute('data-zoomed')).toBe(true);
    expect(frame.style.transform).toContain('scale(2)');
    drag(img, { x: 200, y: 200 }, { x: 200, y: 200 }, 'mouse');
    expect(stage.hasAttribute('data-zoomed')).toBe(false);
    expect(frame.style.transform).toBe('');
  });

  it('keeps the lightbox open on a single touch tap on the image', () => {
    const { container } = render(<ImageGallery images={IMAGES} />);
    const stage = openLightbox(container);
    drag(stage.querySelector('img')!, { x: 200, y: 200 }, { x: 200, y: 200 });
    expect(document.querySelector('.image-gallery__lightbox-stage')).not.toBeNull();
    expect(stage.hasAttribute('data-zoomed')).toBe(false);
  });

  it('opts out of the lightbox with nobox', () => {
    const { container } = render(<ImageGallery images={IMAGES} nobox />);
    fireEvent.click(container.querySelector('.image-gallery__main')!);
    expect(document.querySelector('.image-gallery__lightbox-stage')).toBeNull();
  });

  it('protects every picture: no context menu, no drag, in the gallery and the lightbox', () => {
    const { container } = render(<ImageGallery images={IMAGES} />);
    const galleryImgs = [...container.querySelectorAll('img')];
    expect(galleryImgs.length).toBeGreaterThan(0);
    for (const img of galleryImgs) {
      expect(fireEvent.contextMenu(img)).toBe(false);
      expect(img.getAttribute('draggable')).toBe('false');
    }

    const stage = openLightbox(container);
    const lightboxImgs = [...stage.querySelectorAll('img')];
    expect(lightboxImgs.length).toBeGreaterThan(0);
    for (const img of lightboxImgs) {
      expect(fireEvent.contextMenu(img)).toBe(false);
      expect(img.getAttribute('draggable')).toBe('false');
    }
  });
});
