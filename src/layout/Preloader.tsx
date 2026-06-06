import type { RefObject } from "react";

type LoadingPhase = "assets" | "compiling" | "ready";

type PreloaderOverlayLayerProps = {
  visible: boolean;
  fading: boolean;
  preloaderRef: RefObject<HTMLElement | null>;
  strokeTrackRef: RefObject<SVGCircleElement | null>;
  strokeProgressRef: RefObject<SVGCircleElement | null>;
  introHitRef: RefObject<HTMLButtonElement | null>;
  essentialsReady: boolean;
  loadingPhase: LoadingPhase;
  introRingComplete: boolean;
  permissionsPending: boolean;
  onEnter: () => void;
};

function getEnterAriaLabel({
  essentialsReady,
  loadingPhase,
  introRingComplete,
  permissionsPending,
}: Pick<
  PreloaderOverlayLayerProps,
  "essentialsReady" | "loadingPhase" | "introRingComplete" | "permissionsPending"
>) {
  if (!essentialsReady) return "Loading essential assets";
  if (loadingPhase !== "ready") return "Compiling shaders";
  if (!introRingComplete) return "Finishing intro animation";
  if (permissionsPending) return "Requesting device permissions";
  return "Enter site";
}

export default function PreloaderOverlayLayer({
  visible,
  fading,
  preloaderRef,
  strokeTrackRef,
  strokeProgressRef,
  introHitRef,
  essentialsReady,
  loadingPhase,
  introRingComplete,
  permissionsPending,
  onEnter,
}: PreloaderOverlayLayerProps) {
  if (!visible) return null;

  const enterAriaLabel = getEnterAriaLabel({
    essentialsReady,
    loadingPhase,
    introRingComplete,
    permissionsPending,
  });

  return (
    <section
      className="preloader intro-preloader u-min-height-screen"
      aria-label="Website preloader"
      data-state={fading ? "fading" : "visible"}
      ref={preloaderRef}
    >
      <div className="intro-preloader-main intro-preloader-main--centered">
        <button
          ref={introHitRef}
          type="button"
          className="intro-preloader-center-hit"
          onClick={onEnter}
          disabled={!introRingComplete || permissionsPending}
          aria-label={enterAriaLabel}
          aria-busy={!introRingComplete}
        >
          <span
            className={`intro-preloader-action-tagline${introRingComplete ? " intro-preloader-action-tagline--hidden" : ""}`}
          >
            {!essentialsReady ? "Loading" : loadingPhase !== "ready" ? "Compiling" : "Duforn"}
          </span>
          <span
            className={`intro-preloader-enter-label${introRingComplete ? " intro-preloader-enter-label--active" : ""}`}
            aria-hidden={!introRingComplete}
          >
            Enter
          </span>
          <div className="intro-preloader-ring" aria-hidden="true">
            <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="stroke-track" cx="160" cy="160" r="155" ref={strokeTrackRef} />
              <circle
                className="stroke-progress"
                cx="160"
                cy="160"
                r="155"
                ref={strokeProgressRef}
              />
            </svg>
          </div>
        </button>
      </div>
    </section>
  );
}
