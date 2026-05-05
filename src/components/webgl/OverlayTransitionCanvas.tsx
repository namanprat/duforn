// @ts-nocheck
import React, { useEffect, useState } from "react";
import CanvasSurface, { getCanvasDpr } from "./CanvasSurface";
import { createRendererAlpha } from "../../lib/rendering";
import InkTransitionOverlay from "./InkTransitionOverlay";

/**
 * Dedicated canvas for transition ink overlays.
 * Stays above the main UnifiedCanvas so menu/preloader transitions are isolated.
 */
export default function OverlayTransitionCanvas() {
  const [isInkVisible, setIsInkVisible] = useState(false);

  useEffect(() => {
    const onInkVisibleChange = (event) => {
      setIsInkVisible(Boolean(event?.detail?.visible));
    };

    window.addEventListener("duforn:ink-visible-change", onInkVisibleChange);
    return () => window.removeEventListener("duforn:ink-visible-change", onInkVisibleChange);
  }, []);

  return (
    <CanvasSurface
      dpr={getCanvasDpr()}
      pointerEvents="none"
      gl={createRendererAlpha}
      wrapperProps={{
        className: `canvas-surface--overlay-transition fullscreen-overlay-cluster__canvas${isInkVisible ? " is-active" : ""}`,
      }}
    >
      <InkTransitionOverlay />
    </CanvasSurface>
  );
}
