import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["three"],
  },
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          gsap: ["gsap"],
          r3f: ["@react-three/fiber", "@react-three/drei"],
          react: ["react", "react-dom", "react-router-dom"],
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
