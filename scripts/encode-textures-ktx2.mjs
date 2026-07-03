#!/usr/bin/env node
/**
 * Encode all WEBP files under public/media to sibling .ktx2 (Basis).
 * Runtime tries .ktx2 first via loadTextureAsset(); originals stay as fallback.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { encodeToKTX2 } from "ktx2-encoder";

const root = path.dirname(fileURLToPath(import.meta.url));
const mediaRoot = path.resolve(root, "../public/media");
const force = process.argv.includes("--force");

/**
 * Cap the longest edge before encoding. Source heroes run up to 6480×4860,
 * far past what a screen-mapped GPU texture needs, and ETC1S is a fixed-ratio
 * block format so bytes scale with pixels — encoding at source resolution is
 * what ballooned the old UASTC output. 2048 keeps full-screen heroes crisp
 * while landing every file under its source WebP. Smaller images are untouched.
 */
const MAX_DIM = 2048;

/** Basis ETC1S/UASTC requires multiple-of-four dimensions; edge-replicate pad. */
function padToMultipleOfFour(data, width, height, channels = 4) {
  const padW = Math.ceil(width / 4) * 4;
  const padH = Math.ceil(height / 4) * 4;
  if (padW === width && padH === height) return { width, height, data: new Uint8Array(data) };

  const padded = new Uint8Array(padW * padH * channels);
  for (let y = 0; y < padH; y++) {
    const srcY = Math.min(y, height - 1);
    for (let x = 0; x < padW; x++) {
      const srcX = Math.min(x, width - 1);
      const srcIdx = (srcY * width + srcX) * channels;
      const dstIdx = (y * padW + x) * channels;
      padded.set(data.subarray(srcIdx, srcIdx + channels), dstIdx);
    }
  }
  return { width: padW, height: padH, data: padded };
}

async function imageDecoder(buffer) {
  const { data, info } = await sharp(buffer)
    .resize(MAX_DIM, MAX_DIM, { fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return padToMultipleOfFour(data, info.width, info.height);
}

function findWebps(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findWebps(full));
    else if (/\.webp$/i.test(entry.name)) results.push(full);
  }
  return results;
}

async function encodeWebp(input) {
  const buf = fs.readFileSync(input);
  // ETC1S, not UASTC: UASTC is ~1 byte/px and made every .ktx2 3-13x larger
  // than its WebP. ETC1S at max quality (qualityLevel 255) stays visually clean
  // on full-screen heroes while landing well under WebP once MAX_DIM is applied.
  return encodeToKTX2(new Uint8Array(buf), {
    imageDecoder,
    isKTX2File: true,
    generateMipmap: false,
    isPerceptual: true,
    isSetKTX2SRGBTransferFunc: true,
    isYFlip: true, // match OpenGL bottom-origin; flipY is ignored on compressed GPU upload
    isUASTC: false,
    qualityLevel: 255,
    compressionLevel: 4,
  });
}

const webps = findWebps(mediaRoot);
if (webps.length === 0) {
  console.log("No WEBPs under public/media");
  process.exit(0);
}

let ok = 0;
let skipped = 0;
for (const input of webps) {
  const output = input.replace(/\.webp$/i, ".ktx2");
  const rel = path.relative(path.resolve(root, ".."), output);

  if (
    !force &&
    fs.existsSync(output) &&
    fs.statSync(output).mtimeMs >= fs.statSync(input).mtimeMs
  ) {
    console.log(`skip ${rel}`);
    skipped++;
    ok++;
    continue;
  }

  process.stdout.write(`→ ${rel} … `);
  try {
    const buf = fs.readFileSync(input);
    const ktx2 = await encodeWebp(input);
    fs.writeFileSync(output, ktx2);
    const inKb = (buf.length / 1024).toFixed(0);
    const outKb = (ktx2.length / 1024).toFixed(0);
    console.log(`${inKb}KB → ${outKb}KB (etc1s)`);
    ok++;
  } catch (err) {
    console.log("failed");
    console.error(err);
    process.exit(1);
  }
}

console.log(`Encoded ${ok - skipped} new, ${skipped} skipped, ${ok}/${webps.length} total.`);
