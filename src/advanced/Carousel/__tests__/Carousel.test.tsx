// packages/components/src/advanced/Carousel/__tests__/Carousel.test.tsx

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ComponentLocaleProvider } from '../../../utils/translator';
import CarouselContent from '../CarouselContent';

const ITEMS = ['a', 'b', 'c'];

/** Observers the carousel creates are never driven here. */
class IdleObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', IdleObserver);
  vi.stubGlobal('ResizeObserver', IdleObserver);
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const renderItem = (item: string) => <span>{item}</span>;

describe('Carousel labels', () => {
  it('without a translator provider, built-in labels are the keys', () => {
    render(
      <CarouselContent
        items={ITEMS}
        renderItem={renderItem}
        showDots
        showPlayPause
        autoplay
      />
    );
    expect(screen.getByRole('region', { name: 'carousel.label' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'carousel.previous' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'carousel.next' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'carousel.pause' })).toBeTruthy();
  });

  it('translates the labels through the translator provider, with interpolation values', () => {
    const translate = (
      key: string,
      values?: Record<string, string | number>
    ): string => `${key}${values ? JSON.stringify(values) : ''}`;
    render(
      <ComponentLocaleProvider value={{ language: 'en', translate }}>
        <CarouselContent items={ITEMS} renderItem={renderItem} showDots />
      </ComponentLocaleProvider>
    );
    expect(screen.getByRole('region', { name: 'carousel.label' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'carousel.previous' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'carousel.goToSlide{"index":2}' })
    ).toBeTruthy();
    expect(
      screen.getAllByLabelText('carousel.slide{"current":1,"total":3}').length
    ).toBeGreaterThan(0);
  });

  it('lets the label props override the translation', () => {
    render(
      <ComponentLocaleProvider value={{ language: 'en', translate: (key) => `T:${key}` }}>
        <CarouselContent
          items={ITEMS}
          renderItem={renderItem}
          showDots
          aria-label="Vitrine"
          previousLabel="Précédent"
          nextLabel="Suivant"
          goToSlideLabel={(index) => `Aller à ${index}`}
        />
      </ComponentLocaleProvider>
    );
    expect(screen.getByRole('region', { name: 'Vitrine' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Précédent' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Suivant' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Aller à 2' })).toBeTruthy();
  });

  it('translates the empty text', () => {
    render(
      <ComponentLocaleProvider value={{ language: 'en', translate: (key) => `T:${key}` }}>
        <CarouselContent items={[]} renderItem={renderItem} />
      </ComponentLocaleProvider>
    );
    expect(screen.getByText('T:carousel.empty')).toBeTruthy();
  });
});
