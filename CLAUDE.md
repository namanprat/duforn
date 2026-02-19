# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Creative portfolio site — static multi-page app with SPA-like transitions via Barba.js, WebGL backgrounds (Three.js), and GSAP animations.

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

**Note:** Test infrastructure (Vitest + happy-dom) is configured in `vite.config.js`. Baseline test files exist in `test/`, including `test/setup.js` and `test/smoke.test.js`.

## Architecture

### Multi-Page App with SPA Transitions

Each HTML page (`index.html`, `work.html`, `archive.html`, `film.html`, `contact.html`) is a separate Vite entry point (configured in `vite.config.js`). Barba.js intercepts navigation to create SPA-like transitions between them. The single entry script for all pages is `scripts/barba.js`.

### Page Lifecycle (scripts/barba.js)

`scripts/barba.js` is the orchestrator. It imports all page modules and manages their lifecycle:

1. **`initPageFeatures(namespace)`** runs on every page load/transition:
   - Shared modules: `initMenu()`, `initScrollTextReveals()`, `initLinkHover()`, `initBtnHover()`
   - Per-namespace: initializes the relevant page module and destroys others

2. **Four transition flows** (registered in `barba.init({ transitions: [...] })`):
   - **`work-detail-unwrap`** (`work` → `film`) — Work-strip unwrap handoff into the film detail scene
   - **`detail-work-dissolve`** (`film` → `work`) — Detail-to-work dissolve with shared WebGL continuity
   - **`webgl-page-transition`** (`home`/`contact`/`work` → `home`/`contact`/`work`) — Shared WebGL camera/model transitions
   - **`default`** (all remaining namespace changes + initial page load)

3. **Destroy before init:** When navigating away, the current page's destroy function is called before the new page initializes. This prevents memory leaks from stacked WebGL contexts and event listeners.

### Key Modules

| Module | Init / Destroy | Notes |
|--------|---------------|-------|
| `scripts/three.js` | `webgl()` / `destroyWebgl()` | Shared base WebGL runtime (home/contact/work). Key controls include `swapModel()` and `setScenePage()`. |
| `scripts/work.js` | `initWork()` / `destroyWork()` | Work namespace 3D strip scene and transition handoff helpers. |
| `scripts/archive.js` | `initArchive()` / `destroyArchive()` | Archive namespace 3D atlas scene with dedicated renderer/composer lifecycle. |
| `scripts/project-canvas.js` | `initFilm()` / `destroyFilm()` | Film/detail namespace WebGL runtime; also exposes shared-scene API (`initProjectSceneShared()` / `destroyProjectSceneShared()`). |
| `scripts/transition.js` | `animateTransition()` / `revealTransition()` / `destroyTransition()` | Ink/shader transition renderer utilities used by transition orchestration and cleanup. |
| `scripts/text-reveal.js` | `initScrollTextReveals()` / `cleanupScrollTriggers()` / `cleanupSplits()` | SplitText + ScrollTrigger setup/teardown for page/transition-safe text animation. |
| `scripts/link-hover.js` | `initLinkHover()` / `destroyLinkHover()` | Hover text/character interaction effects for link elements. |
| `scripts/btn-hover.js` | `initBtnHover()` / `destroyBtnHover()` | Button hover interaction lifecycle; re-initialized per page transition. |
| `scripts/project-page-data.js` | `bindFilmProjectData()` | Binds selected project content to film/detail DOM from URL or transition state. |
| `scripts/shared-transition-state.js` | `setProjectTransitionState()` / `getProjectTransitionState()` / `clearProjectTransitionState()` | Session-backed transition payload handoff between work and film flows. |

### Data Files

- `data/work-items.js` — Project data for work page
- `data/archive-items.js` — Archive item metadata (id, title, year, description, category, image)

## Module Pattern (Required)

Every page module **must** expose a matching `init`/`destroy` lifecycle pair. `init` may be async when setup requires async asset loading.

```javascript
let rafId = null;

export async function initModule() {
  // 1. Cache DOM queries in module-level variables
  // 2. Add named event listeners (not anonymous — needed for removal)
  // 3. Initialize async assets/resources when needed
  // 4. Start animation loops
}

export function destroyModule() {
  // 1. cancelAnimationFrame(rafId)
  // 2. Remove all event listeners (by named reference)
  // 3. Dispose Three.js resources (geometries, materials, textures, renderers, composers)
  // 4. Kill GSAP tweens and ScrollTriggers
  // 5. Null out DOM references
}
```

**Critical:** Guard against double-init with module flags/tokens (`isRunning`, `isWorkInitialized`, init tokens) before creating new runtimes. See `scripts/three.js`, `scripts/work.js`, and `scripts/archive.js`.

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

1. Create a new page HTML entry file following the HTML structure above
2. Add entry to `vite.config.js` → `rollupOptions.input`
3. Create a matching page module in `scripts/` with `init`/`destroy` exports (async init is allowed)
4. Wire into `scripts/barba.js`: import module, add namespace handling in `initPageFeatures()`
5. Update `barba.init()` transitions: include the new namespace in `from`/`to` rules or add a dedicated transition if needed

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

Deployment platform configuration is managed outside this repo. In-repo validation requirement: run `npm run build` before PRs and verify the production build succeeds.

## Branch & PR Guidelines

- Create feature branches from `main`
- Run `npm test` and `npm run build` before opening a PR
- Verify no memory leaks in new modules (check destroy functions)
