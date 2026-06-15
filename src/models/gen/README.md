# Generated GLB components

Run from repo root when a `.glb` changes (paths must match [`urls.ts`](../urls.ts)):

```bash
npx gltfjsx@latest public/models/project-bg.glb -o src/models/gen/useProjectBg.ts
npx gltfjsx@latest public/monitor.glb -o src/models/gen/useMonitor.ts
npx gltfjsx@latest public/duforn_website.compressed.glb -o src/models/gen/Website.tsx
```

The website model is the exception: don't replace its `.glb` by hand. Drop a
fresh raw export at `public/duforn_website.glb` and run `npm run model:update`,
which compresses it to `public/duforn_website.compressed.glb` (meshopt + WebP)
and restores the canonical `Website.tsx` wrapper. The wrapper loads the
compressed file with the shared Meshopt + KTX2 decoder wiring
(`useGLTF(GLTF_URL_WEBSITE, gltfLoaderOptions, true, extendGltfLoader)`), same
as the monitor.

After regenerating, slim the output to the `Website.tsx` pattern
(`<primitive object={scene} />` + shadow traversal) so the host scene's
`applyModelMaterialTuning` can traverse the tree cleanly.

Keep [`preloads.ts`](./preloads.ts) URL list in sync with new assets.
