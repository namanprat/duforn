<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.

<!--VITE PLUS END-->

## WebGPU-first rendering (site architecture)

The **default** path for 3D is **`WebGPURenderer`** via `createWebGPURenderer.ts` / `UnifiedCanvas.tsx`, with **classic `WebGLRenderer` only as a fallback** when WebGPU is unavailable. AI and human contributors should treat **WebGPU + TSL as the primary target** and only add WebGL-only code when the active `gl` is actually `WebGLRenderer`.

### Rules

1. **Prefer `three/webgpu` + `three/tsl`** for new GPU features: node materials (`MeshBasicNodeMaterial`, etc.), `uniform()`, `Fn()`, `pass()`, and dynamic imports of `three/tsl` / `three/webgpu` in async builders—same style as `InkTransitionOverlay.tsx`, `WorkClothStrip.tsx`, `Particles.tsx`, and `ProjectBg.tsx`.
2. **Full-screen or post-style effects on `WebGPURenderer`**: use **`RenderPipeline`** from `three/webgpu` and **`pass(scene, camera)`** from `three/tsl`, then chain TSL display nodes (including addons under `three/addons/tsl/display/`). Example pattern: fullscreen passes in **`InkTransitionOverlay.tsx`**. **Do not** use `EffectComposer` / `ShaderPass` from `three/examples/jsm/postprocessing/` on `WebGPURenderer`; those are for classic **`WebGLRenderer`** only.
3. **WebGL fallback**: when branching on `isWebGLRenderer(gl)` from `createWebGPURenderer.ts`, `ShaderMaterial`, `EffectComposer`, and legacy post passes are appropriate (e.g. **`ProjectBg.tsx`** WebGL shaders, WebGL branch of `InkTransitionOverlay.tsx`).
4. **Debugging**: use `logWebGPU` / `logWebGPUOnce` from `src/lib/webgpu/debugWebGPU.ts` for WebGPU build paths. The app applies `patchThreeTSL` at startup (`src/lib/webgpu/patchThreeTSL.ts`); do not assume raw three.js behavior without checking project patches.
5. **Integration**: effects belong in the same R3F canvas as the scene (`UnifiedCanvas`); use `isWebGPURenderer` / `isWebGLRenderer` / `getRendererType` to pick the correct implementation.

If a feature is implemented WebGL-only while the unified canvas is on WebGPU, that is a **bug** unless explicitly scoped to the fallback path.
