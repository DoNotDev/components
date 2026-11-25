// packages/components/src/utils/__tests__/date.test.ts

/**
 * @fileoverview Date segment labels come from the UI locale (audit 2026-11-25 #13:
 * "MM/JJ/AAAA" and "Jour/Mois/Année" showed in an English UI).
 */

import { describe, it, expect } from 'vitest';

import { getSegmentLabels } from '../date';

describe('getSegmentLabels', () => {
  it('gives English placeholders and names in English', () => {
    const labels = getSegmentLabels('en');
    expect([labels.day, labels.month, labels.year].map((l) => l.placeholder)).toEqual([
      'DD',
      'MM',
      'YYYY',
    ]);
    expect(labels.day.ariaLabel).toBe('Day');
    expect(labels.year.ariaLabel).toBe('Year');
    expect(labels.hour.placeholder).toBe('HH');
  });

  it('gives French placeholders and names in French', () => {
    const labels = getSegmentLabels('fr');
    expect([labels.day, labels.month, labels.year].map((l) => l.placeholder)).toEqual([
      'JJ',
      'MM',
      'AAAA',
    ]);
    expect(labels.day.ariaLabel).toBe('Jour');
    expect(labels.month.ariaLabel).toBe('Mois');
    expect(labels.year.ariaLabel).toBe('Année');
    expect(labels.hour.ariaLabel).toBe('Heure');
  });

  it('shows a non-Latin field name once instead of a repeated initial', () => {
    expect(getSegmentLabels('ja').year.placeholder).toBe('年');
  });
});
