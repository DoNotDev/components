# SwipeAction

Standalone cart-row swipe-to-reveal control. Swiping **never invokes `onAction`**.
Only explicit activation of the revealed trash button invokes it.

## API

Default export: `SwipeAction`. Named type export: `SwipeActionProps`.

```tsx
interface SwipeActionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAction'> {
  children: ReactNode;
  onAction: () => void;
  actionLabel: string;
  revealLabel: string;
  closeLabel: string;
  disabled?: boolean;
}
```

Pass translated labels from the application. Native div attributes and event
handlers apply to the outer wrapper. No routing, cart state, confirmation,
persistence, dependencies, or translation provider are introduced.

```tsx
<SwipeAction
  actionLabel={t('cart.removeItem')}
  revealLabel={t('cart.showActions')}
  closeLabel={t('cart.hideActions')}
  onAction={() => removeItem(item.id)}
>
  <CartItem item={item} />
</SwipeAction>
```

## Interaction and accessibility

- The ellipsis toggle remains visible independently of gesture support. Native
  buttons support keyboard and assistive-technology activation.
- The toggle exposes `aria-expanded` and `aria-controls`; its label switches
  between `revealLabel` and `closeLabel`.
- Native overflow clips the closed action. During a partial swipe the destructive
  background, trash icon and `actionLabel` progressively paint into view. Until
  fully open, the action remains inert, hidden from accessibility APIs, disabled,
  outside tab order and excluded from hit testing; visual reveal alone cannot delete.
- The action follows row content and immediately precedes its toggle in tab
  order. Focusing row content closes an open reveal so links/editors are not clipped.
- Escape closes and restores toggle focus. Activating the trash button closes
  and restores focus before invoking `onAction`. If that callback removes the row,
  the owning list must move focus to a surviving row or its empty state.
- Swiping toward inline-start reveals the action at inline-end. Reverse motion
  closes. Direction is inherited from the document or set using native `dir`.
- A native horizontal overflow viewport uses CSS scroll snapping. The browser
  owns gesture direction, momentum, cancellation, vertical scrolling and pinch.
  Interactive descendants use `touch-action: pan-y pinch-zoom`, scoped within
  content: enclosing focusable containers (including `Stack tabIndex={-1}`) do
  not block swipe. Disabling resets native scroll and closes without invoking the action.
- Only pointers with `pointerType === 'touch'` may reveal/close by swiping.
  Mouse, pen, and unknown pointers never drag the row, including on hybrid
  touchscreen computers. Do not infer input mode from screen width.
  The persistent toggle and explicit action work without swiping. ShopKB also
  retains a directly visible remove button on its cart rows.
- Both controls have minimum touch targets of 44 CSS pixels. Explicit toggles
  scroll instantly, so trash is immediately usable. There are no custom
  transitions; reduced-motion CSS keeps programmatic scrolling non-animated.

## Styling and integration

The entry declares `'use client'` for hook-based interaction in Next applications.
`SwipeAction.css` is imported locally by the component. It uses existing
`--background`, `--foreground`, `--destructive`, `--destructive-foreground`,
`--ring`, `--gap-sm`, and `--icon-md` tokens. The root defines
`--swipe-action-width` for the trailing action width; increase it via themed CSS
when translated labels need more room. Labels wrap within that width.

The public atomic barrel exports `SwipeAction` and `SwipeActionProps`; the central stylesheet imports its CSS. The component also imports its own CSS.

No pointer-move tracking, transforms, pointer capture, touchmove cancellation,
axis math, or second gesture engine is used. Native scroll position synchronizes
ARIA, inertness, and action availability only when the trailing snap endpoint is
reached. Pointerdown classifies actual input (not media queries): non-touch
pointers temporarily disable user scrolling while programmatic toggles still
work. A non-passive wheel listener excludes horizontal/Shift-wheel scrolling;
vertical wheel scrolling and Ctrl-wheel browser zoom remain native. Both action
buttons use `touch-action: manipulation`.

## Verification

```sh
bun test ./packages/components/src/atomic/SwipeAction/__tests__/
```

Happy-dom tests model scroll geometry/state, RTL, disabling, inertness,
explicit deletion, focus restoration, input classification, wheel exclusion and
SSR. It does not implement layout or native scrolling.

```sh
bun packages/components/tests/quantity-cart/run.ts
```

The Chromium runner exercises trusted CDP touch, mouse/pen and wheel input,
including hybrid desktop/touch profiles, a real enclosing `Stack tabIndex={-1}`,
reverse swipes, held partial-touch pixel checks for destructive paint, closed
clipping/accessibility/hit-test checks, immediate explicit trash, interactive exclusions, focus, RTL,
responsive geometry, CSS zoom, reduced motion and scoped axe checks.
These are emulated inputs, not physical-device certification. CDP pinch did not
increase visual viewport scale on either the fixture or a plain control page;
the runner verifies pinch permissions through all ancestors and absence of
accidental reveal/deletion, not physical pinch zoom. WebKit/Firefox and physical
trackpads remain unverified. No full accessibility, Lighthouse or performance
certification is claimed.
