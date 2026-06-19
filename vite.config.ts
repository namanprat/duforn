import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";

const config = {
  plugins: [react()],
  optimizeDeps: {
    include: ["three", "postprocessing", "n8ao"],
  },
  resolve: {
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
