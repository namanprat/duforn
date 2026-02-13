# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Creative portfolio site — static multi-page app with SPA-like transitions via Barba.js, WebGL backgrounds (Three.js), and GSAP animations. Deployed on Vercel.

## Commands

```bash
npm run dev           # Dev server (localhost:5173)
npm run build         # Production build to dist/
npm run preview       # Preview production build
npm run host          # Dev server on LAN
npm test              # Run unit tests (Vitest)
npm run test:ui       # Tests with browser UI
npm run test:coverage # Tests with coverage report
```

**Note:** Test infrastructure (Vitest + happy-dom) is configured in `vite.config.js` but no test files exist yet. The referenced setup file `test/setup.js` does not exist.

## Architecture

### Multi-Page App with SPA Transitions

Each HTML page (`index.html`, `work.html`, `archive.html`, `film.html`, `contact.html`) is a separate Vite entry point (configured in `vite.config.js`). Barba.js intercepts navigation to create SPA-like transitions between them. The single entry script for all pages is `scripts/barba.js`.

### Page Lifecycle (scripts/barba.js)

`barba.js` is the orchestrator. It imports all page modules and manages their lifecycle:

1. **`initPageFeatures(namespace)`** runs on every page load/transition:
   - Shared modules: `initMenu()`, `initScrollTextReveals()`, `initLinkHover()`, `initBtnHover()`
   - Per-namespace: initializes the relevant page module and destroys others

2. **Two transition types:**
   - **`home-contact-transition`** (home ↔ contact) — Text animations + WebGL camera blend, no html2canvas
   - **`default`** (all others) — html2canvas page capture → custom shader transition

3. **Destroy before init:** When navigating away, the current page's destroy function is called before the new page initializes. This prevents memory leaks from stacked WebGL contexts and event listeners.

### Key Modules

| Module | Init / Destroy | Notes |
|--------|---------------|-------|
| `scripts/three.js` | `webgl()` / `destroyWebgl()` | WebGL background shared by home + contact. Camera blends via `setScenePage()`. Uses Troika for WebGL text overlay. Persists camera state in `sessionStorage('webgl-page')`. |
| `scripts/transition.js` | `animateTransition()` / `revealTransition()` | Captures page with html2canvas, runs shader transition. Own WebGL context. |
| `scripts/index.js` | `initIndex()` / `destroyIndex()` | Home page hero scroll effects |
| `scripts/work.js` | `initWork()` / `destroyWork()` | Work page slider + thumbnail wheel (GSAP Draggable) |
| `scripts/archive/index.js` | `initArchiveScene()` / `destroyArchiveScene()` | 3D archive visualization with its own renderer, atlas system, input handling |
| `scripts/text-reveal.js` | `initScrollTextReveals()` / `cleanupScrollTriggers()` | SplitText animations, caches splits in WeakMap |
| `scripts/link-hover.js` | `initLinkHover()` / `destroyLinkHover()` | 3D character flip hover effects |
| `scripts/middle-carousel.js` | — | WebGL image carousel on home page |
| `scripts/lenis-scroll.js` | exports `lenis` instance | Smooth scroll, connected to GSAP ticker |

### Data Files

- `data/work-items.js` — Project data for work page
- `data/archive-items.js` — Archive item metadata (id, title, year, description, category, image)

## Module Pattern (Required)

Every page module **must** export a matching `init`/`destroy` pair:

```javascript
let rafId = null;

export function initModule() {
  // 1. Cache DOM queries in module-level variables
  // 2. Add named event listeners (not anonymous — needed for removal)
  // 3. Start animation loops
}

export function destroyModule() {
  // 1. cancelAnimationFrame(rafId)
  // 2. Remove all event listeners (by named reference)
  // 3. Dispose Three.js resources (geometries, materials, textures, renderers, composers)
  // 4. Kill GSAP tweens and ScrollTriggers
  // 5. Null out DOM references
}
```

**Critical:** Check `isRunning` flags before initialization to prevent double-init (see `scripts/three.js`).

## Page HTML Structure

Every page must follow this Barba.js structure:

```html
<body data-barba="wrapper" class="page-wrap">
  <div class="transition"><div class="transition-overlay"></div></div>
  <nav class="nav-wrap u-position-fixed">...</nav>
  <div id="background"></div>
  <main data-barba="container" data-barba-namespace="NAMESPACE">
    <!-- Page content -->
  </main>
  <script type="module" src="/scripts/barba.js"></script>
</body>
```

## Adding a New Page

1. Create `newpage.html` following the HTML structure above
2. Add entry to `vite.config.js` → `rollupOptions.input`
3. Add rewrite to `vercel.json`
4. Create `scripts/newpage.js` with `initNewpage()` / `destroyNewpage()` exports
5. Wire into `scripts/barba.js`: import, add to `initPageFeatures()`, add to leave transition

## CSS Conventions

- **Variables** defined on `:root` — colors (`--theme-background`, `--theme-primary`), typography sizes (`--typography-font-size-*`), spacing (`--spacing-space-1` through `--spacing-space-8`), 12-column grid (`--column-width-*`)
- **Utility classes** use `u-` prefix: `u-container`, `u-flex-horizontal-wrap`, `u-text-style-h1`, `u-margin-top-4`, `u-column-width-6`, `u-mobile-hidden`, etc.
- **Fonts:** `--text-style-font-primary` (InterVariable), `--text-style-font-secondary` (secondary, monospace)

## Text Animation Classes

- `.text-reveal` — Words slide up on scroll
- `.text-reveal-reverse` — Words slide down on scroll
- `.text-reveal-header` — Header text with transition animations
- `.body-text-reveal` — Body text line-by-line reveal (excludes hero elements)
- `.hero-text-reveal` — Hero text (home page), animated in Barba transitions

## Asset Paths

Assets in `public/` are served at root: use `/home/scene.glb`, not `./public/home/scene.glb`.

## Performance Rules

- Cap pixel ratio: `Math.min(window.devicePixelRatio || 1, 1.5)`
- Throttle/debounce scroll and resize handlers
- Use GSAP for animations, not CSS transitions on frequently animated properties
- Query DOM once, cache references in module-level variables

## Deployment

Hosted on Vercel. Config in `vercel.json` — includes rewrites for clean URLs (`/work` → `/work.html`, etc.). Run `npm run build` before PRs to verify the production build succeeds.

## Branch & PR Guidelines

- Create feature branches from `main`
- Run `npm test` and `npm run build` before opening a PR
- Verify no memory leaks in new modules (check destroy functions)
