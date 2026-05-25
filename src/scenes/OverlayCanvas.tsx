// @ts-nocheck
import React, { useEffect, useState } from "react";
import Surface, { getCanvasDpr } from "./Surface";
import { createRendererAlpha } from "../lib/render";
import InkOverlay from "./InkOverlay";

/**
 * Dedicated canvas for transition ink overlays.
 * Stays above the main Canvas so menu/preloader transitions are isolated.
 */
export default function OverlayCanvas() {
  const [isInkVisible, setIsInkVisible] = useState(false);

  useEffect(() => {
    const onInkVisibleChange = (event) => {
      setIsInkVisible(Boolean(event?.detail?.visible));
    };

    window.addEventListener("duforn:ink-visible-change", onInkVisibleChange);
    return () => window.removeEventListener("duforn:ink-visible-change", onInkVisibleChange);
  }, []);

  return (
    <Surface
      dpr={getCanvasDpr()}
      pointerEvents="none"
      gl={createRendererAlpha}
      wrapperProps={{
        className: `canvas-surface--overlay-transition fullscreen-overlay-cluster__canvas${isInkVisible ? " is-active" : ""}`,
      }}
    >
      <InkOverlay />
    </Surface>
  );
}
