import { useState } from "react";
import { hasInitialBootCompleted, useSceneBootStore } from "./sceneReady";
import { cameraRigControlsRef } from "../cam/pose";
import { tryEnableGyroParallax } from "../../lib/deviceOrientation";
import { hasFinePointerHover } from "../../lib/link-hover";
import { prefersReducedMotion } from "../../lib/prefersReducedMotion";
import { useSequentialCounter } from "./useSequentialCounter";
import StaggerHoverButton from "../../components/StaggerHoverButton";
import StaggerHoverChars from "../../components/StaggerHoverChars";

export default function PreloadOverlay() {
  const phase = useSceneBootStore((s) => s.phase);
  const progress = useSceneBootStore((s) => s.progress);
  const requestReveal = useSceneBootStore((s) => s.requestReveal);
  const [exiting, setExiting] = useState(false);

  const counterActive =
    phase === "fetching" || phase === "compiling" || phase === "ready";
  const displayed = useSequentialCounter(progress, counterActive);

  if (hasInitialBootCompleted() || phase === "live") return null;

  const showProgress =
    phase === "fetching" || phase === "compiling" || (phase === "ready" && displayed < 100);
  const showEnter = phase === "ready" && displayed >= 100 && !exiting;
  const isRevealing = phase === "revealing";

  const handleEnter = (muted: boolean) => {
    if (exiting || isRevealing) return;
    setExiting(true);

    if (!hasFinePointerHover() && !prefersReducedMotion()) {
      void tryEnableGyroParallax().then((allowed) => {
        cameraRigControlsRef.current.gyroEnabled = allowed;
      });
    }

    requestReveal(muted);
  };

  return (
    <div
      className={`scene_preload_overlay${isRevealing ? " scene_preload_overlay--revealing" : ""}`}
      data-no-strip-drag
      aria-hidden={isRevealing}
    >
      {!isRevealing ? (
        <div
          className={`scene_preload_overlay_inner${exiting ? " scene_preload_overlay_inner--exit" : ""}`}
        >
          {showProgress ? (
            <p className="scene_preload_progress" aria-live="polite">
              {displayed}%
            </p>
          ) : null}
          {showEnter ? (
            <div className="scene_preload_enter">
              <StaggerHoverButton
                as="button"
                className="scene_preload_enter_btn"
                label="Enter"
                onClick={() => handleEnter(false)}
              />
              <button
                type="button"
                className="scene_preload_enter_muted"
                onClick={() => handleEnter(true)}
              >
                <StaggerHoverChars>Enter without sound</StaggerHoverChars>
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
