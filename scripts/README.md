# scripts/

One-shot dev scripts. Not part of the build pipeline unless wired through `package.json`.

## model-update.mjs

Simple gltfjsx pipeline for the website model. Run after replacing
`public/duforn_website.glb` with a fresh Blender export.

```bash
npm run model:update
```

Steps:

1. Verify `public/duforn_website.glb` exists.
2. Validate it with `gltfjsx` (parses + decodes; output discarded).
3. Restore the canonical `src/models/gen/Website.tsx` wrapper — a plain
   `useGLTF(GLTF_URL_WEBSITE)` `<primitive>` (no Draco / Meshopt / KTX2). The
   host scene (`src/scenes/Main.tsx`) handles bounds normalization, material
   tuning, and water-mesh discovery via traversal.
4. Clean the Vite cache + `dist/`.
5. Run a production build to catch breakage early.

The GLB ships uncompressed — there is no separate compression step. If you need
per-node JSX, regenerate it manually:

```bash
npx gltfjsx@latest public/duforn_website.glb -o src/models/gen/Website.tsx
```

### HDR downsampling

`home.hdr` / `main.hdr` are RGBE-encoded. To halve them from 2k → 1k, use
Blender's image editor (Image → Save As → set resolution) or the `cmft` CLI.
Replace `home.hdr` / `main.hdr` in place when done.
