# Component API Reference

**SOURCE OF TRUTH. If prop not listed here, it does not exist.**

---

## Button
```tsx
<Button>Label</Button>
<Button variant="primary">Label</Button>
<Button onClick={fn}>Label</Button>
```
| Prop | Type | Default |
|------|------|---------|
| variant | `'default'` \| `'primary'` \| `'secondary'` \| `'accent'` \| `'destructive'` \| `'ghost'` \| `'outline'` \| `'link'` | `'default'` |
| icon | `LucideIcon` \| `ReactNode` | - |
| iconEnd | `boolean` | `false` |
| display | `'auto'` \| `'compact'` \| `'full'` | `'auto'` |
| tooltip | `string` | - |
| fullWidth | `boolean` | `false` |
| loading | `boolean` | `false` |
| loadingText | `string` | - |
| progress | `number` (0-100) | - |
| disabled | `boolean` | `false` |
| render | `(props) => ReactNode` | - |

**NO: size, tone, gap**

---

## Text
```tsx
<Text>Content</Text>
<Text level="h1">Heading</Text>
<Text as="p">Paragraph</Text>
```
| Prop | Type | Default |
|------|------|---------|
| as | `'h1'`-`'h6'` \| `'p'` \| `'span'` \| `'div'` \| `'li'` \| `'label'` \| `'code'` | `'div'` |
| level | `'h1'`-`'h6'` \| `'body'` \| `'small'` \| `'caption'` | auto from `as` |
| variant | `'default'` \| `'muted'` \| `'primary'` \| `'secondary'` \| `'accent'` \| `'success'` \| `'warning'` \| `'destructive'` \| `'code'` | `'default'` |
| align | `'start'` \| `'center'` \| `'end'` | `'start'` |
| weight | `'normal'` \| `'medium'` \| `'semibold'` \| `'bold'` | - |
| underline | `boolean` | `false` |
| lines | `number` (positive integer) | - |

**NO: size, tone, color**

---

## Stack
```tsx
<Stack>children</Stack>
<Stack direction="row">children</Stack>
```
| Prop | Type | Default |
|------|------|---------|
| as | `ElementType` | `'div'` |
| direction | `'row'` \| `'column'` \| `'row-reverse'` \| `'column-reverse'` | `'column'` |
| align | `'start'` \| `'center'` \| `'end'` \| `'stretch'` \| `'baseline'` | `'stretch'` |
| justify | `'start'` \| `'center'` \| `'end'` \| `'between'` \| `'around'` \| `'evenly'` | `'start'` |
| gap | `'none'` \| `'tight'` \| `'medium'` \| `'large'` | `'medium'` |
| wrap | `'nowrap'` \| `'wrap'` \| `'wrap-reverse'` | `'nowrap'` |
| width | `'full'` \| `'fit'` \| `'auto'` | `'full'` |
| centered | `boolean` | `false` |

**NO: spacing, size**

---

## Card
```tsx
<Card>children</Card>
<Card title="Title">children</Card>
<Card onClick={fn}>children</Card>
```
Card title is a `div` unless `titleAs` (`'h2'`-`'h6'`) makes it a real heading (visual size unchanged); pass a plain string as `title`, not your own heading. Section title is an `h2` by default; use `titleAs` for nested sections.
`onClick` card: `role="button"`, focusable, Enter/Space activate (keep other interactive controls out; use `href` for navigation).
`href` card: a real `<a href>` through the app's router link (`@donotdev/ui` `Link`): `next/link` with route prefetch on Next.js, react-router on Vite.
| Prop | Type | Default |
|------|------|---------|
| variant | `'default'` \| `'muted'` \| `'primary'` \| `'secondary'` \| `'accent'` | `'default'` |
| title | `string` \| `ReactNode` | - |
| subtitle | `string` \| `ReactNode` | - |
| titleAs | `'div'` \| `'h2'`-`'h6'` | `'div'` |
| icon | `LucideIcon` | - |
| content | `string` \| `string[]` \| `ReactNode` | - |
| footer | `ReactNode` | - |
| onClick | `() => void` | - |
| clickable | `boolean` | auto from onClick |
| elevated | `boolean` | `false` |
| asChild | `boolean` | `false` |

**NO: size, padding, margin**

---

## Grid
```tsx
<Grid>children</Grid>
<Grid cols={3}>children</Grid>
<Grid cols={[1, 1, 2, 3]}>children</Grid>
```
| Prop | Type | Default |
|------|------|---------|
| as | `ElementType` | `'div'` |
| cols | `number` \| `[mobile, tablet, laptop, desktop]` | `1` |
| gap | `'none'` \| `'tight'` \| `'medium'` \| `'large'` | `'medium'` |
| align | `'start'` \| `'center'` \| `'end'` \| `'stretch'` | `'stretch'` |
| justify | `'start'` \| `'center'` \| `'end'` \| `'stretch'` | `'stretch'` |

**NO: spacing, columns (use cols)**

---

## Section
```tsx
<Section title="Title">children</Section>
```
| Prop | Type | Default |
|------|------|---------|
| as | `'section'` \| `'article'` \| `'aside'` \| `'div'` \| `'main'` | `'section'` |
| title | `string` | - |
| titleAs | `'h2'` \| `'h3'` \| `'h4'` \| `'h5'` \| `'h6'` | `'h2'` |
| actions | `ReactNode` | - |
| separator | `boolean` | `false` |
| tone | `'base'` \| `'muted'` \| `'elevated'` \| `'contrast'` \| `'accent'` | `'base'` |
| align | `'start'` \| `'center'` \| `'end'` | `'center'` |
| gridCols | `number` \| `[mobile, tablet, laptop, desktop]` | - |
| gridGap | `'none'` \| `'tight'` \| `'medium'` \| `'large'` | `'medium'` |
| collapsible | `boolean` | `false` |
| defaultOpen | `boolean` | `false` |

**NO: padding, margin, background**

---

## Accordion
```tsx
<Accordion items={[{ value: 'a', trigger: 'Question', content: 'Answer' }]} titleAs="h4" />
```
| Prop | Type | Default |
|------|------|---------|
| items | `{ value, trigger, content }[]` | required |
| type | `'single'` \| `'multiple'` | `'single'` |
| collapsible | `boolean` | `false` |
| titleAs | `'h2'` \| `'h3'` \| `'h4'` \| `'h5'` \| `'h6'` | `'h3'` |
| gridCols | `GridCols` (as `Section`) | - (one column) |

Each trigger sits in a heading of level `titleAs`; pick the level that keeps the page outline sequential. `gridCols={[1, 1, 2, 2]}` lays the items in a grid (1 column mobile/tablet, 2 laptop/desktop), cells aligned to the start.

---

## Slider
```tsx
<Slider defaultValue={[50]} max={100} aria-label="Volume" />
```
| Prop | Type | Default |
|------|------|---------|
| aria-label | `string` | - |
| aria-labelledby | `string` | - |
| variant | `'default'` \| `'primary'` \| `'secondary'` \| `'accent'` \| `'success'` \| `'warning'` \| `'destructive'` \| `'muted'` | `'default'` |
| showValue | `boolean` | `false` |

Give every Slider an accessible name (`aria-label` or `aria-labelledby`): it is applied to the thumb (`role="slider"`), not the root.

---

## Badge
```tsx
<Badge>Label</Badge>
<Badge variant="primary">Label</Badge>
```
| Prop | Type | Default |
|------|------|---------|
| as | `'div'` \| `'span'` \| `'mark'` | `'div'` |
| variant | `'default'` \| `'muted'` \| `'primary'` \| `'secondary'` \| `'accent'` \| `'success'` \| `'warning'` \| `'destructive'` \| `'outline'` | `'default'` |
| tooltip | `string` | - |

**NO: size, color**

---

## Spinner
```tsx
<Spinner />
<Spinner overlay />
```
| Prop | Type | Default |
|------|------|---------|
| overlay | `boolean` | `false` |
| variant | `'default'` \| `'primary'` \| `'secondary'` \| `'accent'` \| `'success'` \| `'warning'` \| `'destructive'` | `'primary'` |

**NO: size**

---

## Separator
```tsx
<Separator />
```
| Prop | Type | Default |
|------|------|---------|
| orientation | `'horizontal'` \| `'vertical'` | `'horizontal'` |
| variant | `'default'` \| `'muted'` \| `'accent'` | `'default'` |

---

## EntityFormRenderer
```tsx
<EntityFormRenderer entity={entity} operation="create" onSubmit={fn} />
```
| Prop | Type | Default |
|------|------|---------|
| entity | `Entity` | required |
| operation | `'create'` \| `'edit'` | `'create'` |
| onSubmit | `(data) => void` (data = the fields the form writes) | - (default writer: record + joined child rows) |
| defaultValues | `Record<string, unknown>` (edit: the stored row as read) | - |
| loading | `boolean` | `false` |
| submitText | `string` | - |
| cancelText | `string` | - |
| onCancel | `() => void` | - |
| viewerRole | `string` | `'guest'` |

**NO: fields (renders all editable fields automatically)**

---

## BEFORE WRITING JSX

1. Check this file
2. If prop not listed - don't use it
3. When in doubt - use defaults only
