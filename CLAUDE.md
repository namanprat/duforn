# CLAUDE.md

This repository is a React SPA served by Vite. All 3D rendering uses a single persistent React Three Fiber (R3F) canvas (`UnifiedCanvas`), with page-specific scene branches driven by `activePage`.

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
- `/money-me` → `src/routes/ProjectDetailPage.jsx` (project detail page)

### State Management

`src/store/webgl.js` is a Zustand store with two fields:

- `activePage` — current route namespace string (e.g. `'home'`, `'work'`, `'archive'`, `'projectDetail'`, `'contact'`)
- `setActivePage(page)` — setter

All page-specific WebGL behaviour is derived from `activePage`.

### R3F Canvas Architecture

`src/components/layout/SiteLayout.jsx` mounts a single [`UnifiedCanvas.jsx`](src/components/webgl/UnifiedCanvas.jsx). Only one scene branch is mounted at a time; switching routes unmounts the previous branch so GPU resources are released.

| `activePage`          | Scene branch (inside `UnifiedCanvas`) | Purpose |
| --------------------- | --------------------------------------- | ------- |
| `'home'`, `'contact'` | `HomeCanvasBranch` in `GlobalSceneBranches.jsx` | Logo, particles, HDR, `Effects` |
| `'work'`              | [`WorkPageScene.jsx`](src/components/webgl/WorkPageScene.jsx) | Work model, cloth strip, shadows, store-driven scene |
| `'archive'`           | [`ArchiveScene.jsx`](src/components/webgl/ArchiveScene.jsx) | Offscreen cube pass; WebGPU ASCII instancing or WebGL fullscreen fallback |
| `'projectDetail'`     | `ProjectDetailCanvasBranch` in `GlobalSceneBranches.jsx` | FBM background, DOM-synced image planes, `Effects` |

[`ShaderCompiler.jsx`](src/components/webgl/ShaderCompiler.jsx) runs `gl.compile` / `compileAsync` whenever `sceneKey` (`activePage`) changes to reduce first-frame shader hitches.

### Page-Specific R3F Modules

#### Archive

R3F scene: [`src/components/webgl/ArchiveScene.jsx`](src/components/webgl/ArchiveScene.jsx). Leva tuning panel is **dev-only**; production uses fixed defaults from `ARCHIVE_DEFAULTS`.

#### Project Detail (`src/projectDetail/`)

Project detail is a shared namespace for all project case study pages (e.g. `/money-me`). Add new project detail pages by creating a route file in `src/routes/` and content in `src/projectDetail/`, then register in `App.jsx`.

| Module                          | Purpose                                                                 |
| ------------------------------- | ----------------------------------------------------------------------- |
| `ProjectDetailScene.jsx`        | R3F scene composition: camera, controller, background, image planes     |
| `ProjectDetailBackground.jsx`   | FBM warp shader background on fullscreen quad                           |
| `ProjectDetailImagePlanes.jsx`  | DOM-synced image planes overlaying `[data-film-plane-trigger]` elements |
| `ProjectBg.jsx`                 | Fallback background while ProjectDetailBackground suspends              |
| `useProjectDetailController.js` | Resize and visibility change handling                                   |
| `projectDetailSceneConfig.js`   | Scene control defaults and reveal animation settings                    |
| `ProjectDetailsPageShell.jsx`   | Reusable page shell component for case study layouts                    |
| `projectDetailContent.js`       | Content data for project detail pages (e.g. money.me)                   |

#### Work (`src/work/`)

| Module                 | Purpose                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `WorkPageScene.jsx`    | In [`src/components/webgl/WorkPageScene.jsx`](src/components/webgl/WorkPageScene.jsx); mounted only on `'work'` inside `UnifiedCanvas` |
| `WorkClothStrip.jsx`   | Work page strip: R3F `WorkClothStripScene`, WebGPU `MeshBasicNodeMaterial` + TSL (WebGL GLSL fallback), arc geometry, scroll/hover, title sync |
| `workStripConfig.js`   | Default visible-items / gap-size fallbacks for the strip                                   |
| `workStripMath.js`     | Scroll slot math: active item index, resolve clicked slot from UV                          |

#### Home / Contact (`src/components/webgl/`)

| Module                 | Purpose                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `UnifiedCanvas.jsx`    | Single R3F canvas host; switches scene branches by `activePage` |
| `GlobalSceneBranches.jsx` | `HomeCanvasBranch` and `ProjectDetailCanvasBranch`          |
| `HomeScene.jsx`        | Home page 3D scene composition                                 |
| `CameraRig.jsx`        | Orbital parallax camera; reads `activePage` for contact offset |
| `EnvironmentSetup.jsx` | HDR environment and background                                 |
| `Particles.jsx`        | Particle system                                                |
| `Effects.jsx`          | Home post-processing                                           |

### Remaining Imperative Modules

| Module                    | Public lifecycle                         | Purpose                                                     |
| ------------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| `scripts/link-hover.js`   | `initLinkHover()` / `destroyLinkHover()` | Hover interaction for link text; haptics via `scripts/haptic-feedback.js`. |
| `scripts/haptic-feedback.js` | `triggerNavHaptic()`                | `navigator.vibrate` on supported devices; dev-only WebHaptics fallback. |
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
- `data/archive-items.js` reserved for a future archive DOM / media layout (not used by the current `ArchiveScene` branch).

## Adding or Changing Pages

1. Add or update the route component under `src/routes/`.
2. Register the route in `src/App.jsx` — add the path to `PATH_TO_NAMESPACE` and `TITLES`.
3. For entirely new page types: add a scene branch inside `UnifiedCanvas.jsx` (and a matching `activePage` value in `App.jsx` / `webgl` store if needed).
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
