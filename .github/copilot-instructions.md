# AI Coding Agent Instructions for this repo

## Big Picture
- Static multi-page site built with Vite; HTML entries configured in [vite.config.js](vite.config.js) for `index.html`, `work.html`, `archive.html`, `contact.html`, `film.html`.
- Vanilla JS modules in [scripts/](scripts) drive per-page features; page-specific initializers (e.g., `initIndex()`, `initWork()`) are orchestrated by Barba in [scripts/barba.js](scripts/barba.js).
- Visual effects rely on Three.js and GSAP; background WebGL is toggled per-page via [scripts/three.js](scripts/three.js) and transitions via [scripts/transition.js](scripts/transition.js).
- Assets live under [public/](public); paths in code assume `/...` from `public` (e.g., `/home/scene.glb`, `/spotlight/spotlight-1.jpg`). Data lists are in [data/](data) (e.g., [data/work-items.js](data/work-items.js)).

## Routing + Namespaces
- Barba handles SPA-like transitions between HTML entry points. Each page’s root container must include `data-barba="container"` and `data-barba-namespace="home|work|archive|contact|film"` to match logic in [scripts/barba.js](scripts/barba.js).
- Page lifecycle:
  - `initPageFeatures(namespace)` runs common init: menu, variable font, link hovers, text reveal, index gallery.
  - Per namespace: `work` → `initWork()`; `archive` → `initArchiveScene()`; `home|contact` → `webgl()` background; others destroy irrelevant modules.
- Transitions: `animateTransition()` on leave, `revealTransition()` on enter. See [scripts/transition.js](scripts/transition.js) for the WebGL overlay shader and html2canvas captures.

## WebGL Background
- Background created in [scripts/three.js](scripts/three.js); attaches a canvas to a `#background` element (created if missing). Loads model from `/home/scene.glb` via `GLTFLoader`.
- Camera moves with mouse, zooms with scroll; postprocessing via `EffectComposer` (+ `RenderPass`, `OutputPass`).
- Always call `destroyWebgl()` when leaving pages that don’t use it to avoid memory leaks (Barba already does this in routing logic).

## Work Page: Slider + Thumbnail Wheel
- Core logic in [scripts/work.js](scripts/work.js); data from [data/work-items.js](data/work-items.js).
- Horizontal slider of repeated images (`.slide`) loops infinitely; center slide scales via eased distance from viewport center.
- Circular thumbnail wheel (`.thumbnail-wheel`) animates in with a spiral intro, then positions via rotation derived from scroll progress.
- Ensure cleanup via `destroyWork()`; registers and removes listeners (`wheel`, `scroll`, `resize`) and `requestAnimationFrame`.

## Animations + Text Reveals
- GSAP + ScrollTrigger configured in [scripts/index.js](scripts/index.js) for hero fade and spotlight overlay.
- Smooth scrolling via Lenis in [scripts/lenis-scroll.js](scripts/lenis-scroll.js); GSAP ticker pipes time to Lenis, updates ScrollTrigger.
- Link hover and text reveal effects are modular in [scripts/link-hover.js](scripts/link-hover.js) and [scripts/text-reveal.js](scripts/text-reveal.js) (called from `initPageFeatures`).

## Data + Assets
- Data modules: [data/work-items.js](data/work-items.js), [data/services.js](data/services.js), [data/directors.js](data/directors.js), [data/slides.js](data/slides.js).
- Assets from [public/](public) are referenced with leading `/`. Keep large models/textures optimized; Vite `assetsInclude` covers common image formats.

## Conventions
- Page modules export `initX()` and optional `destroyX()`; wire these in [scripts/barba.js](scripts/barba.js).
- Prefer DOM queries at init time; cache elements; store listeners in module scope so cleanup can remove them reliably.
- Use GSAP for animation timing; avoid mixing CSS transitions with GSAP-controlled properties.
- When adding Three.js features, cap `devicePixelRatio` and dispose `composer`, `renderer`, textures on teardown.

## Developer Workflow
- Commands (package scripts in [package.json](package.json)):
  - `npm run dev` — start Vite dev server at localhost.
  - `npm run host` — dev server accessible on LAN (`--host`).
  - `npm run build` — production build (multiple HTML inputs via Rollup).
  - `npm run preview` — preview built output locally.
- Vite is configured to copy [public/](public) and include multiple HTML inputs per `rollupOptions.input`.

## Adding a New Page
- Create `newpage.html` with Barba attributes: `<div data-barba="container" data-barba-namespace="newpage">`.
- Add an entry in [vite.config.js](vite.config.js) `rollupOptions.input`.
- Create a module in [scripts/](scripts) (e.g., `newpage.js`) exporting `initNewpage()` and optional `destroyNewpage()`; call it from `initPageFeatures()` in [scripts/barba.js](scripts/barba.js) based on namespace.

## Debugging Tips
- If transitions show a blank page: verify `transition-overlay` is present and `html2canvas` can capture (CORS-safe assets in [public/](public)).
- WebGL issues: confirm `/home/scene.glb` exists; check `renderer.dispose()` and listener removal in `destroyWebgl()`.
- Perf: throttle heavy work in `resize`/`scroll`; avoid layout thrash—prefer GSAP `set`/`to` and batch DOM writes.
