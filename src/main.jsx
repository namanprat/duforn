// loading.js must be imported before preload.js so THREE.DefaultLoadingManager
// callbacks are registered before any loader fires.
import "./store/loading";
import "./models/preload.js";

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App.jsx";
import { patchThreeTSL } from "./lib/webgpu/patchThreeTSL.js";
import "../styles.css";

async function bootstrap() {
  await patchThreeTSL();

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
