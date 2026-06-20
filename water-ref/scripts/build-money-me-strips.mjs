/**
 * Rebuild strip-01..05.png from individual UI screens (UI chrome only, no page copy).
 * Requires: npm install sharp --save-dev
 * Run: node scripts/build-money-me-strips.mjs
 */
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public", "money-me");
const configPath = path.join(root, "src/projectDetail/moneyMeStrips/config.ts");
const screenWidth = 460;
const outWidth = screenWidth;

async function readStackGapPx() {
  const configSrc = await readFile(configPath, "utf8");
  const match = configSrc.match(/STRIP_STACK_GAP_PX\s*=\s*(\d+)/);
  return match ? Number(match[1]) : 8;
}

/** Each strip: ordered screen filenames stacked top-to-bottom. */
const STRIP_SOURCES = [
  ["Onboarding.webp", "Set-budgets.webp", "Allocate-budget.webp"],
  ["Dashboard.webp", "Breakdown.webp"],
  ["Card-page.webp", "Pay.webp"],
  ["Bill.webp", "Search.webp", "Transaction.webp"],
  ["Set-budgets.webp", "Dashboard.webp", "Onboarding.webp"],
];

async function loadSharp() {
  try {
    return (await import("sharp")).default;
  } catch {
    console.error("Install sharp: npm install sharp --save-dev");
    process.exit(1);
  }
}

async function stackStrip(sharp, sources, gap) {
  const resized = [];
  for (const file of sources) {
    const input = path.join(publicDir, file);
    const buf = await readFile(input);
    const img = sharp(buf).resize({ width: screenWidth, withoutEnlargement: true });
    const meta = await img.metadata();
    resized.push({
      buffer: await img.png().toBuffer(),
      height: meta.height ?? 0,
    });
  }

  const totalH =
    resized.reduce((sum, r) => sum + r.height, 0) + gap * Math.max(0, resized.length - 1);
  const canvas = sharp({
    create: {
      width: outWidth,
      height: totalH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  const composites = [];
  let y = 0;
  for (const part of resized) {
    const x = Math.round((outWidth - screenWidth) / 2);
    composites.push({ input: part.buffer, left: x, top: y });
    y += part.height + gap;
  }

  return canvas.composite(composites).png();
}

async function main() {
  const sharp = await loadSharp();
  const gap = await readStackGapPx();
  await mkdir(publicDir, { recursive: true });

  for (let i = 0; i < STRIP_SOURCES.length; i++) {
    const outPath = path.join(publicDir, `strip-0${i + 1}.png`);
    const pipeline = await stackStrip(sharp, STRIP_SOURCES[i], gap);
    await pipeline.toFile(outPath);
    const meta = await sharp(outPath).metadata();
    console.log(`Wrote ${outPath} (${meta.width}×${meta.height})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
