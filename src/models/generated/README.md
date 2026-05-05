# Generated GLB components

Run from repo root when a `.glb` changes (paths must match [`gltfUrls.ts`](../gltfUrls.ts)):

```bash
npx gltfjsx@latest public/models/scene.glb -o src/models/generated/SceneModel.tsx
npx gltfjsx@latest public/models/work.glb -o src/models/generated/WorkModel.tsx
npx gltfjsx@latest public/models/project-bg.glb -o src/models/generated/ProjectBgModel.tsx
npx gltfjsx@latest public/monitor.glb -o src/models/generated/MonitorModel.tsx
npx gltfjsx@latest public/models/test.glb -o src/models/generated/TestModel.tsx
```

Add optional `--types`, `--transform` as needed. Keep [`registerPreloads.ts`](./registerPreloads.ts) URL list in sync with new assets.
