# Generated GLB components

Run from repo root when a `.glb` changes (paths must match [`urls.ts`](../urls.ts)):

```bash
npx gltfjsx@latest public/models/scene.glb -o src/models/gen/Scene.tsx
npx gltfjsx@latest public/models/project-bg.glb -o src/models/gen/useProjectBg.ts
npx gltfjsx@latest public/monitor.glb -o src/models/gen/useMonitor.ts
npx gltfjsx@latest public/duforn_website.glb -o src/models/gen/Website.tsx
```

After regenerating, slim the output to the `Scene.tsx` / `Website.tsx` pattern
(`<primitive object={scene} />` + shadow traversal) so the host scene's
`findWaterMesh` / `applyModelMaterialTuning` can traverse the tree cleanly.

Keep [`preloads.ts`](./preloads.ts) URL list in sync with new assets.
