import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  optimizeDeps: {
    include: ['postprocessing', 'three'],
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
    },
    assetsInclude: [
      "**/*.jpeg",
      "**/*.jpg",
      "**/*.png",
      "**/*.svg",
      "**/*.gif",
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
