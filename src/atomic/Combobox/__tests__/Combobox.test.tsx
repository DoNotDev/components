import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { FR_LOCALE, render } from '../../../utils/__tests__/locale';
import Combobox from '../index';

afterEach(cleanup);

const options = [
  { value: 'toner', label: 'Lotion' },
  { value: 'serum', label: 'Sérum' },
];

function input() {
  return screen.getByRole('combobox') as HTMLInputElement;
}

describe('Combobox multiple: selection display (no chips)', () => {
  it('no selection: the placeholder', () => {
    render(<Combobox multiple options={options} value={[]} placeholder="Filtrer..." />);
    expect(input().value).toBe('');
    expect(input().placeholder).toBe('Filtrer...');
  });

  it('one value: its option label', () => {
    render(<Combobox multiple options={options} value={['serum']} placeholder="Filtrer..." />);
    expect(input().value).toBe('Sérum');
  });

  it('several values: selectedLabel with the count', () => {
    render(
      <Combobox
        multiple
        options={options}
        value={['serum', 'toner']}
        placeholder="Filtrer..."
        selectedLabel="{{count}} sélectionnés"
      />
    );
    expect(input().value).toBe('2 sélectionnés');
  });

  it('default selectedLabel', () => {
    render(<Combobox multiple options={options} value={['serum', 'toner']} />);
    expect(input().value).toBe('2 selected');
  });

  it('one value without a known option: the count, never the raw value', () => {
    render(<Combobox multiple options={options} value={['b1']} />);
    expect(input().value).toBe('1 selected');
  });

  it('open: empty search field, the summary as placeholder', () => {
    render(<Combobox multiple options={options} value={['serum', 'toner']} />);
    fireEvent.focus(input());
    expect(input().value).toBe('');
    expect(input().placeholder).toBe('2 selected');
  });

  it('with chips: no text summary (the chips show the selection)', () => {
    render(
      <Combobox
        multiple
        options={options}
        value={['serum', 'toner']}
        chips={<span>chips</span>}
        placeholder="Filtrer..."
      />
    );
    expect(input().value).toBe('');
    expect(input().placeholder).toBe('');
  });
});

describe('Combobox clear button label', () => {
  it('uses clearLabel', () => {
    render(<Combobox clearable options={options} value="serum" clearLabel="Effacer" />);
    expect(screen.getByRole('button', { name: 'Effacer' })).toBeTruthy();
  });

  it("defaults to 'Clear'", () => {
    render(<Combobox clearable options={options} value="serum" />);
    expect(screen.getByRole('button', { name: 'Clear' })).toBeTruthy();
  });
});

describe('Combobox default labels follow the UI language', () => {
  it('French placeholder, plural selection summary and clear label', () => {
    render(<Combobox clearable options={options} value="" />, FR_LOCALE);
    expect(input().placeholder).toBe('Sélectionner');
    cleanup();
    render(<Combobox multiple options={options} value={['serum', 'toner']} />, FR_LOCALE);
    expect(input().value).toBe('2 sélectionnés');
    cleanup();
    render(<Combobox multiple options={options} value={['b1']} />, FR_LOCALE);
    expect(input().value).toBe('1 sélectionné');
    cleanup();
    render(<Combobox clearable options={options} value="serum" />, FR_LOCALE);
    expect(screen.getByRole('button', { name: 'Effacer' })).toBeTruthy();
  });

  it('French empty message when the search matches nothing', () => {
    render(<Combobox options={options} value="" />, FR_LOCALE);
    fireEvent.focus(input());
    fireEvent.change(input(), { target: { value: 'zzz' } });
    expect(screen.getByText('Aucun résultat trouvé')).toBeTruthy();
  });
});
