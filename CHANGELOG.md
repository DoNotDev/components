# @donotdev/components

## Unreleased

### Minor Changes

- NavigationMenu: item field `active` (`NavigationMenuItem`) marks the current page: its link gets `aria-current="page"` and `data-active="true"`, with an accent background. Sub-menu lists no longer show bullets (`base.css` gives every `ul` `list-style: disc` and only the top-level list reset it).
- `--floating-background` theme token: a theme sets it (e.g. `var(--popover)`) to flatten every floating surface (Popover, DropdownMenu, NavigationMenu, ...). Unset keeps the glow gradient. `.dndev-floating` always painted the gradient; only `data-glow=blank` components (Select, Combobox, Code) could go flat. Documented in core `THEMES.md`.
- Calendar loads on demand outside DatePicker too: new exports `LazyCalendar` (`errorLabel` required, shown if the chunk cannot load), `preloadCalendar` (call on trigger pointer-enter / focus) and `useIdlePreloadCalendar()` (preload when the browser is idle), plus the type `LazyCalendarProps`.

### Patch Changes

- Marquee keeps its item type: the exported component is generic (`Marquee<T>`, like `Carousel`), so `renderItem` receives the type of `items`. The lazy-loading wrapper typed its props from `React.lazy`, which erases the generic, and consumers cast `unknown`.
- Text: an explicit `level` on a heading tag (`<Text as="h2" level="body">`) always emits `data-level`, so it beats the `base.css` heading size (it emitted none and kept the h2 size). The implicit `body` default still omits it: plain `Text` DOM is unchanged.
- Slider: `aria-label` / `aria-labelledby` are applied to the thumb (the `role="slider"` element) so the slider has an accessible name; previously they landed on the root span.
- Accordion: `titleAs` (`'h2'`-`'h6'`, default `'h3'`) sets the heading level wrapping each trigger. Default unchanged.
- Combobox: `multiple` without `chips` shows the selection (one value's label, `selectedLabel` for several; was empty with the placeholder). `clearLabel` labels the clear button (default 'Clear').
- Tag: `removeLabel` labels the remove button (default 'Remove').

## 0.1.46

### Patch Changes

- Card: `coverFit` ('cover' | 'contain', contain insets the image 8% from the frame), `coverAlt`, `coverHover` (second image crossfaded on hover / focus-within, reduced-motion aware) and `coverEager` (eager load + high fetch priority for above-the-fold covers). Defaults unchanged.
- ImageGallery: `fit` prop and per-image `ImageData.fit` override (e.g. contain for a cut-out packshot, cover for photography). New exported type `ImageFit`. Default unchanged ('cover').
- Text: headings read the optional `--line-height-heading` theme token (falls back to `--line-height`, so unchanged unless a theme sets it).
- HeroSection: `backgroundPosition` (focal point when the image crops) and `scrim` ('full' default | 'soft' bottom-only gradient).
- HeroSection: props type `HeroSectionOwnProps` exported and component JSDoc added, so MCP `lookup_symbol` describes its props.
- Own-props types exported for the other polymorphic components (`BadgeOwnProps`, `CallToActionOwnProps`, `GridOwnProps`, `GridAreaOwnProps`, `SectionOwnProps`, `StackOwnProps`, `TextOwnProps`), plus `BadgeProps`, so MCP `lookup_symbol` describes their props.
- HeroSection fix: a consumer `style` prop no longer drops the background image; background URLs are quoted so spaces / parentheses stay valid CSS.

## 0.1.44

### Patch Changes

- a4c57d7: bugfixes and performance upgrades
- 2b8210a: Export `SelectPortalPrimitive` from Select primitives, enabling consumers to portal dropdown content out of stacking contexts
