import { hasInitialBootCompleted, useSceneBootStore } from "./sceneReady";

export default function PreloadOverlay() {
  const phase = useSceneBootStore((s) => s.phase);
  const progress = useSceneBootStore((s) => s.progress);
  const requestReveal = useSceneBootStore((s) => s.requestReveal);

  if (hasInitialBootCompleted() || phase === "live") return null;

  const showProgress = phase === "fetching" || phase === "compiling";
  const showEnter = phase === "ready";
  const isRevealing = phase === "revealing";

  return (
    <div
      className={`scene_preload_overlay${isRevealing ? " scene_preload_overlay--revealing" : ""}`}
      aria-hidden={isRevealing}
    >
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
              onClick={() => requestReveal(false)}
            >
              Enter
            </button>
            <button
              type="button"
              className="scene_preload_enter_muted"
              onClick={() => requestReveal(true)}
            >
              Enter without sound
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
