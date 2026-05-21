import "./store/loading";
import "./models/generated";

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App";
import { patchThreeTSL } from "./lib/webgpu/patchThreeTSL";
import { startWorkTexturePreload } from "../scripts/work-preload";
import { trackPromise } from "./lib/preloader/preloaderGate";
import { registerEssentialAssetTasks } from "./models/generated/registerPreloads";
import { installBackgroundWarmup } from "./lib/preloader/backgroundWarmup";
import "../styles.css";

function ensureOverlayRoot() {
  const existing = document.getElementById("overlay-root");
  if (existing) return existing;

  const node = document.createElement("div");
  node.id = "overlay-root";
  document.body.appendChild(node);
  return node;
}

function registerFontsTask() {
  if (typeof document === "undefined" || !document.fonts?.ready) return;
  trackPromise("fonts:ready", document.fonts.ready, { label: "Fonts", weight: 1 }).catch(() => {});
}

async function bootstrap() {
  await patchThreeTSL();
  ensureOverlayRoot();

  // Kick off essentials in parallel; their completion is tracked by the
  // preloader gate so the intro ring + Enter button reflect real readiness.
  registerFontsTask();
  registerEssentialAssetTasks();
  trackPromise("textures:work-strip", startWorkTexturePreload(), {
    label: "Work textures",
    weight: 2,
  }).catch(() => {});
  installBackgroundWarmup();

  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
        <SpeedInsights />
      </BrowserRouter>
    </React.StrictMode>,
  );
}

void bootstrap();
