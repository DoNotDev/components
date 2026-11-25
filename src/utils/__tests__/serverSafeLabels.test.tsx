// packages/components/src/utils/__tests__/serverSafeLabels.test.tsx

/**
 * @fileoverview Default labels of the server-safe components (owner decision 2026-11-25
 * F5b): Spinner, Skeleton, CallToAction, FeatureFallback and the Code / Marquee
 * skeletons stay without `'use client'`; their default text comes from the one client
 * piece (`ComponentLabelText`), in the UI language, and names the element. An app's
 * `aria-label` wins, rendered as before.
 */

import { screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import CodeSkeleton from '../../advanced/Code/CodeSkeleton';
import MarqueeSkeleton from '../../advanced/Marquee/MarqueeSkeleton';
import CallToAction from '../../atomic/CallToAction';
import FeatureFallback from '../../atomic/FeatureFallback';
import Skeleton from '../../atomic/Skeleton';
import Spinner from '../../atomic/Spinner';
import { ComponentLocaleProvider } from '../translator';
import { FR_LOCALE, render } from './locale';

describe('server-safe components: translated default labels', () => {
  it('Spinner is named by the translated loading text', () => {
    render(<Spinner />, FR_LOCALE);
    const status = screen.getByRole('status', { name: 'Chargement...' });
    expect(status.hasAttribute('aria-label')).toBe(false);
  });

  it('Skeleton (one line and several) is named by the translated loading text', () => {
    render(<Skeleton />, FR_LOCALE);
    expect(screen.getByRole('status', { name: 'Chargement...' })).toBeTruthy();
    render(<Skeleton lines={3} />, FR_LOCALE);
    expect(screen.getAllByRole('status', { name: 'Chargement...' })).toHaveLength(2);
  });

  it('Code and Marquee skeletons are named in the UI language', () => {
    render(<CodeSkeleton />, FR_LOCALE);
    expect(screen.getByRole('status', { name: 'Chargement du code' })).toBeTruthy();
    render(<MarqueeSkeleton />, FR_LOCALE);
    expect(screen.getByRole('status', { name: 'Chargement...' })).toBeTruthy();
  });

  it('CallToAction region is named in the UI language', () => {
    render(<CallToAction title="Offre" />, FR_LOCALE);
    expect(screen.getByRole('region', { name: 'Appel à l’action' })).toBeTruthy();
  });

  it('FeatureFallback texts are translated with the feature name', () => {
    render(<FeatureFallback featureName="Stripe" showActionButton />, FR_LOCALE);
    expect(screen.getByText('Stripe indisponible')).toBeTruthy();
    expect(screen.getByText('Stripe n’est pas disponible')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Stripe (indisponible)' })).toBeTruthy();
    expect(
      screen.getByText('Cette fonctionnalité nécessite que Stripe soit configuré.')
    ).toBeTruthy();
  });

  it('is in the server HTML (the client piece renders on the server too)', () => {
    const html = renderToString(
      <ComponentLocaleProvider value={FR_LOCALE}>
        <Spinner />
      </ComponentLocaleProvider>
    );
    expect(html).toContain('Chargement...');
    expect(html).toMatch(/aria-labelledby="([^"]+)"[^>]*>.*id="\1"/s);
  });
});

describe('server-safe components: the app label wins', () => {
  it('Spinner and Skeleton keep the given aria-label as before', () => {
    render(<Spinner aria-label="Envoi" />, FR_LOCALE);
    const spinner = screen.getByRole('status', { name: 'Envoi' });
    expect(spinner.getAttribute('aria-label')).toBe('Envoi');
    expect(spinner.hasAttribute('aria-labelledby')).toBe(false);
    expect(spinner.textContent).toBe('Envoi');
    render(<Skeleton aria-label="Produits" />, FR_LOCALE);
    expect(screen.getByRole('status', { name: 'Produits' }).getAttribute('aria-label')).toBe(
      'Produits'
    );
  });

  it('CallToAction keeps the given aria-label, no hidden label', () => {
    const { container } = render(
      <CallToAction title="Offre" aria-label="Promotion" />,
      FR_LOCALE
    );
    expect(screen.getByRole('region', { name: 'Promotion' })).toBeTruthy();
    expect(container.querySelector('.dndev-cta > .dndev-sr-only')).toBeNull();
  });

  it('FeatureFallback keeps the given texts', () => {
    render(
      <FeatureFallback featureName="Stripe" message="Paiement en pause" helpText="Revenez demain" />,
      FR_LOCALE
    );
    expect(screen.getByText('Paiement en pause')).toBeTruthy();
    expect(screen.getByText('Revenez demain')).toBeTruthy();
  });
});
