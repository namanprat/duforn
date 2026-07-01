import { hasInitialBootCompleted, useSceneBootStore } from "./sceneReady";
import { cameraRigControlsRef } from "../cam/pose";
import { tryEnableGyroParallax } from "../../lib/deviceOrientation";
import { hasFinePointerHover, shouldUseNavRotateHover } from "../../lib/link-hover";
import { prefersReducedMotion } from "../../lib/prefersReducedMotion";
import RotateHoverLabel from "../../components/RotateHoverLabel";

export default function PreloadOverlay() {
  const phase = useSceneBootStore((s) => s.phase);
  const progress = useSceneBootStore((s) => s.progress);
  const requestReveal = useSceneBootStore((s) => s.requestReveal);

  if (hasInitialBootCompleted() || phase === "live") return null;

  const showProgress = phase === "fetching" || phase === "compiling";
  const showEnter = phase === "ready";
  const isRevealing = phase === "revealing";

  const handleEnter = (muted: boolean) => {
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
        <div className="scene_preload_overlay_inner">
          {showProgress ? (
            <p className="scene_preload_progress" aria-live="polite">
              {progress}%
            </p>
          ) : null}
          {showEnter ? (
            <div className="scene_preload_enter">
              <button
                type="button"
                className="button button-primary scene_preload_enter_btn"
                onClick={() => handleEnter(false)}
              >
                {shouldUseNavRotateHover() ? <RotateHoverLabel text="Enter" /> : "Enter"}
              </button>
              <button
                type="button"
                className="scene_preload_enter_muted"
                onClick={() => handleEnter(true)}
              >
                Enter without sound
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
