# DCII Components

Accessible, themeable web component library. Zero dependencies, framework-agnostic, WCAG 2.2 AA compliant.

## Components

| Component | Tag | Description |
|---|---|---|
| Accordion | `<dcii-accordion>` | Expandable FAQ / collapsible sections |
| Modal | `<dcii-modal>` | Dialog with focus trap and backdrop |
| Tabs | `<dcii-tabs>` | Tabbed content panels |
| Image Slider | `<dcii-image-slider>` | Carousel with autoplay, dots, arrows |
| Card Slider | `<dcii-card-slider>` | Horizontal card carousel |
| Lightbox | `<dcii-lightbox>` | Gallery grid with fullscreen viewer |

## Quick Start

```html
<script type="module" src="dcii-components/src/index.js"></script>
```

All `<dcii-*>` custom elements register automatically on import.

## Usage

### Accordion

```html
<dcii-accordion>
  <dcii-accordion-item>
    <span slot="header">Question text</span>
    <p>Answer content</p>
  </dcii-accordion-item>
</dcii-accordion>
```

| Attribute | Element | Description |
|---|---|---|
| `multiple` | `<dcii-accordion>` | Allow multiple items open simultaneously |
| `open` | `<dcii-accordion-item>` | Default open state |

### Modal

```html
<dcii-modal>
  <span slot="trigger">Open</span>
  <span slot="title">Modal Heading</span>
  <p>Body content</p>
  <button slot="footer">Action</button>
</dcii-modal>
```

| Attribute | Description |
|---|---|
| `trigger-text` | Fallback trigger button label (if no `slot="trigger"`) |
| `open` | Reflects open state — set to open/close programmatically |
| `no-backdrop` | Disable backdrop click-to-close |

### Tabs

```html
<dcii-tabs>
  <dcii-tab label="Tab One">Panel content</dcii-tab>
  <dcii-tab label="Tab Two">Panel content</dcii-tab>
</dcii-tabs>
```

### Image Slider

```html
<dcii-image-slider autoplay interval="5000">
  <img src="photo1.jpg" alt="Description">
  <img src="photo2.jpg" alt="Description">
</dcii-image-slider>
```

| Attribute | Description |
|---|---|
| `autoplay` | Enable auto-advance |
| `interval` | Milliseconds between slides (default `5000`) |
| `no-loop` | Disable wrapping at ends |

### Card Slider

```html
<dcii-card-slider>
  <div>Card 1 content</div>
  <div>Card 2 content</div>
</dcii-card-slider>
```

### Lightbox

```html
<dcii-lightbox columns="3">
  <img src="photo1.jpg" alt="Description">
  <img src="photo2.jpg" alt="Description">
</dcii-lightbox>
```

Use `data-full` on images to specify a separate full-resolution source:

```html
<img src="thumb.jpg" data-full="full-res.jpg" alt="Description">
```

## Theming

Every component exposes CSS custom properties. Override them on `:root` for global theming or on individual elements for scoped overrides.

### Global Tokens

```css
:root {
  --dcii-font-family: system-ui, sans-serif;
}
```

### Component Tokens (examples)

```css
:root {
  /* Accordion */
  --dcii-accordion-bg: #fff;
  --dcii-accordion-border: #d4d4d4;
  --dcii-accordion-radius: 8px;
  --dcii-accordion-padding: 1.25rem;
  --dcii-accordion-hover-bg: #f5f5f5;
  --dcii-accordion-focus-ring: 2px solid #005fcc;

  /* Modal */
  --dcii-modal-backdrop: rgba(0, 0, 0, 0.5);
  --dcii-modal-bg: #fff;
  --dcii-modal-radius: 8px;
  --dcii-modal-trigger-bg: #d6a64c;
  --dcii-modal-trigger-color: #fff;

  /* Tabs */
  --dcii-tabs-tab-bg-active: #fff;
  --dcii-tabs-panel-bg: #fff;
  --dcii-tabs-border: #b8b8b8;

  /* Image Slider */
  --dcii-slider-height: 60vh;
  --dcii-slider-bg: #333;
  --dcii-slider-arrow-bg: rgba(0, 0, 0, 0.4);
  --dcii-slider-dot-color-active: #fff;

  /* Card Slider */
  --dcii-card-slider-card-width: 350px;
  --dcii-card-slider-card-bg: #fff;
  --dcii-card-slider-gap: 1.5rem;

  /* Lightbox */
  --dcii-lightbox-overlay-bg: rgba(0, 0, 0, 0.85);
  --dcii-lightbox-thumb-height: 300px;
  --dcii-lightbox-strip-border-active: #fff;
}
```

See each component's source file for the full list of tokens.

## Accessibility

Every component includes:

- **Keyboard navigation** — Arrow keys, Enter/Space, Escape, Home/End, Tab
- **ARIA attributes** — roles, aria-expanded, aria-selected, aria-controls, aria-labelledby, aria-live
- **Focus management** — Focus traps in modal/lightbox, focus restoration on close
- **Screen reader announcements** — Live regions for slide changes
- **`prefers-reduced-motion`** — All animations/transitions respect the user's motion preference

## CSS Convention

All internal class names follow **BEM** (Block Element Modifier):

```
.accordion-item__header
.accordion-item__content
.slider__arrow--prev
.lightbox__strip-thumb--active
```

## Events

| Event | Component | Detail |
|---|---|---|
| `dcii-accordion-toggle` | Accordion Item | `{ item, open }` |
| `dcii-modal-open` | Modal | — |
| `dcii-modal-close` | Modal | — |
| `dcii-tab-change` | Tabs | `{ index, label }` |
| `dcii-slide-change` | Image Slider | `{ index, total }` |

## Browser Support

All modern browsers with Custom Elements v1 support (Chrome, Firefox, Safari, Edge).

## Development

```bash
cd dcii-component-library
npx serve .
```

Open `http://localhost:3000/demo/` to see all components in action.

## License

MIT
