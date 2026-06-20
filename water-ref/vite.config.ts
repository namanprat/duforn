import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";

const config = {
  staged: { "{src,scripts}/**/*.{ts,tsx}": "vp check --fix" },
  plugins: [react()],
  optimizeDeps: {
    include: ["three", "three/webgpu", "three/tsl"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three/")) return "three";
          if (id.includes("node_modules/gsap/")) return "gsap";
          if (id.includes("node_modules/@theatre/")) return "theatre";
          if (id.includes("node_modules/@react-three/")) return "r3f";
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router-dom/")
          )
            return "react";
        },
      },
    },
    assetsInclude: [
      "**/*.jpeg",
      "**/*.jpg",
      "**/*.png",
      "**/*.svg",
      "**/*.gif",
      "**/*.glb",
      "**/*.gltf",
      "**/*.hdr",
      "**/*.webp",
    ],
    copyPublicDir: true,
  },
};

export default defineConfig(config as any);
