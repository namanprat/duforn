# Copilot Instructions for Portfolio Site

## Project Overview

High-performance interactive portfolio built as a static multi-page app with SPA-like transitions. Features immersive WebGL backgrounds, smooth animations, and custom UI components.

**Tech Stack:**
| Tool | Purpose |
|------|---------|
| Vite | Build tool (multi-page config) |
| Barba.js | SPA-style page transitions |
| Three.js | WebGL backgrounds + postprocessing |
| GSAP | Animations + ScrollTrigger |
| Lenis | Smooth scrolling |
| CSS | Variable fonts + custom properties |

---

## Architecture

### Pages
Each page is a separate HTML entry in `vite.config.js`:

| File | Namespace | Features |
|------|-----------|----------|
| `index.html` | `home` | Hero, WebGL background, spotlight gallery |
| `work.html` | `work` | Infinite slider, thumbnail wheel |
| `archive.html` | `archive` | 3D archive visualization |
| `film.html` | `film` | Film showcase |
| `contact.html` | `contact` | Contact info, WebGL background |

### Scripts Directory
```
scripts/
├── barba.js           # Page routing & lifecycle
├── three.js           # WebGL background (home/contact)
├── work.js            # Work page slider + wheel
├── archive-scene.js   # Archive 3D scene
├── transition.js      # Page transition shader effects
├── index.js           # Home page features
├── middle-carousel.js # WebGL image carousel
├── lenis-scroll.js    # Smooth scroll setup
├── text-reveal.js     # SplitText animations
├── menu.js            # Navigation menu
├── variable-font.js   # Font weight hover effects
├── link-hover.js      # Link interaction effects
└── preloader.js       # Asset preloading
```

### Data Directory
```
data/
├── work-items.js   # Project data for work page
├── services.js     # Services list
├── directors.js    # Directors info
└── slides.js       # Slider configuration
```

---

## Barba.js Routing

### Page Container Structure
Every page needs:
```html
<body data-barba="wrapper">
  <main data-barba="container" data-barba-namespace="home">
    <!-- content -->
  </main>
</body>
```

### Lifecycle Flow
```
Page Load → once() → initPageFeatures()
Navigation → leave() → enter() → after() → initPageFeatures()
```

### initPageFeatures(namespace)
Called on every page load/transition:
1. `initTime()` — clock display
2. `initMenu()` — navigation
3. `initVariableFont()` — font hover effects
4. `initScrollTextReveals()` — text animations
5. `initLinkHover()` — link effects
6. `initIndex()` — home-specific features
7. Namespace-specific: `webgl()`, `initWork()`, `initArchiveScene()`

### Transitions
| Transition | From/To | Effect |
|------------|---------|--------|
| `home-contact-reverse` | home ↔ contact | Text reveal reverse + fade |
| `default` | any ↔ any | WebGL shader wipe |

---

## WebGL Implementation

### Background (`three.js`)
- Attaches to `#background` element
- Loads GLTF from `/home/scene.glb`
- Camera responds to mouse + scroll
- Uses EffectComposer for postprocessing

```javascript
// Initialize
webgl();

// Cleanup (CRITICAL - prevents memory leaks)
destroyWebgl();
```

### Middle Carousel (`middle-carousel.js`)
- WebGL image carousel in `.middle-img` container
- Curved plane geometry with custom shaders
- Lenis scroll integration for velocity
- Bloom postprocessing effect

```javascript
initMiddleCarousel();
destroyMiddleCarousel();
```

### Disposal Pattern
Always dispose Three.js resources:
```javascript
geometry.dispose();
material.dispose();
texture.dispose();
renderer.dispose();
composer.dispose();
```

---

## Animation Patterns

### GSAP Usage
```javascript
// Immediate set (no animation)
gsap.set(element, { opacity: 0 });

// Animate
gsap.to(element, { opacity: 1, duration: 0.5, ease: 'power2.out' });

// From-to
gsap.fromTo(element, { y: 100 }, { y: 0, duration: 0.8 });
```

### ScrollTrigger
```javascript
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

### Text Reveals
Uses GSAP SplitText plugin:
```javascript
// Get or create split
const split = getOrSplit(element);

// Animate words
gsap.fromTo(split.words,
  { y: 100, opacity: 0 },
  { y: 0, opacity: 1, stagger: 0.03 }
);
```

Classes:
- `.text-reveal` — words slide up on scroll
- `.text-reveal-reverse` — words slide down on scroll

### Lenis Config
```javascript
const lenis = new Lenis({
  lerp: 0.15,
  duration: 1.1,
  smoothWheel: true,
  touchMultiplier: 0  // disabled on touch
});
```

---

## Module Pattern

### Standard Structure
```javascript
let rafId = null;
const elements = {};

export function initModule() {
  // Query DOM once
  elements.container = document.querySelector('.container');
  
  // Setup
  addEventListeners();
  startLoop();
}

export function destroyModule() {
  removeEventListeners();
  cancelAnimationFrame(rafId);
  
  // Clear refs
  Object.keys(elements).forEach(k => delete elements[k]);
}

function addEventListeners() {
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll);
}

function removeEventListeners() {
  window.removeEventListener('resize', onResize);
  window.removeEventListener('scroll', onScroll);
}
```

### Rules
1. Every `init` must have matching `destroy`
2. Store event handlers as named functions (not anonymous)
3. Cancel all animation frames in destroy
4. Clear DOM references to prevent memory leaks

---

## Asset Paths

### Public Directory
All assets in `public/` are served at root:
```javascript
// ✓ Correct
'/home/scene.glb'
'/spotlight/image-1.jpg'

// ✗ Wrong
'./home/scene.glb'
'../public/spotlight/image-1.jpg'
```

### Structure
```
public/
├── home/          # 3D models, textures
├── spotlight/     # Project thumbnails
├── work/          # Work page images
├── canvas/        # Canvas assets
└── sample-film/   # Video content
```

---

## Adding a New Page

1. **Create HTML** (`newpage.html`):
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Page</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body data-barba="wrapper" class="page-wrap">
  <!-- Include nav, menu, transition overlay -->
  
  <main data-barba="container" data-barba-namespace="newpage">
    <!-- content -->
  </main>
  
  <script type="module" src="/scripts/barba.js"></script>
</body>
</html>
```

2. **Add to Vite config**:
```javascript
// vite.config.js
rollupOptions: {
  input: {
    // ... existing
    newpage: resolve(__dirname, 'newpage.html'),
  }
}
```

3. **Create module** (`scripts/newpage.js`):
```javascript
export function initNewpage() {
  // Setup
}

export function destroyNewpage() {
  // Cleanup
}
```

4. **Wire into Barba** (`scripts/barba.js`):
```javascript
import { initNewpage, destroyNewpage } from './newpage.js';

// In initPageFeatures:
if (ns === 'newpage') {
  initNewpage();
}

// In leave transition:
if (data?.current?.namespace === 'newpage') {
  destroyNewpage();
}
```

---

## CSS Conventions

### Variables
```css
/* Colors */
--theme-background: #fff;
--theme-accent: #f5a623;
--theme-text: #000;

/* Spacing */
--site--margin: clamp(1rem, 5vw, 3rem);
--site--gutter: 1rem;

/* Containers */
--container--main: 1200px;
--container--full: 100%;
```

### Utility Classes
```css
.u-container                 /* Max-width centered */
.u-container-small           /* Small constrained container */
.u-container-full            /* Full width container */
.u-svg                       /* SVG block */
.u-path                      /* SVG path stroke helper */
.u-display-block             /* display: block */
.u-display-inline            /* display: inline */
.u-display-inline-block      /* display: inline-block */
.u-display-inline-flex       /* display: inline-flex */
.u-display-inline-grid       /* display: inline-grid */
.u-display-contents          /* display: contents */
.u-display-none              /* display: none */
.u-zindex-negative           /* negative z-index helper */
.u-zindex-0                  /* z-index: 0 */
.u-zindex-1                  /* z-index: 1 */
.u-zindex-2                  /* z-index: 2 */
.u-zindex-3                  /* z-index: 3 */
.u-position-static           /* position: static */
.u-position-relative         /* position: relative */
.u-position-absolute         /* position: absolute */
.u-position-sticky           /* position: sticky */
.u-position-fixed            /* position: fixed */
.u-height-full               /* height: 100% */
.u-height-auto               /* height: auto */
.u-width-full                /* width: 100% */
.u-width-auto                /* width: auto */
.u-cover                     /* cover sizing */
.u-cover-absolute            /* cover absolute inset */
.u-center-absolute           /* center absolutely */
.u-center-fixed              /* center fixed */
.u-min-width-auto            /* min-width: auto */
.u-min-height-screen         /* min-height: 100svh */
.u-max-width-none            /* max-width: none */
.u-max-width-full            /* max-width: 100% */
.u-overflow-visible          /* overflow: visible */
.u-overflow-hidden           /* overflow: hidden */
.u-overflow-clip             /* overflow: clip */
.u-overflow-x-auto           /* overflow-x auto */
.u-overflow-y-auto           /* overflow-y auto */

/* Flexbox & Grid */
.u-flex-horizontal-wrap      /* horizontal flex, wrap */
.u-flex-vertical-nowrap      /* vertical flex, no-wrap */
.u-flex-horizontal-nowrap    /* horizontal flex, no-wrap */
.u-flex-vertical-wrap        /* vertical flex, wrap */
.u-flex-grow                 /* flex: 1 */
.u-flex-shrink               /* flex-shrink helper */
.u-flex-noshrink             /* flex: none */
.u-align-self-inherit        /* align-self: inherit */
.u-align-self-start          /* align-self: flex-start */
.u-align-self-center         /* align-self: center */
.u-align-self-end            /* align-self: flex-end */
.u-align-self-stretch        /* align-self: stretch */
.u-align-items-stretch       /* align-items: stretch */
.u-align-items-start         /* align-items: flex-start */
.u-align-items-center        /* align-items: center */
.u-align-items-end           /* align-items: flex-end */
.u-justify-content-start     /* justify-content: flex-start */
.u-justify-content-center    /* justify-content: center */
.u-justify-content-end       /* justify-content: flex-end */
.u-justify-content-between   /* justify-content: space-between */
.u-justify-content-around    /* justify-content: space-around */
.u-justify-content-inherit   /* justify-content: inherit */
.u-order-first               /* order: -1 */
.u-order-last                /* order: 1 */
.u-column-span-full          /* grid-column: 1 / -1 */
.u-column-span-1..12         /* grid-column span helpers */
.u-column-start-1..12        /* grid-column start helpers */
.u-row-start-1..6            /* grid-row start helpers */
.u-row-span-1..6             /* grid-row span helpers */
.u-column-width-1..12        /* predefined column widths */

/* Spacing */
.u-gap-0..8                  /* gap scale helpers */
.u-gap-gutter                /* use site gutter gap */
.u-gap-row-0..8              /* row-gap helpers */
.u-margin-top-0..8           /* top margin scale */
.u-margin-bottom-0..8        /* bottom margin scale */
.u-padding-0..8              /* padding scale */
.u-padding-block-0..8        /* vertical padding scale */
.u-padding-inline-0..8       /* horizontal padding scale */

/* Typography & Text */
.u-text-style-display        /* display typography */
.u-text-style-h1..h6         /* heading typography */
.u-text-align-left           /* text-align: start */
.u-text-style-large          /* large text */
.u-text-style-main           /* main body text */
.u-text-style-small          /* small text */
.u-text-style-font-primary   /* primary font-family */
.u-text-style-font-secondary /* secondary font-family */
.u-line-height-small..huge   /* line-height helpers */
.u-weight-regular|medium|bold/* font-weight helpers */
.u-text-transform-*          /* uppercase/capitalize/none */
.u-text-wrap-*               /* text wrapping helpers */
.u-alignment-start|center|end/* combined alignment helpers */
.u-sr-only                   /* screen-reader only */

/* Theming & Color */
.u-theme-light               /* light theme helper */
.u-theme-dark                /* dark theme helper */
.u-theme-brand               /* brand background */
.u-color-inherit             /* inherit color */
.u-color-faded               /* faded color */
.u-background-1..2           /* background color helpers */
.u-background-skeleton       /* skeleton background */
.u-background-transparent    /* transparent background */

/* Miscellaneous */
.u-pointer-on                /* pointer events on */
.u-pointer-off               /* pointer events none */
.u-pointer-cursor            /* cursor: pointer */
.u-radius-none               /* border-radius: 0 */
.u-radius-inherit            /* inherit border-radius */
.u-radius-small              /* small radius */
.u-radius-main               /* main radius */
.u-radius-round              /* round radius */
.u-ratio-*-*                 /* aspect-ratio helpers */
.u-object-fit-cover          /* object-fit: cover */
.u-object-fit-contain        /* object-fit: contain */

/* Responsive / Container query helpers (examples present in stylesheet) */
.u-order-first-medium        /* order helper for medium containers */
.u-display-block-small       /* display block on small containers */
```

### Pseudo-element Pattern
```css
.element::after {
  content: "";           /* Required! */
  position: absolute;
  z-index: 1;            /* Above canvas */
  pointer-events: none;
  /* ... styles */
}
```

---

## Performance

### Best Practices
1. **DOM**: Query once, cache references
2. **Events**: Throttle scroll/resize handlers
3. **Animations**: Use GSAP, not CSS transitions on animated properties
4. **Three.js**: Dispose all resources, cap pixel ratio at 2
5. **Images**: Use appropriate sizes, lazy load below fold

### Memory Leak Prevention
- Cancel all `requestAnimationFrame` calls
- Remove all event listeners
- Dispose Three.js geometries, materials, textures, renderers
- Clear object references

---

## Debugging

### Common Issues

| Problem | Check |
|---------|-------|
| Blank after transition | `transition-overlay` exists, html2canvas CORS |
| WebGL not rendering | Asset path, console errors, destroy called |
| Memory leak | Destroy functions called, listeners removed |
| Animation jank | Layout thrashing, unthrottled handlers |
| Scroll not smooth | Lenis initialized, GSAP ticker connected |

### DevTools Tips
```javascript
// Check Three.js memory
console.log(renderer.info.memory);
console.log(renderer.info.render);

// Verify Lenis
console.log(lenis);

// Check active ScrollTriggers
console.log(ScrollTrigger.getAll());
```

---

## Commands

```bash
npm run dev       # Dev server (localhost:5173)
npm run host      # Dev server on LAN
npm run build     # Production build
npm run preview   # Preview production
```

---

## Key Files

| File | Purpose |
|------|---------|
| `vite.config.js` | Build config, entry points |
| `scripts/barba.js` | Routing, page lifecycle |
| `scripts/transition.js` | Page transition effects |
| `scripts/three.js` | WebGL background |
| `scripts/lenis-scroll.js` | Smooth scroll |
| `scripts/text-reveal.js` | Text animations |
| `styles.css` | Global styles |

---

## Resources

- [Barba.js](https://barba.js.org/)
- [GSAP](https://greensock.com/docs/)
- [Three.js](https://threejs.org/docs/)
- [Lenis](https://github.com/darkroomengineering/lenis)
- [Vite MPA](https://vitejs.dev/guide/build.html#multi-page-app)
