#!/usr/bin/env node
/**
 * Compress a GLB's embedded textures to WebP (lossy) in place, preserving Draco
 * geometry. The baked lighting textures are the bulk of the file; PNG -> WebP
 * cuts download size dramatically with no app changes (three loads WebP natively).
 *
 * Usage: node scripts/compress-scene-glb.mjs [in.glb] [out.glb] [quality]
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { textureCompress } from "@gltf-transform/functions";
import draco3d from "draco3d";
import sharp from "sharp";
import fs from "node:fs";

const inPath = process.argv[2] ?? "public/main_scene.glb";
const outPath = process.argv[3] ?? inPath;
const quality = Number(process.argv[4] ?? 85);

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "draco3d.decoder": await draco3d.createDecoderModule(),
  "draco3d.encoder": await draco3d.createEncoderModule(),
});

const before = fs.statSync(inPath).size;
const doc = await io.read(inPath);

await doc.transform(
  textureCompress({ encoder: sharp, targetFormat: "webp", quality, effort: 6 }),
);

await io.write(outPath, doc);
const after = fs.statSync(outPath).size;
const mb = (n) => (n / 1048576).toFixed(1);
console.log(
  `${inPath} -> ${outPath}\n  ${mb(before)} MB -> ${mb(after)} MB  (${(
    (1 - after / before) *
    100
  ).toFixed(0)}% smaller, webp q${quality})`,
);
