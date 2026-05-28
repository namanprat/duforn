/* eslint-disable no-console */
/**
 * One-shot asset compression for the duforn site.
 *
 * Run via: `npm run compress-assets`
 *
 * Pipeline per GLB:
 *  1. dedup + prune + weld   — remove redundant data
 *  2. textureCompress         — resize textures (max 2048 / 1024 mobile-baked) + re-encode webp
 *  3. meshopt encode          — geometry compression (loaded automatically by drei useGLTF)
 *
 * Outputs *.compressed.glb alongside the originals. Update src/models/urls.ts
 * to point at the .compressed.glb files (or rename them in place).
 *
 * Idempotent and slow — do NOT wire into `build`.
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions";
import { dedup, prune, weld, textureCompress } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

type Target = {
  input: string;
  output: string;
  textureMax: number;
};

const PUBLIC_DIR = path.resolve(process.cwd(), "public");

// scene.glb + project-bg.glb are already small (3.4 MB / 6 MB) and trip the
// MeshoptDecoder filter init on read (`DT_FLOAT32` error). Not worth fighting —
// served as-is. The big wins are duforn_website (505 → 27 MB) and monitor (23 → 1.1 MB).
const TARGETS: Target[] = [
  {
    input: path.join(PUBLIC_DIR, "duforn_website.glb"),
    output: path.join(PUBLIC_DIR, "duforn_website.compressed.glb"),
    textureMax: 2048,
  },
  {
    input: path.join(PUBLIC_DIR, "monitor.glb"),
    output: path.join(PUBLIC_DIR, "monitor.compressed.glb"),
    textureMax: 1024,
  },
];

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function compressOne(target: Target): Promise<void> {
  if (!(await fileExists(target.input))) {
    console.warn(`[skip] ${target.input} (not found)`);
    return;
  }

  const stat = await fs.stat(target.input);
  console.log(`\n[start] ${path.basename(target.input)}  ${(stat.size / 1e6).toFixed(1)} MB`);

  await MeshoptEncoder.ready;
  await MeshoptDecoder.ready;

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    "meshopt.decoder": MeshoptDecoder,
    "meshopt.encoder": MeshoptEncoder,
  });

  const doc = await io.read(target.input);

  await doc.transform(
    weld(),
    dedup(),
    prune({ keepLeaves: false, keepAttributes: false }),
    textureCompress({
      encoder: sharp,
      targetFormat: "webp",
      resize: [target.textureMax, target.textureMax],
      quality: 85,
    }),
  );

  // Meshopt geometry compression — drei useGLTF auto-loads MeshoptDecoder, so consumers
  // need no extra wiring. Smaller than Draco for typical scenes; faster to decode.
  // Wrapped in try/catch: some accessor configurations trip a known encoder edge case
  // (`Cannot read properties of undefined (reading 'DT_FLOAT32')`). For small GLBs the
  // texture-compression pass already gives most of the win — fall back gracefully.
  try {
    doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({
      method: EXTMeshoptCompression.EncoderMethod.QUANTIZE,
    });
    await io.write(target.output, doc);
  } catch (err) {
    console.warn(
      `[warn]  meshopt encode failed for ${path.basename(target.input)}, ` +
        `writing without geometry compression: ${err instanceof Error ? err.message : err}`,
    );
    const doc2 = await io.read(target.input);
    await doc2.transform(
      weld(),
      dedup(),
      prune({ keepLeaves: false, keepAttributes: false }),
      textureCompress({
        encoder: sharp,
        targetFormat: "webp",
        resize: [target.textureMax, target.textureMax],
        quality: 85,
      }),
    );
    await io.write(target.output, doc2);
  }

  const newStat = await fs.stat(target.output);
  const ratio = ((1 - newStat.size / stat.size) * 100).toFixed(1);
  console.log(
    `[done]  ${path.basename(target.output)}  ${(newStat.size / 1e6).toFixed(1)} MB  (-${ratio}%)`,
  );
}

async function downsampleHdr(input: string, output: string, targetWidth: number): Promise<void> {
  if (!(await fileExists(input))) {
    console.warn(`[skip] ${input} (not found)`);
    return;
  }
  // .hdr files are RGBE-encoded; sharp doesn't read them. Leave a TODO marker.
  // Recommended manual step: use `cmft` or Blender to bake a half-resolution .hdr.
  console.log(
    `[hdr]   ${path.basename(input)} → ${path.basename(output)}  ` +
      `(targetWidth=${targetWidth}) — manual step required; sharp cannot decode RGBE`,
  );
}

async function main(): Promise<void> {
  for (const target of TARGETS) {
    try {
      await compressOne(target);
    } catch (err) {
      console.error(`[fail]  ${target.input}:`, err instanceof Error ? err.message : err);
    }
  }

  await downsampleHdr(
    path.join(PUBLIC_DIR, "home.hdr"),
    path.join(PUBLIC_DIR, "home.1k.hdr"),
    1024,
  );
  await downsampleHdr(
    path.join(PUBLIC_DIR, "main.hdr"),
    path.join(PUBLIC_DIR, "main.1k.hdr"),
    1024,
  );

  console.log("\nDone. src/models/urls.ts already points at the compressed variants.");
}

void main();
