# Contributing to Duforn Portfolio

High-performance interactive portfolio built as a static multi-page app with SPA-like transitions, WebGL backgrounds, and GSAP animations.

## Setup

```bash
git clone <repo-url>
cd duforn
npm install
npm run dev        # http://localhost:5173
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run host` | Dev server on LAN |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:ui` | Tests with browser UI |
| `npm run test:coverage` | Tests with coverage report |

## Project Structure

```
index.html, work.html, archive.html, film.html, contact.html   # Page entry points
styles.css                # Global styles + utility classes
vite.config.js            # Multi-page build config

scripts/
├── barba.js              # Main entry — page routing, transitions, lifecycle
├── three.js              # WebGL background + camera blending (home/contact)
├── transition.js         # html2canvas shader page transitions
├── work.js               # Work page slider
├── index.js              # Home page hero scroll effects
├── link-hover.js         # 3D character flip hover
├── text-reveal.js        # SplitText scroll animations
├── archive/              # Archive page (modular)
│   ├── index.js          # Entry (initArchiveScene / destroyArchiveScene)
│   ├── state.js, config.js, renderer.js, atlas.js
│   ├── shaders.js, input.js, focus.js
└── [menu, btn-hover, lenis-scroll, middle-carousel, preloader].js

data/
├── work-items.js         # Work page project data
└── archive-items.js      # Archive item metadata
```

## Key Conventions

### Module Pattern

Every page module exports an `init` and `destroy` function pair:

```javascript
export function initModule() { /* setup DOM, events, loops */ }
export function destroyModule() { /* cancel RAF, remove listeners, dispose resources */ }
```

- Named event handlers (not anonymous) for proper removal
- Cancel all `requestAnimationFrame` calls in destroy
- Dispose Three.js resources (geometries, materials, textures, renderers)
- Kill GSAP tweens and ScrollTriggers

### Barba.js Page Lifecycle

All pages route through `scripts/barba.js`. Two transition types exist:

1. **`home-contact-transition`** — Text animations + WebGL camera blend (no page capture)
2. **`default`** — html2canvas shader transitions for other pages

Page-specific modules are initialized in `initPageFeatures(namespace)` and destroyed in the leave transition.

### Adding a New Page

1. Create `newpage.html` following the Barba container structure (see existing pages)
2. Add entry to `vite.config.js` `rollupOptions.input`
3. Create `scripts/newpage.js` with `init`/`destroy` exports
4. Wire into `scripts/barba.js`: add to `initPageFeatures()` and leave transition

See `CLAUDE.md` for detailed instructions and templates.

## Tech Stack

Vite, Barba.js, Three.js, GSAP (ScrollTrigger, Draggable, SplitText), Lenis, html2canvas, postprocessing, Vitest.

## Branch & PR Guidelines

- Create feature branches from `main`
- Keep commits focused and descriptive
- Run `npm test` and `npm run build` before opening a PR
- Ensure no memory leaks (check destroy functions for new modules)
