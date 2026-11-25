# Atomic Components Reference

**Check JSDoc in your IDE** - Hover over any component import to see props, types, and examples.

**Import from:** `@donotdev/components` (atomic UI)

**This is your GOTO Semantic React package**

---

## Layout Components

These are the only ways one should handle layout to get to quick results functionality wide.
- **Section** - Layout section with title, grid, tone system, and `bleed` prop for full-page-width content (images, maps, galleries; `100cqi`: the layout `<main>` content box, scrollbar gutter excluded). `collapsible`: the title heading wraps a `<button>` trigger (Tab, Enter, Space, `aria-expanded`); closed content stays in the server HTML, hidden with `display: none`; opening fades in. A Section nested in another Section's content is flush (no own padding, max-width or auto margins; a non-`ghost` `tone` keeps its padding). Consecutive Sections share one gap: a `ghost` Section directly after a `ghost` Section has no top padding (one `--gap-lg`, not two); a toned Section keeps its padding on both sides.
- **Grid** - CSS Grid layout primitive with responsive column control.
- **Stack** - Flexbox layout for arranging items in rows or columns.
- **PageTitle** - The page's title block: `title` rendered as the page's one `<h1>` (theme h1 size, start edge), optional `meta` (string = muted line, node = as is), `contentWidth` as `Section` (match the page's content Sections). Own `Section`, placed first in `PageContainer`, before the content Sections. One per page; a page laid out around its title (hero, product) keeps its own h1. `Section` `title` (h2-h6 label) and `HeroSection` `title` (not a heading) never give a page its h1.
- **HeroSection** - Hero banner with title (a div styled at h1 level, not an h1 element: the page provides its own h1 if it needs one), subtitle, gradient backgrounds, `bleed` for full-width, and `backgroundImage` for cover images with overlay.
- **CallToAction** - Conversion-focused section with actions, `bleed` for full-width, and `backgroundImage` for cover images with overlay.

---

## Content Components

- **Card** - Premium card component with title, content, footer, and elevation variants.
  - **Navigation with middle-click support:** Wrap Card in Link component for navigation that supports middle-click (opens in new tab). See navigation section below.
- **DualCard** - Side-by-side card layout for comparison or feature showcases.
- **Text** - Typography component with semantic text variants. `<Text as="h2" level="body">` keeps the h2 element but renders as body text: body size and body font, no heading case or tracking (an explicit `level` always emits `data-level`; same for `small` / `caption`). `as="s"` renders a struck-through `<s>` (a former price beside the new one; no inline style).
- **Blockquote** - Styled blockquote for citations and testimonials.
- **List** - Bullet points, numbered lists, and feature lists with zero CSS. Use `icon` prop for custom icons, `icon={null}` for plain bullets. `ordered` numbers the items (`1.`, a CSS counter: items are flex rows, which have no native marker). Icon-less items of an unordered list draw their own bullet (`•`) for the same reason; items with an icon keep the icon.
- **DescriptionList** - Key-value pairs and metadata using semantic HTML (dl, dt, dd).
- **Separator** - Visual separator with semantic styling variants.

---

## Action Components

- **Button** - Accessible button with variants, icons, tooltips, and render prop composition. `badge` puts a count bubble on the icon's corner (decorative: put the count in `aria-label`); it pops when its numeric value increases after mount (never on first render / hydration, a decrease, or under reduced motion). While a `flyTo` flight heads to the button, an increase waits: the previous count stays shown until the image lands, then the latest count shows and pops (a cancelled flight: shown, no pop).
- **ActionButton** - Button with async action handling and loading states.
- **Button `intent`** (`Button`, `ActionButton`) - `intent="save" | "publish" | "unpublish" | "delete" | "preview" | "reload" | "add" | "edit" | "cancel"` (`BUTTON_INTENT`) sets the action's icon, and `delete` the destructive variant; an explicit `icon` or `variant` wins. With the default `display` (auto), phones show the icon only. Equal-width action bar: a `Grid` with one column per button and `fullWidth` buttons.
- **FileButton** - Button that triggers file input selection.
- **ButtonGroup** - Visual grouping of buttons with joined borders. Supports horizontal/vertical orientation, variant propagation, and items-based API.
- **SwipeAction** - Touch swipe-to-reveal trailing destructive action; only explicit action-button activation invokes `onAction`. Exported with `SwipeActionProps` from `@donotdev/components`. Supply a translated `actionLabel`. See [SwipeAction](./SWIPE_ACTION.md).
- **ActionBar** - Page action bar fixed to the bottom of the viewport (e.g. price + add to cart on a phone product page); the app composes the content (`Stack`, `Text`, `Button`, `QuantityStepper`). `hideFrom="tablet" | "laptop" | "desktop"` (`ActionBarBreakpoint`) hides it from that breakpoint up (CSS). `revealAfter={ref}` shows it only while that element has scrolled up out of view (hidden while visible or not reached yet); without it, always shown. Portalled to `<body>`, `--z-header`. While shown it sets its measured height as `--action-bar-height` on `<html>` (absent while hidden, on the server and under `hideFrom`); DnDevLayout pads its bottom with it, so the end of the page and the footer scroll above the bar (a custom scroll container outside DnDevLayout: `padding-block-end: var(--action-bar-height, 0px)`). One shown bar per page. Bottom safe area padded when the app sets `viewport-fit=cover`. Hidden = slid out, `visibility: hidden` + `inert` + `aria-hidden`; no slide under reduced motion. Renders nothing on the server (no hydration mismatch). Not a landmark unless you pass `role="region"` and a translated `aria-label`.
- **Floating** - Container for one small control that stays on screen while the page scrolls (a back link, a help button); the app composes the control (`Button`, `Link`). `placement="top-start" | "top-end" | "bottom-start" | "bottom-end"` (`FloatingPlacement`, default `top-start`); no other prop. As wide as its control, `--z-header` (below sheets, modals, toasts), logical (RTL-aware). **Top**: in the page flow, `position: sticky`, rendered in the server HTML (no hydration shift); put it first in the page (first child of `PageContainer`, before the first `Section`). At rest `--gap-md` above (below the header) and `--gap-md` below; a ghost `Section` right after it drops its own top padding, so both gaps are `--gap-md` at every width. Sticks `--gap-md` below the top of the layout `<main>` (the scroll container, under the header). Inline: the Section content edge (`--section-gutter`: `--gap-md`, `--gap-lg` from 1024px). **Bottom**: fixed, portalled to `<body>`, takes no space (leave room at the page end); `--gap-md` above a shown ActionBar (`--action-bar-height`) or the bottom safe area; inline: the Section gutter after the sidebar on the start side (`--sidebar-width`), outside the side safe areas; renders nothing on the server, mounts after hydration (fixed: no shift). Its gutter reads the `<html>` spacing tokens: a theme that overrides `--gap-*` only on `[data-density]` elements does not reach a bottom Floating (declare them on `:root` too).

---

## Form Components

- **Input** - Accessible input with mobile-friendly touch targets and key state styling.
- **QuantityStepper** - Controlled lot-aware quantity editor via `onChange`, or legacy increment/decrement callbacks. Supports zero, collapsed presentation, and vertical orientation. `flyFrom` + `flyTo` (+ `flyEveryAdd`) fly an image to the cart on a committed add, before `onChange`; a returned rejected promise cancels the flight. Editable mode requires safe-integer lot bounds and a valid controlled quantity; reconcile invalid persisted quantities before enabling it. See [QuantityStepper](./QUANTITY_STEPPER.md).
- **PasswordInput** - Password field with show/hide toggle functionality. `revealAriaLabel={{ show, hide }}` names the toggle (pass translated strings; framework keys `auth:passwordToggle.show` / `.hide`; default English).
- **Textarea** - Multi-line text input component.
- **Label** - Accessible label with icon support and various positions.
- **Field help (`info`)** - Opt-in: `info="…"` on `Input`, `PasswordInput`, `Select`, `Combobox`, `DatePicker`, `DateTimePicker`, `RangeInput`, `PinInput` or `FloatingLabel` (needs `label`) adds an (i) after the label; hover or keyboard focus shows the text, a tap pins it on touch screens. Without `info`, nothing is rendered. For a label you render yourself, place `<FieldInfo text="…" />` next to it.
- **FieldMessage** - The one message slot under a form control, used by every framework field (crud entity forms, auth email forms, ui `FormMessage` / `FormDescription`). `<FieldMessage id error? helperText? />`: the error (translated string) replaces the helper text in the same slot, with an icon (not colour alone); with neither it is mounted but visually hidden (no blank line, no gap), so a field with helper text never moves and one without gets the line only when an error appears. The slot holds a polite live region from the first render (WCAG ARIA19: the error is announced). Wire the control with `fieldMessageAria({ id, error, helperText, describedBy? })` → `aria-invalid` while in error, `aria-describedby` to the slot while it shows something (plus `describedBy`, e.g. a character count); `Input`, `Textarea`, `PasswordInput`, `Checkbox`, `Switch` spread it on their element, `Select` (trigger), `Combobox` (input) and `Slider` (thumbs) take `aria-invalid` / `aria-describedby` props for it. Never hand-render error text under a field.
- **Checkbox** - Accessible checkbox with custom styling.
- **RadioGroup** - Accessible radio group with multiple visual variants.
- **Select** - Accessible select dropdown with search and multi-select support.
- **Combobox** - Searchable combobox with autocomplete functionality. `multiple` without `chips` shows the selection: one value's label, `selectedLabel` (`{{count}}` = count, default `'{{count}} selected'`) for several. `clearLabel`: clear button label (default `'Clear'`).
- **Switch** - Toggle switch component.
- **Slider** - Range slider for numeric input.
- **ColorPicker** - Color selection with preset swatch grid, native color input, and ARIA radiogroup pattern. Built-in palettes: basic, material, pastel.

---

## Feedback Components

- **Alert** - Attention-grabbing alert with semantic variants and icons.
- **AlertDialog** - Modal dialog that interrupts with important content expecting a response.
- **Dialog** - Accessible modal dialog with custom content sizes and actions.
- **Toast** - Toast notifications via Toaster component with ToastProvider.
- **Skeleton** - Loading state skeleton with multiple animation variants.
- **Spinner** - Loading spinner with multiple sizes and theme-aware colors.
- **Progress** - Progress bar: `value` (0-100) for task completion; no `value` = indeterminate (unknown duration, sliding segment, RTL-aware, still under reduced motion).

---

## Navigation Components

- **Tabs** - Tabbed interface with props-based API and full keyboard navigation.
- **Accordion** - Vertically stacked headings that reveal content sections. Closed items stay in the server HTML (crawlable), hidden with `display: none` (not focusable or announced; their effects run while closed). Opening fades in (no height slide); collapsing is instant.
- **NavigationMenu** - Props-based navigation menu with nested menus and rich content. Item `active: true` marks the current page (`aria-current="page"` + `data-active="true"` on its link, accent background). Sub-menu lists have no bullets.
- **Pagination** - Accessible pagination with page number generation and ellipsis.
- **Command** - Command palette component for keyboard navigation and search.
- **CommandDialog** - Command palette dialog optimized for Cmd+K navigation.
- **TreeView** - Hierarchical tree component with WAI-ARIA TreeView pattern. Supports expand/collapse, single/multi selection, keyboard navigation, type-ahead search, and connector lines.

---

## Overlay Components

- **Popover** - Accessible popover displaying rich content in a portal.
- **Tooltip** - Tooltip component with positioning and delay controls.
- **HoverCard** - Card that appears on hover with rich content.
- **Sheet** - Slide-out panel for sidebars, mobile navigation, or editing panels. `closeLabel` names the close button (pass a translated string, framework key `dndev:sheet.close`; default `Close sheet`).
- **ContextMenu** - Right-click context menu with nested submenus.
- **DropdownMenu** - Professional dropdown menu with props-based API.

---

## Data Display Components

- **Table** - Accessible table component with sorting and selection.
- **DataTable** - High-level table with built-in sorting, filtering, search, and pagination. `editable` (+ `getRowId`, `pendingChanges`, `onPendingChange`) edits the columns that declare `edit: { type: 'text' | 'number' | 'select', options }` in place: checked rows take one value from the bulk bar, Excel blocks paste across cells, Enter / arrows move, Esc cancels, Ctrl+Z undoes. The table never saves; the consumer writes `pendingChanges`. `cellErrors={{ [rowId]: { [columnKey]: message } }}` (+ `getRowId`, translated messages) marks cells that break a rule, like a value that does not parse: `data-invalid`, editors `aria-invalid` + `aria-describedby` to the message shown under the value (read-only cells show the message too).
- **Card / ImageGallery images** - Pass the `{ fullUrl, thumbUrl }` pair (CRUD `Picture`) as `cover` / `coverHover` / `images`: phones (below 768px) download the thumbnail, larger screens the full image (`<picture>`, by viewport). For small tiles or multi-column grids pass `coverRenditions` (Card; `renditions` on `ResponsiveImg`; type `ImageRenditions` `{ thumbWidth, fullWidth, sizes }`): one `<img>` with `srcset="thumb {thumbWidth}w, full {fullWidth}w"` and `sizes`, so the browser picks by displayed size x pixel ratio. `thumbWidth` / `fullWidth` = the frame widths of the image field's upload config (`thumbWidth`, `maxWidth`): declared, not measured (an image uploaded under another config gets a slightly off pick, never a broken one; exact for `contain`, approximate for `cover` crops). `sizes` = displayed width per breakpoint (`'(min-width: 1024px) 20vw, 50vw'`). With `renditions`, read `img.currentSrc` (`currentRenditionUrl` describes the media mode only). The frame background is opt-in: `coverBackground` (Card: the cover region whatever the cover, image or ReactNode placeholder) / `background` (ImageGallery) take `'transparent'` (default, paints nothing) | `'muted'` | `'primary'` | `'secondary'` | `'accent'` (theme tokens); the reserved aspect-ratio space is unchanged.
- **ImageGallery** - Swipeable main image, one-row thumbnail strip (swipe / scroll when it overflows, the selected thumbnail kept in view), lightbox. Viewport-bounded with no prop: main image + thumbnail row never exceed `100svh - --header-height - 2 × --gap-lg` (`vh` where `svh` is unsupported); past that the gallery narrows and centres at its `aspectRatio` instead of growing taller. Place it in any column or `Section bleed`, no height wrapper. Accessible names and the image alt text translate themselves (`dndev:gallery.*`, via the `TranslatorProvider` that `@donotdev/ui` mounts); `label`, `thumbnailsLabel`, `previousLabel`, `nextLabel`, `viewImageLabel(index)` and `altPrefix` are optional overrides. Outside the framework providers the keys show (no English copy in components).
- **Avatar** - Accessible avatar with image and fallback support.
- **Badge** - Status indicator with semantic variants (polymorphic: div, span, mark).
- **Tag** - Tag component for labels and categories. `removeLabel`: remove button label (default `'Remove'`).
- **Calendar** - Accessible date picker built on react-day-picker. `DatePicker` and `DateTimePicker` load it on demand (browser idle after a picker mounts, or when the calendar trigger is pointed at, focused or opened), so a page with a date field does not ship it up front. If it cannot load, the popover shows `calendarErrorLabel` (pass a translated string; crud fields pass `t('date.calendarLoadError')`). Pickers outside DatePicker use `LazyCalendar` (`errorLabel` required) with `preloadCalendar` on trigger pointer-enter / focus and `useIdlePreloadCalendar()`; crud `DateFilter` does, so it no longer ships react-day-picker up front.

---

## Utility Components

- **Collapsible** - Collapsible content component. Closed content stays in the server HTML (crawlable), hidden with `display: none` (not focusable or announced; its effects run while closed). Opening fades in (no height slide); collapsing is instant. `CollapsibleContent` always sets `dndev-collapsible-content` and `forceMount`.
- **Toggle** - Toggle button component.
- **ToggleGroup** - Group of toggle buttons.
- **ScrollArea** - Scrollable area with custom scrollbars.
- **Portal** - Portal component for rendering outside DOM hierarchy.
- **VisuallyHidden** - Screen reader-only content component.
- **Slot** - Slot component for composition patterns.
- **flyTo / flyTarget** - Fly-to-cart feedback. `ref={flyTarget('cart')}` registers a target (stable callback ref, any element; several per name, the first on screen wins); `flyTo(sourceElement, 'cart')`, called from an interaction, flies a fixed clone of the source (an `<img>` flies its displayed rendition) onto it, transform / opacity only, removed on finish. A source scrolled off screen flies from the nearest screen edge. No-op under reduced motion, when the source is missing or unrendered, or when the target is missing or off-screen. A Button `badge` inside the target holds its update until the image lands, then pops. QuantityStepper flies for you (`flyFrom` / `flyTo`). Image sources: Card `coverRef`, ImageGallery `imageRef` (image in view), ResponsiveImg `ref`.
- **SkipLink** - Accessibility skip-to-content links, visible only on keyboard focus. Supports multiple targets with smooth scroll and focus management.

---

## Advanced Components

- **InfiniteScroll** - Infinite scroll component with load more functionality.
- **Stepper** - Step-by-step workflow component with navigation controls.
- **Step change animation** - `dndev-animate-step-forward` / `dndev-animate-step-back` on the entering step of a one-step-at-a-time flow: fade + 1.5rem slide from the end side (forward) or the start side (back), mirrored in RTL, `--dur-normal` / `--ease-in-out`, no transform left once it ends; reduced motion: no slide. A step hidden and shown again (`hidden`) replays it. Used by the auth `EmailSignUpFlow`.
- **CopyToClipboard** - Copy to clipboard with visual feedback.
- **VideoPlayer** - Video player component with controls.
- **FeatureFallback** - Fallback UI when features are unavailable.

---

## Icons

- **Icons** - Icon components from lucide-react and custom partner icons.

---

## Navigation with Card Component

**For clickable cards with navigation support (including middle-click):**

Wrap Card in Link component from `@donotdev/ui`:

```tsx
import { Card } from '@donotdev/components';
import { Link } from '@donotdev/ui';

// Card with navigation (supports middle-click)
<Link
  path="/about"
  style={{ display: 'block', textDecoration: 'none', height: '100%' }}
  aria-label="Learn more about About"
>
  <Card
    title="About"
    subtitle="Learn more about us"
    content="Click to navigate"
  />
</Link>

// Card with onClick only (no middle-click support).
// Renders role="button", focusable; Enter/Space activate. Use href for navigation cards.
<Card
  title="Action Card"
  onClick={() => handleAction()}
/>
```

**Why wrap in Link?**
- Card component is standalone and not routing-aware
- Link wrapper provides framework navigation (SPA routing, keeps outlet context)
- Native browser middle-click support (opens in new tab)
- CSR/SSR safe

**Alternative:** Use FeatureCard from `@donotdev/ui` which handles this automatically when `href` prop is provided.

---

**All props documented in JSDoc** - Hover in IDE for complete reference.
