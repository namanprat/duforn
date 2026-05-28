# scripts/

One-shot dev scripts. Not part of the build pipeline unless wired through `package.json`.

## compress-assets.ts

Recompresses the four GLB files in `public/` for production delivery.

```bash
npm install              # installs @gltf-transform/*, meshoptimizer, sharp, tsx
npm run compress-assets
```

Outputs `<name>.compressed.glb` next to each source. To switch the app over:

1. Inspect sizes (`ls -lh public/*.glb public/models/*.glb`).
2. A/B test visual fidelity in dev.
3. Edit `src/models/urls.ts` to point each `GLTF_URL_*` at the `.compressed.glb`
   version (or rename the originals out of the way).

The script is idempotent and slow (texture re-encoding dominates). Re-run only
when source assets change.

### HDR downsampling

`home.hdr` / `main.hdr` are RGBE-encoded; sharp can't decode them. To halve them
from 2k → 1k, use Blender's image editor (Image → Save As → set resolution) or
the `cmft` CLI. Replace `home.hdr` / `main.hdr` in place when done.
