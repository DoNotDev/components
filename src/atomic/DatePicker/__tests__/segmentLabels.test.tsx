// packages/components/src/atomic/DatePicker/__tests__/segmentLabels.test.tsx

/**
 * @fileoverview Segment placeholders and names follow the `locale` prop (the UI
 * language), not a hard-coded French set.
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import DateTimePicker from '../../DateTimePicker';
import DatePicker from '../index';

afterEach(cleanup);

describe('DatePicker segment labels', () => {
  it('shows English placeholders and names in English', () => {
    render(<DatePicker value={null} onChange={() => {}} locale="en-US" />);
    expect(screen.getByRole('spinbutton', { name: 'Day' }).textContent).toBe('DD');
    expect(screen.getByRole('spinbutton', { name: 'Month' }).textContent).toBe('MM');
    expect(screen.getByRole('spinbutton', { name: 'Year' }).textContent).toBe('YYYY');
  });

  it('shows French placeholders and names in French', () => {
    render(<DatePicker value={null} onChange={() => {}} locale="fr-FR" />);
    expect(screen.getByRole('spinbutton', { name: 'Jour' }).textContent).toBe('JJ');
    expect(screen.getByRole('spinbutton', { name: 'Année' }).textContent).toBe('AAAA');
  });

  it('names the time segments in the locale (DateTimePicker)', () => {
    render(<DateTimePicker value={null} onChange={() => {}} locale="en-US" />);
    expect(screen.getByRole('spinbutton', { name: 'Hour' }).textContent).toBe('HH');
    expect(screen.getByRole('spinbutton', { name: 'Minute' }).textContent).toBe('MM');
  });
});
