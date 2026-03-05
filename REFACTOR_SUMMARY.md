# Refactor Summary

## What Was Refactored
- Added shared runtime helpers:
  - `scripts/runtime/debug.js`
  - `scripts/runtime/dom.js`
  - `scripts/runtime/timing.js`
  - `scripts/runtime/lifecycle.js`
- Replaced duplicated paint-debug logic in:
  - `scripts/preloader.js`
  - `scripts/three.js`
  - `scripts/work.js`
- Replaced ad-hoc resize debounce logic with shared `debounce()` in:
  - `scripts/preloader.js`
  - `scripts/three.js`
  - `scripts/work.js`
  - `scripts/archive.js`
- Modularized archive feature:
  - `scripts/archive.js` now orchestrates
  - `scripts/archive/grid.js`, `scripts/archive/tube.js`, `scripts/archive/ui.js` hold feature internals
- Modularized project canvas helpers:
  - `scripts/project-canvas/dom.js` (container/background/template handoff)
  - `scripts/project-canvas/events.js` (resize/scroll/visibility wiring)
- Extracted work first-frame transition gate state:
  - `scripts/work/transitions.js`
- Simplified route orchestration in `src/App.jsx`:
  - namespace resolver + body class helper
  - route setup/cleanup table instead of nested conditionals

## API Compatibility
- Public route/API contracts are unchanged.
- Preserved named exports used by callers:
  - `initArchive`, `destroyArchive`
  - `initFilm`, `destroyFilm`, `bindFilmTemplateFromTransitionState`
  - `initWork`, `destroyWork`, `startWorkTexturePreload`, `resetWorkFirstFrameGate`, `whenWorkFirstFrame`
  - existing `three.js` exports remain intact

## Risk Controls Applied
- No asset path rewrites.
- No route definition changes.
- Refactor focused on extraction and orchestration simplification (no intended behavior redesign).
