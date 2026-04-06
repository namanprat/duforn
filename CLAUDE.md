# CLAUDE.md

This repository is a React SPA served by Vite. All 3D rendering is handled by React Three Fiber (R3F) canvases, each managed declaratively by React components.

## Commands

```bash
npm run dev           # Dev server (localhost:5173)
npm run host          # Dev server on LAN
npm run build         # Production build to dist/
npm run preview       # Preview production build
npm test              # Run Vitest tests
npm run test:ui       # Run Vitest UI
npm run test:coverage # Coverage report
```

## Runtime Architecture

### App Entry

- `index.html` mounts the React app.
- `src/main.jsx` bootstraps `BrowserRouter`, imports the global stylesheet, and imports `src/models/preload.js` so gltfjsx-generated preload hooks warm the GLB assets.
- `src/App.jsx` is the route and lifecycle orchestrator. On each route change it sets `activePage` in the Zustand store, applies body classes, runs brand handoff transitions, and initialises Lenis scrolling for project detail pages.

### Route Model

Routes are handled by React Router:

- `/` → `src/routes/HomePage.jsx`
- `/work` → `src/routes/WorkPage.jsx`
- `/contact` → `src/routes/ContactPage.jsx`
- `/archive` → `src/routes/ArchivePage.jsx`
- `/film` → `src/routes/FilmPage.jsx` (project detail page)
- `/money-me` → `src/routes/MoneyMePage.jsx` (project detail page)

### State Management

`src/store/webgl.js` is a Zustand store with two fields:

- `activePage` — current route namespace string (e.g. `'home'`, `'work'`, `'archive'`, `'projectDetail'`, `'contact'`)
- `setActivePage(page)` — setter

All page-specific WebGL behaviour is derived from `activePage`.

### R3F Canvas Architecture

`src/components/layout/SiteLayout.jsx` renders a `PageCanvas` component that selects the correct canvas based on `activePage`:

| `activePage`          | Canvas component                         | Purpose                                                       |
| --------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| `'home'`, `'contact'` | `src/components/webgl/GlobalCanvas.jsx`  | Home scene with logo model, particles, HDR environment        |
| `'work'`              | `src/components/webgl/WorkCanvas.jsx`    | Work gallery with TSL wavy strip slider                       |
| `'archive'`           | `src/components/webgl/ArchiveCanvas.jsx` | Archive cylindrical tube, shader grid, logo                   |
| `'projectDetail'`     | `src/components/webgl/GlobalCanvas.jsx`  | Project detail scene: FBM background, DOM-synced image planes |

Canvases transition with a 300ms opacity fade managed by `PageCanvas`.

### Page-Specific R3F Modules

#### Archive (`src/archive/`)

| Module                    | Purpose                                                                |
| ------------------------- | ---------------------------------------------------------------------- |
| `ArchiveTube.jsx`         | Cylindrical image carousel (5 rows × 12 cols, radius=4)                |
| `ArchiveGrid.jsx`         | Shader grid background with mouse-driven warp                          |
| `ArchiveLogo.jsx`         | Rotating glass logo via `useGLTF`                                      |
| `ArchiveEffects.jsx`      | Post-processing (Bloom, Vignette, Noise)                               |
| `useArchiveController.js` | Interaction hook: wheel → rotation, mousemove → grid warp + raycasting |

#### Project Detail (`src/projectDetail/`)

Project detail is a shared namespace for all project case study pages (e.g. `/film`, `/money-me`). Add new project detail pages by creating a route file in `src/routes/` and a content file in `src/projectDetail/`, then register in `App.jsx`.

| Module                          | Purpose                                                                 |
| ------------------------------- | ----------------------------------------------------------------------- |
| `ProjectDetailScene.jsx`        | R3F scene composition: camera, controller, background, image planes     |
| `ProjectDetailBackground.jsx`   | FBM warp shader background on fullscreen quad                           |
| `ProjectDetailImagePlanes.jsx`  | DOM-synced image planes overlaying `[data-film-plane-trigger]` elements |
| `ProjectBg.jsx`                 | Fallback background while ProjectDetailBackground suspends              |
| `useProjectDetailController.js` | Resize and visibility change handling                                   |
| `projectDetailSceneConfig.js`   | Scene control defaults and reveal animation settings                    |
| `ProjectDetailsPageShell.jsx`   | Reusable page shell component for case study layouts                    |
| `filmCaseStudyContent.js`       | Content data for the Film project detail page                           |
| `moneyMeCaseStudyContent.js`    | Content data for the money.me project detail page                       |

#### Work (`src/work/`)

| Module                  | Purpose                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `WorkStrip.jsx`         | Single continuous strip mesh with TSL edge-curl + sin/noise wave displacement and infinite-scroll items |
| `workStripGeometry.js`  | Plane geometry builder (plain typed arrays — no Three import)                                           |
| `workStripConfig.js`    | Layout, edge curl, wave, noise, and scroll constants                                                    |
| `useWorkStripScroll.js` | Wheel/drag/momentum/snap controller, click-to-navigate, and `.slide-title` DOM sync                     |

#### Home / Contact (`src/components/webgl/`)

| Module                 | Purpose                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `GlobalCanvas.jsx`     | R3F canvas for home/contact                                    |
| `HomeScene.jsx`        | Home page 3D scene composition                                 |
| `CameraRig.jsx`        | Orbital parallax camera; reads `activePage` for contact offset |
| `EnvironmentSetup.jsx` | HDR environment and background                                 |
| `Particles.jsx`        | Particle system                                                |
| `Effects.jsx`          | Home post-processing                                           |

### Remaining Imperative Modules

| Module                    | Public lifecycle                         | Purpose                                                     |
| ------------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| `scripts/menu.js`         | `initMenu()` / `destroyMenu()`           | Global navigation overlay.                                  |
| `scripts/link-hover.js`   | `initLinkHover()` / `destroyLinkHover()` | Hover interaction effect for link text.                     |
| `scripts/lenis-scroll.js` | `initLenis()` / `destroyLenis()`         | Smooth scrolling for project detail pages.                  |
| `scripts/preloader.js`    | —                                        | Shared GLTFLoader/DRACOLoader setup, preload orchestration. |
| `scripts/work-preload.js` | `startWorkTexturePreload()`              | Preloads work textures during preloader window.             |

Guard imperative modules against double init and always remove listeners, cancel RAFs, and dispose resources in destroy paths.

## Asset Pipeline

### GLTF Loading

- `scripts/preloader.js` owns the shared `GLTFLoader` and `DRACOLoader` setup.
- R3F components use `useGLTF` from `@react-three/drei` for declarative loading.
- Reuse cached GLTF assets through the preloader instead of creating page-local loaders.

### Texture Loading

- Shared texture helpers live in `scripts/runtime/assets.js`.
- Reuse `configureTexture()` and `loadTextureAsset()` instead of hand-rolling color space, mipmap, filter, and fallback setup.

### gltfjsx

- Generated React model components live under `src/models/`.
- These files are generated from `public/models/*.glb` and serve two purposes:
  - `useGLTF.preload()` side effects via `src/models/preload.js`
  - React-owned model rendering in R3F canvases

## Data Sources

- `data/work-items.js` drives work page media and the work strip surfaces.
- `data/archive-items.js` drives archive page tube textures.

## Adding or Changing Pages

1. Add or update the route component under `src/routes/`.
2. Register the route in `src/App.jsx` — add the path to `PATH_TO_NAMESPACE` and `TITLES`.
3. For entirely new page types: create an R3F canvas component under `src/components/webgl/` and add it to the `PageCanvas` switch in `src/components/layout/SiteLayout.jsx`.
4. Place page-specific R3F sub-components in `src/<pagename>/`.
5. The route effect in `App.jsx` sets `activePage` which drives the canvas switch automatically.

### Adding a New Project Detail Page

Project detail pages all share the `'projectDetail'` namespace and the same R3F scene (`ProjectDetailScene`). To add one:

1. Create a content file at `src/projectDetail/<name>CaseStudyContent.js` following the shape in `filmCaseStudyContent.js`.
2. Create a route at `src/routes/<Name>Page.jsx` that renders `<ProjectDetailsPageShell {...contentData} />`.
3. In `src/App.jsx`, add the path to `PATH_TO_NAMESPACE` (value: `"projectDetail"`) and `TITLES`.

## Testing

- Vitest uses `happy-dom` and `test/setup.js`.
- Keep at least a smoke-level regression test for shared utilities or route-critical behavior.
- Run `npm test` and `npm run build` after meaningful runtime or asset-pipeline changes.

## Performance Rules

- Cap pixel ratio where the canvas already does so (varies per canvas, typically 2–2.5).
- Use shared debounce helpers from `scripts/runtime/timing.js` for resize and scroll work.
- Use `getPerformanceProfile()` from `scripts/perf.js` to gate expensive effects (bloom, edge flutter).
- Avoid duplicate asset loads.

## Asset Paths

Files under `public/` are served from the root URL. Use `/models/work.glb`, `/home.hdr`, and similar root-relative paths.
