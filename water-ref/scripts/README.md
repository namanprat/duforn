# scripts/

One-shot dev scripts. Not part of the build pipeline unless wired through `package.json`.

## model-update.mjs

Compression pipeline for the website model. Run after replacing
`public/duforn_website.glb` (the raw, uncompressed Blender export) with a fresh
export. The raw source is **not served** — the app loads only the compressed
variant `public/duforn_website.compressed.glb` (see `GLTF_URL_WEBSITE` in
`src/models/urls.ts`), mirroring `monitor.compressed.glb`.

```bash
npm run model:update
```

Steps:

1. Verify `public/duforn_website.glb` exists.
2. Compress it → `public/duforn_website.compressed.glb` with
   `@gltf-transform/cli optimize` (meshopt geometry + WebP textures capped at
   2048px). Logs before/after sizes and bails if it didn't get smaller.
3. Validate the raw source with `gltfjsx` (parses + decodes; output discarded).
4. Restore the canonical `src/models/gen/Website.tsx` wrapper — a
   `useGLTF(GLTF_URL_WEBSITE, gltfLoaderOptions, true, extendGltfLoader)`
   `<primitive>` (Meshopt + KTX2 decoder wiring, same as the monitor). The host
   scene (`src/scenes/Main.tsx`) handles bounds normalization, material tuning,
   and water-mesh discovery via traversal.
5. Clean the Vite cache + `dist/`.
6. Run a production build to catch breakage early.

Textures are downscaled to ≤2K and re-encoded to WebP (three.js loads WebP
natively — no transcoder needed). KTX2/basis is intentionally avoided: the
basis transcoder is not vendored and its `detectSupport` is untested against the
WebGPU renderer. If you need per-node JSX, regenerate it manually from the
compressed file:

```bash
npx gltfjsx@latest public/duforn_website.compressed.glb -o src/models/gen/Website.tsx
```

### HDR downsampling

`home.hdr` / `main.hdr` are RGBE-encoded. To halve them from 2k → 1k, use
Blender's image editor (Image → Save As → set resolution) or the `cmft` CLI.
Replace `home.hdr` / `main.hdr` in place when done.
