# @donotdev/components

Core **easy-to-use components** components built on radix-ui primites and our robust css styling system.

## Getting Started

### Interactive Showcase

Explore all components, their props, and see them in action in our interactive demo application:
[**Launch Demo Application**](https://donotdev.com/showcase/components)

### Installation

```bash
bun add @donotdev/components
```

## Usage Examples

### Button (Template Component)

```tsx
import { Button } from '@donotdev/components';

// Simple usage
<Button variant="primary">Click me</Button>

// With icon and tooltip
<Button
  variant="outline"
  icon={Icon}
  tooltip="Help text"
>
  Action
</Button>
```

### Tooltip (Template Component)

```tsx
import { Tooltip } from '@donotdev/components';

// Simple usage - props-based, no nesting
<Tooltip content="Help text" side="top">
  <button>Hover me</button>
</Tooltip>;
```

### Popover

```tsx
import { Popover } from '@donotdev/components';

// Props-based API
<Popover trigger={<Button>Open</Button>} side="bottom">
  <div>Popover content</div>
</Popover>;
```

### Dialog

```tsx
import { Dialog } from '@donotdev/components';

// Props-based API
<Dialog
  trigger={<Button>Open Dialog</Button>}
  title="Confirm Action"
  description="Are you sure?"
  actions={{
    cancel: { label: 'Cancel' },
    confirm: { label: 'Confirm', onClick: handleConfirm },
  }}
>
  <form>...</form>
</Dialog>;
```

## Compatibility Notice

`@donotdev/components` is the foundational UI layer of the DoNotDev Framework. The following framework packages depend on the component prop contracts defined here:

- `@donotdev/ui` - Layout and navigation components
- `@donotdev/features/*` - Auth, billing, CRUD, OAuth features
- `@donotdev/expo` - React Native bridge

**If you fork this package**, you are free to customize styling, add variants, and extend components. However, **do not remove or rename existing props, change type signatures, or alter component export names** - doing so will break the framework packages that depend on them.

Modifications that break component contracts are not covered by DoNotDev support. When in doubt, extend rather than modify.

## Key Features

- **Radix UI Primitives**: Accessible, headless components in `./src/base/`
- **Props-Based Components**: Simple, easy-to-use components in `./src/`
- **Pure CSS Styling**: Highly customizable via CSS variables, no utility classes in JSX
- **Type-Safe**: Full TypeScript support with comprehensive types
- **CSS Tokens Only**: All styling based on `dndev-*` CSS classes
- **Full Theming Support**: Dynamic light/dark mode and custom themes
- **ARIA & RTL Compliance**: Built for accessibility and internationalization
- **JSDoc**: Comprehensive inline documentation
