import "./store/loading.js";
import "./models/preload.js";

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App.jsx";
import { patchThreeTSL } from "./lib/webgpu/patchThreeTSL.js";
import { startWorkTexturePreload } from "../scripts/work-preload.js";
import "../styles.css";

async function bootstrap() {
  await patchThreeTSL();
  void startWorkTexturePreload();

  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
        <SpeedInsights />
      </BrowserRouter>
    </React.StrictMode>,
  );
}

bootstrap();
