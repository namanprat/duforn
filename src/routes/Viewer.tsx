import React from "react";

/**
 * GLB viewer on the unified canvas — same effect stack as the home room, loads test.glb.
 */
export default function ViewerPage() {
  return (
    <main
      id="main"
      className="viewer-page"
      data-page-container="true"
      data-page-namespace="viewer"
      aria-label="GLB Viewer"
    />
  );
}
