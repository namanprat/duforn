# Cleanup Notes

## Frozen Non-goals
- No visual redesign.
- No route path changes.
- No asset URL changes.

## Behavior Checklist
- Home: preloader + base WebGL startup/model swap preserved.
- Work: strip interaction flow and transition gate preserved.
- Archive: tube/grid/logo runtime preserved.
- Film: template handoff (`title`, `cover image`) preserved.
- Global: menu/link hover lifecycle untouched.

## Modules Touched
- `scripts/runtime/*` (new shared utilities)
- `scripts/archive.js`
- `scripts/archive/grid.js` (new)
- `scripts/archive/tube.js` (new)
- `scripts/archive/ui.js` (new)
- `scripts/project-canvas.js`
- `scripts/project-canvas/dom.js` (new)
- `scripts/project-canvas/events.js` (new)
- `scripts/preloader.js`
- `scripts/three.js`
- `scripts/work.js`
- `scripts/work/transitions.js` (new)
- `src/App.jsx`
