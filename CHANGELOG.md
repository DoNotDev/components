# @donotdev/components

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
