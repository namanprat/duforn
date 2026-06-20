# Performance Baseline and Acceptance Budgets

This file defines the route-by-route measurement checklist and ship budgets for the tightening pass.

## Capture Protocol

- Run production preview (`vp build && vp preview`) for measurements.
- Test on one desktop profile (normal power) and one constrained profile (Chrome CPU throttling 4x).
- Capture each route twice:
  - first visit (cold navigation from home)
  - repeat visit (warm caches)
- Keep the same viewport for comparisons (`1440x900` desktop baseline).

## Route Budgets

### Global (all routes)

- First meaningful paint after route swap: <= `650ms` warm, <= `1100ms` cold.
- Main-thread long task spikes (`>50ms`) during route swap: `<= 2`.
- Input latency (hover/click response) under active animation: <= `100ms`.

### Home

- Average FPS while idle hero + particles: `>= 55` desktop, `>= 40` throttled.
- No visible hitch > `120ms` when nav opens/closes.
- Files:
  - `src/components/webgl/GlobalSceneBranches.tsx`
  - `src/components/textReveal/TextRevealLines.tsx`

### Work

- Average FPS during cloth interaction/scroll: `>= 50` desktop, `>= 36` throttled.
- Frame spikes > `24ms`: <= `10%` sampled frames.
- Files:
  - `src/work/WorkClothStrip.tsx`
  - `src/components/webgl/WorkPageScene.tsx`

### Project Detail

- Average FPS while scrolling image planes: `>= 52` desktop, `>= 36` throttled.
- No sustained jank from DOM-to-WebGL sync (no >`32ms` frame clusters for >`500ms`).
- Files:
  - `src/projectDetail/ProjectDetailImagePlanes.tsx`
  - `src/projectDetail/ProjectBg.tsx`

### Archive

- Same ambient canvas workload as Home (shared `HomeCanvasBranch`); tune against Home budgets.
- Files:
  - `src/routes/ArchivePage.tsx`
  - `src/components/webgl/GlobalSceneBranches.tsx`

### Contact

- No animation-induced long task > `80ms`.
- Email/nav interaction remains instant while background canvas active.
- Files:
  - `src/routes/ContactPage.tsx`
  - `styles.css`

## Measurement Checklist

For each route:

1. Open Chrome Performance panel and record 8-12s while interacting with expected flow.
2. Note:

- FPS range
- worst frame time
- long tasks count
- interaction latency signs

3. Compare against budgets.
4. If failing, annotate root cause and owning file before editing.

## Regression Gate Before Ship

- `vp check` passes (excluding unrelated pre-existing failures).
- All route budgets meet target or have documented accepted exception.
- Reduced motion path verified on Home, Project Detail, Archive.
