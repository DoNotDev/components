// packages/components/src/advanced/Marquee/__tests__/Marquee.types.test.tsx

/**
 * Type-level test: the exported (lazy-loading) Marquee keeps its item generic,
 * so `renderItem` receives the type of `items`, not `unknown`.
 * The assertions are compile-time: `vitest --typecheck` with a tsconfig that includes this file checks them
 * (`dn tc` and the package tsconfigs exclude `__tests__`); at runtime they are no-ops.
 */

import { describe, expectTypeOf, it } from 'vitest';

import Marquee from '../Marquee';

import type { MarqueeProps } from '../Marquee';

interface Company {
  name: string;
}

describe('Marquee item type', () => {
  it('renderItem receives the item type of items', () => {
    expectTypeOf(Marquee<Company>)
      .parameter(0)
      .toEqualTypeOf<MarqueeProps<Company>>();
    expectTypeOf<
      Parameters<MarqueeProps<Company>['renderItem']>[0]
    >().toEqualTypeOf<Company>();
  });

  it('infers the item type from items at the call site', () => {
    const typed = (
      <Marquee
        items={[{ name: 'Acme' }]}
        renderItem={(item) => {
          expectTypeOf(item).toEqualTypeOf<{ name: string }>();
          return item.name;
        }}
      />
    );
    const mismatched = (
      <Marquee
        // @ts-expect-error items and renderItem disagree on the item type
        items={[{ name: 'Acme' }]}
        renderItem={(item: { title: string }) => item.title}
      />
    );
    expectTypeOf(typed).toEqualTypeOf(mismatched);
  });
});
