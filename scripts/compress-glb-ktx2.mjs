#!/usr/bin/env node
/**
 * Shrink a GLB's embedded textures and re-apply Draco geometry compression.
 *
 * Default format is WebP: three.js / GLTFLoader decode image/webp natively with
 * no extra loader setup, so the model "just loads" via useGLTF. (KTX2 would be
 * smaller on-GPU but requires a KTX2Loader wired into every useGLTF/preload call
 * — the app only wires KTX2 for its standalone WebP→KTX2 texture path, so a KTX2
 * model throws "setKTX2Loader must be called before loading KTX2 textures".)
 *
 * Usage: node scripts/compress-glb-ktx2.mjs <input.glb> <output.glb> [maxDim] [format]
 *        format: webp (default) | ktx2
 */
import fs from "node:fs";
import { NodeIO } from "@gltf-transform/core";
import { KHRDracoMeshCompression, KHRTextureBasisu, KHRTextureTransform } from "@gltf-transform/extensions";
import { draco, textureCompress } from "@gltf-transform/functions";
import draco3d from "draco3d";
import sharp from "sharp";

const [input, output, maxDimArg, formatArg] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: compress-glb-ktx2.mjs <input.glb> <output.glb> [maxDim] [webp|ktx2]");
  process.exit(1);
}
const MAX_DIM = Number(maxDimArg) || 1024;
const FORMAT = formatArg || "webp";

const io = new NodeIO()
  .registerExtensions([KHRDracoMeshCompression, KHRTextureBasisu, KHRTextureTransform])
  .registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
    "draco3d.encoder": await draco3d.createEncoderModule(),
  });

console.log(`reading ${input} (${(fs.statSync(input).size / 1048576).toFixed(1)} MB), format=${FORMAT}, maxDim=${MAX_DIM}`);
const doc = await io.read(input);

if (FORMAT === "webp") {
  await doc.transform(
    textureCompress({ encoder: sharp, targetFormat: "webp", resize: [MAX_DIM, MAX_DIM], quality: 90 }),
    draco({ method: "edgebreaker" }),
  );
} else {
  // KTX2 path left available but requires the app to wire a KTX2Loader into useGLTF.
  const { encodeToKTX2 } = await import("ktx2-encoder");
  doc.createExtension(KHRTextureBasisu).setRequired(true);
  const pad4 = (data, w, h, c = 4) => {
    const pw = Math.ceil(w / 4) * 4, ph = Math.ceil(h / 4) * 4;
    if (pw === w && ph === h) return { width: w, height: h, data: new Uint8Array(data) };
    const out = new Uint8Array(pw * ph * c);
    for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
      const s = (Math.min(y, h - 1) * w + Math.min(x, w - 1)) * c;
      out.set(data.subarray(s, s + c), (y * pw + x) * c);
    }
    return { width: pw, height: ph, data: out };
  };
  const imageDecoder = async (buf) => {
    const { data, info } = await sharp(buf).resize(MAX_DIM, MAX_DIM, { fit: "inside", withoutEnlargement: true }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    return pad4(data, info.width, info.height);
  };
  for (const tex of doc.getRoot().listTextures()) {
    const img = tex.getImage(); if (!img) continue;
    const k = await encodeToKTX2(new Uint8Array(img), { imageDecoder, isKTX2File: true, generateMipmap: false, isPerceptual: true, isSetKTX2SRGBTransferFunc: true, isYFlip: false, isUASTC: false, qualityLevel: 255, compressionLevel: 4 });
    tex.setImage(new Uint8Array(k)).setMimeType("image/ktx2");
  }
  await doc.transform(draco({ method: "edgebreaker" }));
}

await io.write(output, doc);
console.log(`wrote ${output} (${(fs.statSync(output).size / 1048576).toFixed(1)} MB)`);
