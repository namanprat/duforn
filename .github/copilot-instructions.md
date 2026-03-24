# Contributing to Duforn Portfolio

High-performance portfolio built as a React SPA with route-driven Three.js runtimes, GSAP motion, and selective React Three Fiber usage.

## Setup

```bash
git clone <repo-url>
cd duforn
npm install
npm run dev        # http://localhost:5173
```

## Commands

| Command                 | Purpose                     |
| ----------------------- | --------------------------- |
| `npm run dev`           | Development server          |
| `npm run host`          | Dev server on LAN           |
| `npm run build`         | Production build to `dist/` |
| `npm run preview`       | Preview production build    |
| `npm test`              | Run unit tests (Vitest)     |
| `npm run test:ui`       | Tests with browser UI       |
| `npm run test:coverage` | Tests with coverage report  |

## Current Structure

```text
index.html                # Single Vite entry point
styles.css                # Global styles
vite.config.js            # Vite + Vitest config

src/
├── main.jsx              # React bootstrap + model preload side effects
├── App.jsx               # Route definitions + page runtime lifecycle
├── routes/               # Route components
├── components/           # React layout/components
├── lib/animation/        # React-side transition helpers
├── work/                 # React Three Fiber work-strip surface
└── models/               # gltfjsx-generated model components

scripts/
├── three.js              # Shared base WebGL runtime
├── work.js               # Work page imperative runtime
├── archive.js            # Archive page imperative runtime
├── project-canvas.js     # Film page imperative runtime
├── menu.js, link-hover.js, lenis-scroll.js, preloader.js
└── runtime/              # Shared runtime utilities, including asset helpers

data/
├── work-items.js
└── archive-items.js
```

## Conventions

### Lifecycle Ownership

- `src/App.jsx` is the lifecycle coordinator for imperative page runtimes.
- Keep page-specific scene setup in dedicated modules under `scripts/` with clear `init` and `destroy` APIs.
- Always remove listeners, cancel RAFs, dispose renderer resources, and guard against double init.

### Asset Loading

- Centralize GLTF loading through `scripts/preloader.js`.
- Centralize texture configuration and fallback logic through `scripts/runtime/assets.js`.
- Use root-relative paths for files in `public/`, for example `/models/logo.glb`.

### gltfjsx

- Generated model components live in `src/models/`.
- `src/models/preload.js` imports those files for `useGLTF.preload()` side effects.
- Prefer gltfjsx components for React-owned render trees. Do not push them into imperative `scripts/*.js` modules unless the page is being actively migrated to React rendering.

### React vs Imperative Code

- If a feature already lives comfortably in React, keep it there.
- If a page depends on an existing imperative Three runtime, clean that runtime up rather than layering unrelated abstractions over it.
- When consolidating files, prioritize shared helpers over merging unrelated page modules.

## Validation

- Run `npm test` after changing shared helpers or route lifecycle logic.
- Run `npm run build` before finishing substantial work.
- Manually verify navigation across home, work, archive, film, and contact after WebGL lifecycle changes.
