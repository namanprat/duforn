import "./store/loading";
import "./models/gen";

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App";
import { patchThreeTSL } from "./lib/gpu/patch";
import { startWorkTexturePreload } from "../scripts/work-preload";
import { trackPromise } from "./lib/preload/gate";
import { registerEssentialAssetTasks, registerRoomAssetTasks } from "./models/gen/preloads";
import { installBackgroundWarmup } from "./lib/preload/warmup";
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
  registerRoomAssetTasks();
  // Work textures are non-essential — let them load in the background so the
  // preloader ring reflects only first-paint readiness.
  startWorkTexturePreload().catch(() => {});
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
