import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";

const root = path.dirname(fileURLToPath(import.meta.url));

const config = {
  plugins: [react()],
  optimizeDeps: {
    include: ["three-original", "postprocessing", "n8ao"],
  },
  resolve: {
    alias: [
      { find: /^three$/, replacement: path.resolve(root, "src/lib/threeShim.ts") },
      {
        find: "three-original",
        replacement: path.resolve(root, "node_modules/three/build/three.module.js"),
      },
    ],
    dedupe: ["three", "postprocessing"],
  },
  build: {
    assetsInclude: [
      "**/*.png",
      "**/*.jpg",
      "**/*.jpeg",
      "**/*.webp",
      "**/*.svg",
      "**/*.glb",
      "**/*.gltf",
      "**/*.hdr",
      "**/*.woff2",
    ],
    copyPublicDir: true,
  },
};

export default defineConfig(config as any);
