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
- `src/App.jsx` is the route and lifecycle orchestrator. On each route change it sets `activePage` in the Zustand store, applies body classes, runs brand handoff transitions, and initialises Lenis scrolling for the film page.

### Route Model

Routes are handled by React Router:

- `/` → `src/routes/HomePage.jsx`
- `/work` → `src/routes/WorkPage.jsx`
- `/contact` → `src/routes/ContactPage.jsx`
- `/archive` → `src/routes/ArchivePage.jsx`
- `/film` → `src/routes/FilmPage.jsx`

### State Management

`src/store/webgl.js` is a Zustand store with two fields:

- `activePage` — current route namespace string (e.g. `'home'`, `'work'`, `'archive'`, `'film'`, `'contact'`)
- `setActivePage(page)` — setter

All page-specific WebGL behaviour is derived from `activePage`.

### R3F Canvas Architecture

`src/components/layout/SiteLayout.jsx` renders a `PageCanvas` component that selects the correct canvas based on `activePage`:

| `activePage`          | Canvas component                         | Purpose                                                |
| --------------------- | ---------------------------------------- | ------------------------------------------------------ |
| `'home'`, `'contact'` | `src/components/webgl/GlobalCanvas.jsx`  | Home scene with logo model, particles, HDR environment |
| `'work'`              | `src/components/webgl/WorkCanvas.jsx`    | Work gallery with cloth strip meshes                   |
| `'archive'`           | `src/components/webgl/ArchiveCanvas.jsx` | Archive cylindrical tube, shader grid, logo            |
| `'film'`              | `src/components/webgl/FilmCanvas.jsx`    | Film FBM background, DOM-synced image planes           |

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

#### Film (`src/film/`)

| Module                 | Purpose                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `FilmBackground.jsx`   | FBM warp shader background on fullscreen quad                           |
| `FilmImagePlanes.jsx`  | DOM-synced image planes overlaying `.coverimg img` / `.project-img img` |
| `FilmEffects.jsx`      | Post-processing (Noise)                                                 |
| `useFilmController.js` | Resize and visibility change handling                                   |

#### Work (`src/work/`)

| Module                     | Purpose                                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `WorkClothStrip.jsx`       | Cloth strip mesh with 5-layer vertex displacement: pin influence, gravity sag, traveling waves, billowing, edge flutter |
| `useWorkPageController.js` | Scroll/drag/click controller with wind breathing cycle                                                                  |
| `workStripBridge.js`       | Bridge between controller and R3F strips (slot state, wind, visibility)                                                 |
| `stripLayoutConfig.js`     | Grid layout configuration for work strips                                                                               |

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
| `scripts/lenis-scroll.js` | `initLenis()` / `destroyLenis()`         | Smooth scrolling for film page.                             |
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

- `data/work-items.js` drives work page media and cloth strip surfaces.
- `data/archive-items.js` drives archive page tube textures.

## Adding or Changing Pages

1. Add or update the route component under `src/routes/`.
2. Register the route in `src/App.jsx`.
3. Create an R3F canvas component under `src/components/webgl/` and add it to the `PageCanvas` switch in `src/components/layout/SiteLayout.jsx`.
4. Place page-specific R3F sub-components in `src/<pagename>/`.
5. The route effect in `App.jsx` sets `activePage` which drives the canvas switch automatically.

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
