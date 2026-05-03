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
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["scripts/**/*.ts", "src/**/*.tsx", "src/**/*.ts"],
      exclude: ["scripts/shaders*.js", "scripts/CRT*.js", "scripts/data.js"],
    },
    testTimeout: 10000,
    mockReset: true,
  },
};

export default defineConfig(config as any);
