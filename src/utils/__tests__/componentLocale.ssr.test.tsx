// packages/components/src/utils/__tests__/componentLocale.ssr.test.tsx

/**
 * @fileoverview Component locale: SSR / ISR / CSR safety and default labels
 * @description Components read the UI language and their default labels from
 * `ComponentLocaleProvider` (mounted by `@donotdev/ui` with the i18n language), never
 * from `document` / `navigator`:
 * - the server render reads neither (both stubbed to throw);
 * - the markup is the same whatever the browser's language or `<html lang>` (a
 *   French UI in an English browser), so the server HTML hydrates without mismatch,
 *   in French and in English;
 * - labels are translated with no prop, an explicit prop overrides its default.
 */

import { act } from 'react';
import type { ReactElement } from 'react';
import { hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import DatePicker from '../../atomic/DatePicker';
import DateTimePicker from '../../atomic/DateTimePicker';
import Dialog from '../../atomic/Dialog';
import Pagination from '../../atomic/Pagination';
import { DataTable } from '../../atomic/Table';
import type { TableColumn } from '../../atomic/Table';
import { ComponentLocaleProvider } from '../translator';
import type { ComponentLocale } from '../translator';
import { EN_LOCALE, FR_LOCALE, render } from './locale';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

type Row = { id: string; name: string; price: number; stock: number };

const ROWS: Row[] = [
  { id: 'a', name: 'Écureuil', price: 1234.5, stock: 3 },
  { id: 'b', name: 'abeille', price: 29.9, stock: 12 },
  { id: 'c', name: 'Zèbre', price: 999, stock: 7 },
];

const COLUMNS: TableColumn<Row>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'price', title: 'Price', dataIndex: 'price', align: 'end' },
  {
    key: 'stock',
    title: 'Stock',
    dataIndex: 'stock',
    edit: { type: 'number' },
  },
];

/** A page of components with built-in labels and locale-aware output. */
function Screen({
  locale,
  selectAllLabel,
}: {
  locale: ComponentLocale;
  selectAllLabel?: string;
}) {
  return (
    <ComponentLocaleProvider value={locale}>
      <DataTable<Row>
        data={ROWS}
        columns={COLUMNS}
        pageSize={2}
        exportable
        editable
        getRowId={(row) => row.id}
        pendingChanges={{}}
        onPendingChange={() => {}}
        selectAllLabel={selectAllLabel}
      />
      <Pagination
        currentPage={1}
        totalPages={3}
        total={60}
        pageSize={25}
        onPageChange={() => {}}
      />
      <DatePicker value="2026-11-25" onChange={() => {}} />
      <DateTimePicker value="2026-11-25T10:30" onChange={() => {}} />
    </ComponentLocaleProvider>
  );
}

/** A global whose every property read throws: proves the render never reads it. */
const forbidden = (name: string) =>
  new Proxy(
    {},
    {
      get: (_target, property) => {
        throw new Error(
          `${name}.${String(property)} read during the server render`
        );
      },
    }
  );

/** Server render: `document` and `navigator` throw on any read. */
function serverRender(ui: ReactElement): string {
  vi.stubGlobal('document', forbidden('document'));
  vi.stubGlobal('navigator', forbidden('navigator'));
  try {
    return renderToString(ui);
  } finally {
    vi.unstubAllGlobals();
  }
}

let root: Root | undefined;
let host: HTMLDivElement | undefined;

afterEach(() => {
  if (root) act(() => root!.unmount());
  root = undefined;
  host?.remove();
  host = undefined;
  document.documentElement.removeAttribute('lang');
  vi.unstubAllGlobals();
});

describe.each([
  ['fr', FR_LOCALE],
  ['en', EN_LOCALE],
] as const)('component locale %s', (_language, locale) => {
  it('renders on the server without reading document or navigator', () => {
    expect(() => serverRender(<Screen locale={locale} />)).not.toThrow();
  });

  it('gives the same markup whatever the browser language or <html lang>', () => {
    const server = serverRender(<Screen locale={locale} />);
    // A browser in another language, a page lang set by something else
    vi.stubGlobal('navigator', { language: 'ja-JP', languages: ['ja-JP'] });
    document.documentElement.lang = 'de';
    expect(renderToString(<Screen locale={locale} />)).toBe(server);
  });

  it('hydrates the server HTML without a mismatch', () => {
    const server = serverRender(<Screen locale={locale} />);
    vi.stubGlobal('navigator', {
      ...navigator,
      language: 'ja-JP',
      languages: ['ja-JP'],
    });
    host = document.createElement('div');
    host.innerHTML = server;
    document.body.append(host);
    const errors: unknown[] = [];
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation((...args) => {
        errors.push(args);
      });
    act(() => {
      root = hydrateRoot(host!, <Screen locale={locale} />, {
        onRecoverableError: (error) => errors.push(error),
      });
    });
    consoleError.mockRestore();
    expect(errors).toEqual([]);
  });
});

describe('component locale labels', () => {
  it('translates the default labels with no prop (French)', () => {
    const html = serverRender(<Screen locale={FR_LOCALE} />);
    expect(html).toContain('aria-label="Sélectionner toutes les lignes"');
    expect(html).toContain('aria-label="Sélectionner la ligne 1"');
    expect(html).toContain('placeholder="Rechercher..."');
    expect(html).toContain('Exporter');
    expect(html).toContain('aria-label="Pagination"');
    expect(html).toContain('aria-label="Page 2"');
    expect(html).toContain('aria-label="Ouvrir le calendrier"');
    expect(html).toContain('aria-label="Date et heure"');
    // Segments and numbers in the UI language
    expect(html).toContain('aria-label="Jour"');
    expect(html).not.toContain('table.');
    expect(html).not.toContain('pagination.');
    expect(html).not.toContain('datePicker.');
  });

  it('translates the default labels with no prop (English)', () => {
    const html = serverRender(<Screen locale={EN_LOCALE} />);
    expect(html).toContain('aria-label="Select all rows"');
    expect(html).toContain('placeholder="Search..."');
    expect(html).toContain('Export');
    expect(html).toContain('aria-label="Open calendar"');
    expect(html).toContain('aria-label="Day"');
  });

  it('keeps an explicit label prop over the default', () => {
    const html = serverRender(
      <Screen locale={FR_LOCALE} selectAllLabel="Tout cocher" />
    );
    expect(html).toContain('aria-label="Tout cocher"');
    expect(html).not.toContain('Sélectionner toutes les lignes');
  });

  it('formats an editable number cell in the UI language', () => {
    const fr = serverRender(<Screen locale={FR_LOCALE} />);
    const en = serverRender(<Screen locale={EN_LOCALE} />);
    const big = { id: 'x', name: 'x', price: 0, stock: 1234.5 };
    const single = (locale: ComponentLocale) =>
      serverRender(
        <ComponentLocaleProvider value={locale}>
          <DataTable<Row>
            data={[big]}
            columns={COLUMNS}
            editable
            getRowId={(row) => row.id}
            pendingChanges={{}}
            onPendingChange={() => {}}
            searchable={false}
            pagination={false}
          />
        </ComponentLocaleProvider>
      );
    expect(single(FR_LOCALE)).toContain(
      new Intl.NumberFormat('fr').format(1234.5)
    );
    expect(single(EN_LOCALE)).toContain('1,234.5');
    expect(fr).not.toBe(en);
  });

  it('labels the Dialog close button and hidden texts, explicit closeLabel wins', () => {
    const { unmount } = render(<Dialog open>Body</Dialog>, FR_LOCALE);
    expect(document.querySelector('[aria-label="Fermer"]')).not.toBeNull();
    expect(document.body.textContent).toContain('Boîte de dialogue');
    expect(document.body.textContent).toContain(
      'Contenu de la boîte de dialogue'
    );
    unmount();
    render(
      <Dialog open closeLabel="Quitter">
        Body
      </Dialog>,
      FR_LOCALE
    );
    expect(document.querySelector('[aria-label="Quitter"]')).not.toBeNull();
  });
});
