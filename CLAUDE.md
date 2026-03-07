# CLAUDE.md

This repository is a React SPA served by Vite, with route-specific imperative Three.js runtimes managed from the React app shell.

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
- `src/App.jsx` is the route and lifecycle orchestrator.

### Route Model

Routes are handled by React Router:

- `/` → `src/routes/HomePage.jsx`
- `/work` → `src/routes/WorkPage.jsx`
- `/contact` → `src/routes/ContactPage.jsx`
- `/archive` → `src/routes/ArchivePage.jsx`
- `/film` → `src/routes/FilmPage.jsx`

### Imperative Scene Modules

The app still uses imperative Three.js/GSAP runtimes for several pages. `src/App.jsx` is responsible for starting and destroying them as routes change.

| Module | Public lifecycle | Purpose |
| --- | --- | --- |
| `scripts/three.js` | `webgl()` / `destroyWebgl()` | Shared base WebGL scene for home, contact, and work. |
| `scripts/work.js` | `initWork()` / `destroyWork()` | Work page gallery runtime layered over the base scene. |
| `scripts/archive.js` | `initArchive()` / `destroyArchive()` | Archive page renderer/composer lifecycle. |
| `scripts/project-canvas.js` | `initFilm()` / `destroyFilm()` | Film page shader background and image plane runtime. |
| `scripts/menu.js` | `initMenu()` / `destroyMenu()` | Global navigation overlay. |
| `scripts/link-hover.js` | `initLinkHover()` / `destroyLinkHover()` | Hover interaction effect for link text. |
| `scripts/lenis-scroll.js` | `initLenis()` / `destroyLenis()` | Smooth scrolling for film/detail views. |

Guard all runtime modules against double init and always remove listeners, cancel RAFs, and dispose renderer resources in destroy paths.

## Asset Pipeline

### GLTF Loading

- `scripts/preloader.js` owns the shared `GLTFLoader` and `DRACOLoader` setup.
- Reuse cached GLTF assets through the preloader instead of creating page-local loaders.
- If multiple scenes need the same asset, clone from the cached parse result rather than reparsing the file.

### Texture Loading

- Shared texture helpers live in `scripts/runtime/assets.js`.
- Reuse `configureTexture()` and `loadTextureAsset()` instead of hand-rolling color space, mipmap, filter, and fallback setup in each page module.

### gltfjsx

- Generated React model components live under `src/models/`.
- These files are generated from `public/models/*.glb` and currently serve two purposes:
  - `useGLTF.preload()` side effects via `src/models/preload.js`
  - future React-owned model rendering surfaces
- Do not force gltfjsx components into imperative Three.js modules. Use them when React owns the render tree.

## Data Sources

- `data/work-items.js` drives work page media and related React/Fiber surfaces.
- `data/archive-items.js` drives archive page media.

## Adding or Changing Pages

1. Add or update the route component under `src/routes/`.
2. Register the route in `src/App.jsx`.
3. If the page needs an imperative runtime, add a clear init/destroy pair in `scripts/` and wire it into the route lifecycle helpers in `src/App.jsx`.
4. If the page is React-owned, prefer React components over new imperative globals.

## Testing

- Vitest uses `happy-dom` and `test/setup.js`.
- Keep at least a smoke-level regression test for shared utilities or route-critical behavior.
- Run `npm test` and `npm run build` after meaningful runtime or asset-pipeline changes.

## Performance Rules

- Cap pixel ratio where the runtime already does so.
- Use shared debounce helpers from `scripts/runtime/timing.js` for resize and scroll work.
- Avoid duplicate asset loads.
- Prefer cached DOM lookups and named event handlers in imperative modules.

## Asset Paths

Files under `public/` are served from the root URL. Use `/models/work.glb`, `/home.hdr`, and similar root-relative paths.
