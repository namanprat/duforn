import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["three", "three/webgpu", "three/tsl"],
  },
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
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
    setupFiles: ["./test/setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["scripts/**/*.js", "src/**/*.jsx", "src/**/*.js"],
      exclude: ["scripts/shaders*.js", "scripts/CRT*.js", "scripts/data.js"],
    },
    testTimeout: 10000,
    mockReset: true,
  },
});
