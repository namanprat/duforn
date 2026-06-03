/* eslint-disable no-console */
/**
 * Post-Blender pipeline: run this after replacing public/duforn_website.glb
 * with a fresh export. Simple gltfjsx pipeline — no compression.
 *
 *   npm run model:update
 *
 * Steps:
 *   1. Verify source GLB exists.
 *   2. Run gltfjsx as a *validation* (parses + decodes the GLB). Output goes
 *      to a temp file and is discarded — our hand-tuned Website.tsx wrapper
 *      uses the structure-agnostic <primitive> pattern, so per-node JSX
 *      regen would just overwrite our customizations.
 *   3. Rewrite Website.tsx to the canonical template (idempotent — keeps the
 *      plain `useGLTF` wrapper in sync if drift ever occurs).
 *   4. Nuke Vite cache + dist (forces fresh GLB metadata next dev/build).
 *   5. Run production build to catch any breakage early.
 *
 * Idempotent. Safe to re-run.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import os from "node:os";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE_GLB = path.join(ROOT, "public", "duforn_website.glb");
const WEBSITE_TSX = path.join(ROOT, "src", "models", "gen", "Website.tsx");

const TOTAL_STEPS = 5;

const WEBSITE_TSX_TEMPLATE = `// @ts-nocheck
/*
 Auto-rewritten by \`npm run model:update\`.
 Regenerate per-node JSX (if you need it) with:
   npx gltfjsx@latest public/duforn_website.glb -o src/models/gen/Website.tsx

 Plain gltfjsx pipeline — the GLB ships uncompressed and is loaded with a
 vanilla \`useGLTF\` (no Draco / Meshopt / KTX2 decoders). The runtime traversal
 in src/scenes/Main.tsx handles bounds normalization, material tuning, and
 water-mesh discovery — so the wrapper just renders the scene as a primitive.
 Keep that pattern.
*/
import React from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF_URL_WEBSITE } from "../urls";

export default function WebsiteModel(props) {
  const { scene } = useGLTF(GLTF_URL_WEBSITE);

  return <primitive object={scene} {...props} />;
}

useGLTF.preload(GLTF_URL_WEBSITE);
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

  // 2. Validate via gltfjsx (output discarded)
  step(2, "validate GLB with gltfjsx (dry run)");
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

  // 3. Restore canonical Website.tsx wrapper
  step(3, "restore canonical Website.tsx wrapper");
  const existing = fs.existsSync(WEBSITE_TSX) ? fs.readFileSync(WEBSITE_TSX, "utf8") : "";
  if (existing.trim() === WEBSITE_TSX_TEMPLATE.trim()) {
    console.log("    ✓ already canonical");
  } else {
    fs.writeFileSync(WEBSITE_TSX, WEBSITE_TSX_TEMPLATE, "utf8");
    console.log("    ✓ rewritten");
  }

  // 4. Clean caches
  step(4, "clean Vite cache + dist");
  for (const dir of ["node_modules/.vite", "dist"]) {
    const p = path.join(ROOT, dir);
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
      console.log(`    ✓ removed ${dir}`);
    } else {
      console.log(`    · ${dir} not present`);
    }
  }

  // 5. Build
  step(5, "production build");
  run("npm", ["run", "build"]);

  console.log("\n\x1b[32m✓ model:update complete\x1b[0m");
  console.log("  next: `npm run dev` and visually verify the room scene.");
  console.log("  reminders:");
  console.log("    • Water mesh name unchanged?  (GLB export name: Water)");
  console.log("    • Camera framing OK?           (see src/lib/cam/roomPoses.ts)");
  console.log("    • Materials look right?        (tune src/scenes/Main.tsx MATERIAL_TUNE)");
}

main();
