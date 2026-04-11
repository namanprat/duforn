import "./store/loading";
import "./models/preload";

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App";
import { patchThreeTSL } from "./lib/webgpu/patchThreeTSL";
import { startWorkTexturePreload } from "../scripts/work-preload";
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
