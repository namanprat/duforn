/* eslint-disable no-console */
/**
 * Post-Blender pipeline: run this after replacing public/duforn_website.glb
 * (the raw, uncompressed source export) with a fresh export.
 *
 *   npm run model:update
 *
 * The raw source is NOT served. We compress it to public/duforn_website.compressed.glb
 * (meshopt geometry + WebP textures, ≤2K) and the app loads only that variant
 * (see GLTF_URL_WEBSITE in src/models/urls.ts). Mirrors monitor.compressed.glb.
 *
 * Steps:
 *   1. Verify source GLB exists.
 *   2. Compress source → duforn_website.compressed.glb via @gltf-transform/cli
 *      (meshopt + WebP, --texture-size 2048). Logs before/after sizes.
 *   3. Run gltfjsx as a *validation* on the raw source (parses + decodes), and
 *      assert the compressed output exists and is smaller. Output goes to a temp
 *      file and is discarded — our hand-tuned Website.tsx wrapper uses the
 *      structure-agnostic <primitive> pattern, so per-node JSX regen would just
 *      overwrite our customizations.
 *   4. Rewrite Website.tsx to the canonical template (idempotent — keeps the
 *      decoder-wired `useGLTF` wrapper in sync if drift ever occurs).
 *   5. Nuke Vite cache + dist (forces fresh GLB metadata next dev/build).
 *   6. Run production build to catch any breakage early.
 *
 * Idempotent. Safe to re-run.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import os from "node:os";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE_GLB = path.join(ROOT, "public", "duforn_website.glb");
const COMPRESSED_GLB = path.join(ROOT, "public", "duforn_website.compressed.glb");
const WEBSITE_TSX = path.join(ROOT, "src", "models", "gen", "Website.tsx");

// Max texture dimension after compression (downscale anything larger).
const TEXTURE_SIZE = 2048;

const TOTAL_STEPS = 6;

const WEBSITE_TSX_TEMPLATE = `// @ts-nocheck
/*
 Auto-rewritten by \`npm run model:update\`.
 Regenerate per-node JSX (if you need it) with:
   npx gltfjsx@latest public/duforn_website.compressed.glb -o src/models/gen/Website.tsx

 The served GLB ships meshopt-compressed with WebP textures (built from the raw
 \`public/duforn_website.glb\` source by \`npm run model:update\`). Loaded via the
 shared decoder wiring (Meshopt + KTX2 extension) — same pattern as the monitor.
 The runtime traversal in src/scenes/Main.tsx handles bounds normalization,
 material tuning, and water-mesh discovery — so the wrapper just renders the
 scene as a primitive. Keep that pattern.
*/
import React from "react";
import { useGLTF } from "@react-three/drei";
import { extendGltfLoader, gltfLoaderOptions } from "../loader";
import { GLTF_URL_WEBSITE } from "../urls";

export default function WebsiteModel(props) {
  const { scene } = useGLTF(GLTF_URL_WEBSITE, gltfLoaderOptions, true, extendGltfLoader);

  return <primitive object={scene} {...props} />;
}

useGLTF.preload(GLTF_URL_WEBSITE, gltfLoaderOptions, true, extendGltfLoader);
`;

function step(n, label) {
  console.log(`\n\x1b[36m[${n}/${TOTAL_STEPS}]\x1b[0m ${label}`);
}

function bail(msg) {
  console.error(`\n\x1b[31mFAIL:\x1b[0m ${msg}`);
  process.exit(1);
}

function fmtMb(bytes) {
  return `${(bytes / 1e6).toFixed(1)} MB`;
}

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd: ROOT, ...opts });
  if (res.status !== 0) bail(`\`${cmd} ${args.join(" ")}\` exited ${res.status}`);
}

function main() {
  // 1. Verify source
  step(1, "verify source GLB");
  if (!fs.existsSync(SOURCE_GLB)) {
    bail(`${SOURCE_GLB} not found. Export it from Blender first.`);
  }
  const sourceSize = fs.statSync(SOURCE_GLB).size;
  console.log(`    ✓ ${path.basename(SOURCE_GLB)}  ${fmtMb(sourceSize)}`);

  // 2. Compress source → duforn_website.compressed.glb (meshopt + WebP, ≤2K)
  //    The size win comes from textures (WebP + resize) + meshopt — NOT from
  //    join/flatten/palette/weld/simplify. Those collapse + rename nodes and
  //    would destroy the discrete, named `Water` mesh / `Water liquid` material
  //    that findWaterMesh keys off (breaking the pool water), so we disable them.
  step(2, "compress GLB (meshopt + WebP textures, names preserved)");
  run("npx", [
    "--yes",
    "@gltf-transform/cli",
    "optimize",
    SOURCE_GLB,
    COMPRESSED_GLB,
    "--compress",
    "meshopt",
    "--texture-compress",
    "webp",
    "--texture-size",
    String(TEXTURE_SIZE),
    "--flatten",
    "false",
    "--join",
    "false",
    "--palette",
    "false",
    "--simplify",
    "false",
    "--weld",
    "false",
    "--instance",
    "false",
  ]);
  if (!fs.existsSync(COMPRESSED_GLB)) {
    bail("compression did not produce duforn_website.compressed.glb.");
  }
  const compressedSize = fs.statSync(COMPRESSED_GLB).size;
  if (compressedSize >= sourceSize) {
    bail(
      `compressed file (${fmtMb(compressedSize)}) is not smaller than source ` +
        `(${fmtMb(sourceSize)}). Check the gltf-transform output.`,
    );
  }
  const pct = ((1 - compressedSize / sourceSize) * 100).toFixed(1);
  console.log(
    `    ✓ ${path.basename(COMPRESSED_GLB)}  ${fmtMb(compressedSize)}  (−${pct}% vs source)`,
  );

  // 3. Validate raw source via gltfjsx (output discarded)
  step(3, "validate source GLB with gltfjsx (dry run)");
  const tmp = path.join(os.tmpdir(), `duforn-website-${Date.now()}.tsx`);
  const validation = spawnSync("npx", ["--yes", "gltfjsx@latest", SOURCE_GLB, "-o", tmp], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (validation.status !== 0) {
    console.error(validation.stderr?.toString() || validation.stdout?.toString());
    bail("gltfjsx could not parse the GLB. Check the export.");
  }
  try {
    fs.unlinkSync(tmp);
  } catch {
    /* tmp may live elsewhere — ignore */
  }
  console.log("    ✓ GLB parses cleanly");

  // 4. Restore canonical Website.tsx wrapper
  step(4, "restore canonical Website.tsx wrapper");
  const existing = fs.existsSync(WEBSITE_TSX) ? fs.readFileSync(WEBSITE_TSX, "utf8") : "";
  if (existing.trim() === WEBSITE_TSX_TEMPLATE.trim()) {
    console.log("    ✓ already canonical");
  } else {
    fs.writeFileSync(WEBSITE_TSX, WEBSITE_TSX_TEMPLATE, "utf8");
    console.log("    ✓ rewritten");
  }

  // 5. Clean caches
  step(5, "clean Vite cache + dist");
  for (const dir of ["node_modules/.vite", "dist"]) {
    const p = path.join(ROOT, dir);
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
      console.log(`    ✓ removed ${dir}`);
    } else {
      console.log(`    · ${dir} not present`);
    }
  }

  // 6. Build
  step(6, "production build");
  run("npm", ["run", "build"]);

  console.log("\n\x1b[32m✓ model:update complete\x1b[0m");
  console.log("  next: `npm run dev` and visually verify the room scene.");
  console.log("  reminders:");
  console.log("    • Water mesh name unchanged?  (GLB export name: Water)");
  console.log("    • Camera framing OK?           (see src/lib/cam/roomPoses.ts)");
  console.log("    • Materials look right?        (tune src/scenes/Main.tsx MATERIAL_TUNE)");
}

main();
