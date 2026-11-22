# QuantityStepper

Standalone cart/catalogue quantity control. Caller owns `value`; no internal quantity state or per-keystroke React updates.

**Press and hold** − / + to repeat: first repeat after 400 ms, then every 150 ms, faster after 5 and 15 repeats; stops at the bounds. Editable mode steps a draft in the DOM and calls `onChange` **once** on release (one save, not one per tick); a click following a repeating hold is not applied twice. Legacy mode calls `onIncrement` / `onDecrement` per repeat. Long press opens no touch callout or text selection.

## Editable mode

```tsx
<QuantityStepper
  value={quantity}
  onChange={setQuantity}
  min={3}
  step={4}
  max={14}
  allowZero
  collapseWhenZero
  aria-label={t('cart.quantity')}
  decrementLabel={t('cart.removeLot')}
  incrementLabel={t('cart.addLot')}
  valueLabel={t('cart.editQuantity')}
/>
```

For vertical controls, add `vertical`: **plus above quantity above minus**, including DOM/tab order. Default horizontal order: minus, quantity, plus.

### API

| Prop | Default | Behavior |
| --- | --- | --- |
| `value: number` | required | Controlled committed quantity. |
| `onChange?: (value: number) => void` | absent | Enables editable mode. Takes precedence over `onIncrement`, `onDecrement`, and `onValueClick`. |
| `min?: number` | `1` | First positive lot. Positive safe integer. |
| `step?: number` | `1` | Positive safe-integer lot size. |
| `max?: number` | `Number.MAX_SAFE_INTEGER` | Safe integer at least `min`; effective maximum rounds down to a complete lot. |
| `allowZero?: boolean` | `false` | Allows committing zero, separate from positive lots. |
| `collapseWhenZero?: boolean` | `false` | At zero, shows only a square accessible plus at the inline end, reserving the block size only; the first + grows the control toward the inline start. |
| `vertical?: boolean` | `false` | Plus, quantity, minus stacked; changes visual and keyboard traversal order. |
| `disabled?: boolean` | `false` | Disables all controls. |
| `fullWidth?: boolean` | `false` | Fills available inline width, horizontal or vertical. |
| `aria-label: string` | required | Accessible group name; also the editor name unless `valueLabel` is supplied. |
| `decrementLabel: string` | required | Accessible minus name. |
| `incrementLabel: string` | required | Accessible plus name, including collapsed state. |
| `valueLabel?: string` | absent | Accessible editor or legacy clickable-value name. |
| `className` / div attributes | absent | Applied to the group. Component owns group role and state attributes. |

### Validation and commits

- Valid positive quantities: `min + k * step`, for nonnegative integer `k`.
- Typed quantities round **up** to a complete lot, then clamp to the effective maximum (rounded **down**). Example: `min=3, step=4, max=14` permits `3, 7, 11`; typing `8` commits `11`.
- `allowZero` adds `0`; positive values below `min` normalize to `min`.
- Zero is accepted as an initial/external not-yet-added sentinel even without `allowZero`. Plus starts at `min`. Without `allowZero`, decrementing a positive quantity never removes it.
- Configuration and controlled values must be safe integers. Invalid configuration, negative/fractional/nonfinite controlled values, or positive controlled values outside the lot lattice/bounds throw `RangeError`. Bounds apply to editable mode only; legacy callbacks retain their own rules.
- Editor is a native **uncontrolled text input**, `inputMode="numeric"`, with spinbutton semantics. Bulk typing/paste stays in the DOM. Leaving the control group or Enter commits; Escape reverts. Moving focus from the editor to a direction button preserves the draft; activating that button applies its step to the draft in a single callback, including with an asynchronous parent. Enter does not submit an enclosing form. Repeated blur after Enter does not duplicate a commit.
- While typing, DOM `aria-valuenow` reflects the displayed numeric draft, not a stale committed value. Out-of-range/off-lot drafts expose `aria-invalid`; malformed/empty drafts omit the numeric value. Commit, Escape and parent updates restore both visual and accessible state without per-keystroke React state.
- Only decimal integer text is accepted (surrounding whitespace allowed). Empty, signed, fractional, scientific notation, nonfinite, unsafe integers, and malformed input revert without a callback. No `NaN` commits.
- Arrow Up/Down moves one lot; Page Up/Down moves ten lots; Home selects zero when permitted, otherwise `min`; End selects the effective maximum. Text-editing shortcuts and composition are preserved.
- Changes emit only when different from `value`. The parent must accept by updating `value`; until then the editor returns to the controlled quantity. External value changes synchronize the editor. Unrelated rerenders preserve an in-progress draft.

## Legacy mode (unchanged)

Without `onChange`, `onIncrement?: () => void` and `onDecrement?: () => void` drive the buttons. An omitted callback disables that direction. The quantity is a live output, or a button when `onValueClick?: () => void` is provided. Caller owns bounds, lots, and all arithmetic. Existing value-click and disabled/fullWidth behavior is retained. New collapse/vertical options also work in legacy mode.

## Accessibility, layout, SSR

Supply localized labels. All enabled visible buttons and the editor are keyboard reachable; boundary buttons are natively disabled outside an editing session. While editing, directions stay reachable to apply a step to a replacement draft, even when the controlled value is at a bound. Hidden collapsed controls leave the accessibility tree and tab order. The same plus DOM node survives expansion/collapse; collapsing while the editor/minus has focus transfers focus to plus, without stealing focus from outside the group.

Touch targets use `var(--touch-target)`: each cell is exactly the token (padding and icons fit inside, so a larger `--gap-sm` never inflates it) and grows only with enlarged text (`max(target, 1lh + 2 × --gap-sm)`, WCAG 1.4.4 / 1.4.12). − and + are one cell square; the quantity field is content-sized for three tabular digits (`3ch + --gap-sm`), one cell high, and stays at the touch target when it is a clickable `onValueClick` button. Expanded minimum footprint: two cells + field + border. `fullWidth` fills the container but shrinks to that minimum, never further. Collapsed, the horizontal control is a single cell-sized square (+) aligned to the inline end with `fullWidth` (otherwise placed by its parent); rows are fixed in both states so expanding never shifts layout vertically, and the inline size is not reserved. Expansion animates only the inline size, from the inline end toward the inline start (logical properties, RTL-correct): − and the field reveal from zero-width tracks and fade in (`--dur-normal`, `--ease-in-out`); they clip their own content, so focus rings are never clipped. Vertical keeps its stacked footprint: the collapsed + spans all three cells, not animated. Density/theme tokens drive size, spacing, icons, borders, and focus. The same sizing applies on mobile, tablet, and desktop. Reduced-motion users receive no transition. Native buttons are `type="button"`; the only timers are the press-and-hold repeat, cleared on release, disable and unmount; no browser globals during render or SSR-only branches.

CSS is loaded by the existing component stylesheet import and framework styles index; no new export or style-index entries are required.

## Regression tests

```sh
bun test packages/components/src/atomic/QuantityStepper/__tests__/quantity.test.ts packages/components/src/atomic/QuantityStepper/__tests__/QuantityStepper.dom.test.tsx
```

DOM tests use `bun:test`, Happy DOM, and React `act`, exercising the actual component rather than a mock. They cover legacy value-button focus across collapse/expansion, horizontal and vertical, and guard the shared sizing, focus-visible, and enabled-only hover CSS. Happy DOM does not measure layout; browser regressions (`tests/quantity-cart/run.ts`) verify equal collapsed/expanded block size, the collapsed square, fullWidth, enlarged text, and target sizes across mobile/tablet/desktop.
