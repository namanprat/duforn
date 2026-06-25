import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin, ViteDevServer } from "vite";
import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";

const root = path.dirname(fileURLToPath(import.meta.url));
const archiveDir = path.resolve(root, "public/media/archive");
const virtualId = "virtual:archive-media";
const resolvedVirtualId = "\0" + virtualId;
const mediaPattern = /\.(webp|webm)$/i;

function scanArchiveMediaUrls(dir: string, urlBase = "/media/archive"): string[] {
  if (!fs.existsSync(dir)) return [];

  const urls: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      urls.push(...scanArchiveMediaUrls(fullPath, `${urlBase}/${entry.name}`));
      continue;
    }
    if (!mediaPattern.test(entry.name)) continue;
    const urlPath = `${urlBase}/${entry.name.split(path.sep).join("/")}`;
    urls.push(encodeURI(urlPath));
  }

  return urls.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

function archiveMediaPlugin(): Plugin {
  let server: ViteDevServer | undefined;

  const invalidate = () => {
    if (!server) return;
    const mod = server.moduleGraph.getModuleById(resolvedVirtualId);
    if (mod) void server.reloadModule(mod);
  };

  return {
    name: "archive-media",
    configureServer(devServer) {
      server = devServer;
      if (fs.existsSync(archiveDir)) {
        devServer.watcher.add(archiveDir);
        devServer.watcher.on("add", (file) => mediaPattern.test(file) && invalidate());
        devServer.watcher.on("unlink", (file) => mediaPattern.test(file) && invalidate());
      }
    },
    resolveId(id) {
      if (id === virtualId) return resolvedVirtualId;
    },
    load(id) {
      if (id !== resolvedVirtualId) return;
      return `export default ${JSON.stringify(scanArchiveMediaUrls(archiveDir))}`;
    },
  };
}

const config = {
  plugins: [react(), archiveMediaPlugin()],
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
      "**/*.webm",
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
