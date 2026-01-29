# CLAUDE.md - AI Assistant Guide for Duforn Portfolio

## Project Overview

High-performance interactive portfolio built as a static multi-page app with SPA-like transitions. Features immersive WebGL backgrounds, smooth animations, and custom UI components.

**Project Name:** naman-pratulya
**Type:** Creative Portfolio / Multi-page Application

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Vite | ^7.1.5 | Build tool (multi-page config) |
| Barba.js | ^2.10.3 | SPA-style page transitions |
| Three.js | ^0.180.0 | WebGL backgrounds + postprocessing |
| GSAP | ^3.13.0 | Animations + ScrollTrigger + Draggable |
| Lenis | ^1.3.11 | Smooth scrolling |
| html2canvas | ^1.4.1 | Page capture for transitions |
| split-type | ^0.3.4 | Text splitting for animations |
| postprocessing | ^6.38.2 | Three.js post-processing effects |

## Commands

```bash
npm run dev       # Dev server (localhost:5173)
npm run host      # Dev server on LAN
npm run build     # Production build to dist/
npm run preview   # Preview production build
```

## Directory Structure

```
duforn/
├── index.html              # Home page
├── work.html               # Work showcase page
├── archive.html            # Archive page
├── film.html               # Film showcase page
├── contact.html            # Contact page
├── styles.css              # Global styles + utility classes
├── vite.config.js          # Vite multi-page configuration
├── package.json
│
├── scripts/                # JavaScript modules
│   ├── barba.js            # Page routing & lifecycle (MAIN ENTRY)
│   ├── three.js            # WebGL background (home/contact)
│   ├── transition.js       # Page transition shader effects
│   ├── work.js             # Work page slider + thumbnail wheel
│   ├── archive-scene.js    # Archive 3D scene
│   ├── index.js            # Home page features
│   ├── middle-carousel.js  # WebGL image carousel
│   ├── lenis-scroll.js     # Smooth scroll setup
│   ├── text-reveal.js      # SplitText animations
│   ├── menu.js             # Navigation menu
│   ├── variable-font.js    # Font weight hover effects
│   ├── link-hover.js       # Link interaction effects
│   ├── btn-hover.js        # Button hover effects
│   └── preloader.js        # Asset preloading
│
├── data/
│   └── work-items.js       # Project data for work page
│
├── public/                 # Static assets (served at root)
│   ├── home/               # 3D models, textures
│   │   └── scene.glb       # Main 3D scene
│   ├── work/               # Work page images
│   ├── canvas/             # Canvas assets
│   ├── middle-carousel/    # Carousel images
│   └── *.woff2, *.ttf      # Fonts
│
├── dist/                   # Production build output
│
└── SlideshowAnimations-main/  # Reference animation demos (not main app)
```

## Architecture

### Pages & Entry Points

Each page is a separate HTML entry in `vite.config.js`:

| File | Namespace | Features |
|------|-----------|----------|
| `index.html` | `home` | Hero section, WebGL background, WebGL carousel |
| `work.html` | `work` | Infinite slider, thumbnail wheel with Draggable |
| `archive.html` | `archive` | 3D archive visualization |
| `film.html` | `film` | Film showcase |
| `contact.html` | `contact` | Contact info, WebGL background |

### Page Container Structure

Every page **MUST** follow this structure for Barba.js:

```html
<body data-barba="wrapper" class="page-wrap">
  <!-- Transition overlay -->
  <div class="transition">
    <div class="transition-overlay"></div>
  </div>

  <!-- Navigation (shared across pages) -->
  <nav class="nav-wrap u-position-fixed">...</nav>

  <!-- WebGL background container -->
  <div id="background"></div>

  <!-- Page content -->
  <main data-barba="container" data-barba-namespace="home">
    <!-- Page-specific content -->
  </main>

  <script type="module" src="/scripts/barba.js"></script>
</body>
```

### Barba.js Lifecycle

```
Initial Load → once() → revealTransition() → initPageFeatures()
Navigation   → leave() → animateTransition() → enter() → after() → initPageFeatures()
```

**Key file:** `scripts/barba.js:78-217`

### initPageFeatures(namespace)

Called on every page load/transition (see `scripts/barba.js:42-76`):

1. `initTime()` — Clock display
2. `initMenu()` — Navigation
3. `initVariableFont()` — Font hover effects
4. `initScrollTextReveals()` — Text animations
5. `initLinkHover()` — Link effects
6. `initBtnHover()` — Button effects
7. Namespace-specific: `webgl()`, `initWork()`, `initArchiveScene()`, `initIndex()`

## Module Pattern

### Standard Structure

Every module **MUST** follow this pattern:

```javascript
// State variables at module level
let rafId = null;
let resizeHandler = null;
const elements = {};

export function initModule() {
  // 1. Query DOM once and cache references
  elements.container = document.querySelector('.container');

  // 2. Setup event listeners (named functions, not anonymous)
  addEventListeners();

  // 3. Start animation loop if needed
  startLoop();
}

export function destroyModule() {
  // 1. Cancel animation frames
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  // 2. Remove event listeners
  removeEventListeners();

  // 3. Clear DOM references
  Object.keys(elements).forEach(k => delete elements[k]);
}

// Named event handlers (required for proper removal)
function onResize() { /* ... */ }
function onScroll() { /* ... */ }

function addEventListeners() {
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll);
}

function removeEventListeners() {
  window.removeEventListener('resize', onResize);
  window.removeEventListener('scroll', onScroll);
}
```

### Critical Rules

1. **Every `init` MUST have a matching `destroy`**
2. **Store event handlers as named functions** (not anonymous)
3. **Cancel ALL animation frames in destroy**
4. **Clear DOM references to prevent memory leaks**
5. **Check `isRunning` flag before initialization** (see `scripts/three.js:113-115`)

## WebGL Implementation

### Background WebGL (`scripts/three.js`)

- Attaches to `#background` element
- Loads GLTF from `/home/scene.glb`
- Camera responds to mouse + scroll
- Uses EffectComposer for dissolve shader

```javascript
// Initialize (checks isRunning flag internally)
import webgl, { destroyWebgl } from './three.js';
webgl();

// Cleanup (CRITICAL - prevents memory leaks)
destroyWebgl();
```

### Transition WebGL (`scripts/transition.js`)

- Uses html2canvas to capture page state
- Custom shader for portal-style transitions
- Manages its own WebGL context

```javascript
import { animateTransition, revealTransition } from './transition.js';

// On leave
await animateTransition();

// On enter
await revealTransition();
```

### Three.js Disposal Pattern

**ALWAYS** dispose resources:

```javascript
geometry.dispose();
material.dispose();
texture.dispose();
renderer.dispose();
composer.dispose();

// Remove from DOM
if (renderer.domElement && renderer.domElement.parentNode) {
  renderer.domElement.parentNode.removeChild(renderer.domElement);
}
```

## Animation Patterns

### GSAP Usage

```javascript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// Immediate set (no animation)
gsap.set(element, { opacity: 0 });

// Animate
gsap.to(element, { opacity: 1, duration: 0.5, ease: 'power2.out' });

// From-to
gsap.fromTo(element, { y: 100 }, { y: 0, duration: 0.8 });

// With ScrollTrigger
gsap.to(element, {
  opacity: 0,
  scrollTrigger: {
    trigger: '.section',
    start: 'top top',
    end: 'bottom 50%',
    scrub: true
  }
});
```

### Text Reveal System (`scripts/text-reveal.js`)

```javascript
import { getOrSplit, initScrollTextReveals, animateRevealEnter } from './text-reveal.js';

// Get or create split (caches result)
const split = getOrSplit(element);

// Animate words
gsap.fromTo(split.words,
  { y: 100, opacity: 0 },
  { y: 0, opacity: 1, stagger: 0.03 }
);
```

**CSS Classes:**
- `.text-reveal` — Words slide up on scroll
- `.text-reveal-reverse` — Words slide down on scroll
- `.text-reveal-header` — Header text with transition animations
- `.body-text-reveal` — Body text with line-by-line reveal

### Lenis Smooth Scroll (`scripts/lenis-scroll.js`)

```javascript
import { lenis } from './lenis-scroll.js';

// Lenis is already configured and connected to GSAP ticker
// Config: lerp: 0.12, duration: 1.2, smoothWheel: true
```

## CSS Conventions

### CSS Variables (`:root`)

```css
/* Colors */
--theme-background: #000;
--theme-primary: #e2e2e2;
--theme-accent: #e2e2e2;

/* Typography */
--text-style-font-primary: "InterVariable", sans-serif;
--text-style-font-secondary: secondary, monospace;
--typography-font-size-display: clamp(4rem, ..., 7rem);
--typography-font-size-h1: clamp(3rem, ..., 5rem);
/* ... h2-h6, text-main, text-small, large */

/* Spacing */
--site--margin: clamp(1rem, ..., 3rem);
--site--gutter: clamp(1rem, ..., 2rem);
--spacing-space-1 through --spacing-space-8

/* Layout */
--site--column-count: 12;
--column-width: calc(...);
--column-width-1 through --column-width-12
```

### Utility Classes

The project uses a comprehensive utility class system (BEM-like naming with `u-` prefix):

**Layout:**
- `.u-container`, `.u-container-small`, `.u-container-full`
- `.u-position-fixed`, `.u-position-absolute`, `.u-position-relative`
- `.u-flex-horizontal-wrap`, `.u-flex-vertical-wrap`, `.u-flex-vertical-nowrap`
- `.u-align-items-center`, `.u-justify-content-between`

**Spacing:**
- `.u-gap-0` through `.u-gap-8`
- `.u-margin-top-0` through `.u-margin-top-8`
- `.u-padding-0` through `.u-padding-8`

**Typography:**
- `.u-text-style-display`, `.u-text-style-h1` through `.u-text-style-h6`
- `.u-text-style-large`, `.u-text-style-main`, `.u-text-style-small`
- `.u-text-style-font-primary`, `.u-text-style-font-secondary`

**Display:**
- `.u-display-block`, `.u-display-none`, `.u-display-inline-flex`
- `.u-overflow-hidden`, `.u-overflow-visible`

**Columns:**
- `.u-column-width-1` through `.u-column-width-12`

**Other:**
- `.u-zindex-1` through `.u-zindex-3`
- `.u-pointer-on`, `.u-pointer-off`
- `.u-mobile-hidden`
- `.u-background-transparent`

## Asset Paths

### Public Directory

All assets in `public/` are served at root URL:

```javascript
// Correct
'/home/scene.glb'
'/work/work-1.jpg'
'/middle-carousel/spotlight-1.jpg'

// Wrong
'./public/home/scene.glb'
'../public/work/work-1.jpg'
```

## Adding a New Page

1. **Create HTML file** (`newpage.html`):
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>New Page</title>
  <link rel="icon" href="/site-icon.png" />
  <link rel="stylesheet" href="/styles.css" />
</head>
<body data-barba="wrapper" class="page-wrap">
  <!-- Include transition overlay, nav, menu (copy from existing page) -->

  <div id="background"></div>

  <main data-barba="container" data-barba-namespace="newpage">
    <!-- Page content -->
  </main>

  <script type="module" src="/scripts/barba.js"></script>
</body>
</html>
```

2. **Add to Vite config** (`vite.config.js`):
```javascript
rollupOptions: {
  input: {
    // ... existing entries
    newpage: resolve(__dirname, 'newpage.html'),
  }
}
```

3. **Create module** (`scripts/newpage.js`):
```javascript
let rafId = null;
// ... state variables

export function initNewpage() {
  // Setup
}

export function destroyNewpage() {
  // Cleanup - cancel RAF, remove listeners, clear refs
}
```

4. **Wire into Barba** (`scripts/barba.js`):
```javascript
import { initNewpage, destroyNewpage } from './newpage.js';

// In initPageFeatures():
if (ns === 'newpage') {
  initNewpage();
}

// In leave transition:
if (data?.current?.namespace === 'newpage') {
  destroyNewpage();
}
```

## Performance Best Practices

1. **DOM Queries:** Query once, cache references in module-level variables
2. **Event Handlers:** Use named functions, throttle scroll/resize (see `scripts/three.js:208-213`)
3. **Animations:** Use GSAP, not CSS transitions on frequently animated properties
4. **Three.js:**
   - Dispose ALL resources (geometries, materials, textures, renderers)
   - Cap pixel ratio: `Math.min(window.devicePixelRatio || 1, 1.5)`
   - Debounce resize handlers (see `scripts/three.js:157-173`)
5. **Images:** Use appropriate sizes, assets from `public/` are not processed

### Memory Leak Prevention Checklist

- [ ] Cancel all `requestAnimationFrame` calls
- [ ] Remove all event listeners (use named handler references)
- [ ] Dispose Three.js geometries, materials, textures, renderers, composers
- [ ] Kill all GSAP tweens and ScrollTriggers
- [ ] Clear object/DOM references

## Debugging

### Common Issues

| Problem | Check |
|---------|-------|
| Blank after transition | `transition-overlay` exists, html2canvas CORS settings |
| WebGL not rendering | Asset path (must start with `/`), console errors, check if `destroyWebgl()` was called |
| Memory leak | Destroy functions called, listeners removed, Three.js disposed |
| Animation jank | Layout thrashing, unthrottled handlers |
| Scroll not smooth | Lenis initialized, GSAP ticker connected |
| Text not animating | Check class names (`.text-reveal`, `.body-text-reveal`) |

### DevTools Tips

```javascript
// Check Three.js memory
console.log(renderer.info.memory);
console.log(renderer.info.render);

// Verify Lenis
import { lenis } from './lenis-scroll.js';
console.log(lenis);

// Check active ScrollTriggers
import { ScrollTrigger } from 'gsap/ScrollTrigger';
console.log(ScrollTrigger.getAll());

// Check split text cache
// (WeakMap in text-reveal.js - not directly inspectable)
```

## Key Files Quick Reference

| File | Purpose | Key Exports |
|------|---------|-------------|
| `scripts/barba.js` | Page routing & lifecycle | `initPageFeatures()` |
| `scripts/three.js` | WebGL background | `webgl()`, `destroyWebgl()` |
| `scripts/transition.js` | Page transitions | `animateTransition()`, `revealTransition()`, `closeMenuIfOpen()` |
| `scripts/work.js` | Work page | `initWork()`, `destroyWork()` |
| `scripts/text-reveal.js` | Text animations | `getOrSplit()`, `initScrollTextReveals()`, `animateRevealEnter()`, `cleanupScrollTriggers()` |
| `scripts/lenis-scroll.js` | Smooth scroll | `lenis` |
| `data/work-items.js` | Work data | `workItems` |

## External Resources

- [Barba.js Docs](https://barba.js.org/)
- [GSAP Docs](https://greensock.com/docs/)
- [Three.js Docs](https://threejs.org/docs/)
- [Lenis GitHub](https://github.com/darkroomengineering/lenis)
- [Vite MPA Guide](https://vitejs.dev/guide/build.html#multi-page-app)
