import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  optimizeDeps: {
    include: ['postprocessing', 'three'],
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        work: resolve(__dirname, "work.html"),
        archive: resolve(__dirname, "archive.html"),
        contact: resolve(__dirname, "contact.html"),
        film: resolve(__dirname, "film.html"),
      },
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          barba: ['@barba/core'],
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
    environment: 'happy-dom',
    setupFiles: ['./test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['scripts/**/*.js'],
      exclude: ['scripts/shaders*.js', 'scripts/CRT*.js', 'scripts/data.js']
    },
    testTimeout: 10000,
    mockReset: true
  }
});
