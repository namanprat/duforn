import React from "react";

/**
 * WebGL-Water demo, reimplemented as R3F + WebGPU + TSL.
 * The scene itself lives on the shared canvas (see TestCanvasBranch in
 * SceneBranches.tsx); this route only provides the page container + namespace
 * so the canvas switches to the water branch and pointer events are enabled.
 */
export default function TestPage() {
  return (
    <main
      id="main"
      className="test-page"
      data-page-container="true"
      data-page-namespace="test"
      aria-label="Water Test"
    />
  );
}
