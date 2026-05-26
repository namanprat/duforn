import type { RefObject } from "react";

type PreloaderOverlayLayerProps = {
  visible: boolean;
  fading: boolean;
  preloaderRef: RefObject<HTMLElement | null>;
  strokeTrackRef: RefObject<SVGCircleElement | null>;
  strokeProgressRef: RefObject<SVGCircleElement | null>;
  introHitRef: RefObject<HTMLButtonElement | null>;
  essentialsReady: boolean;
  introRingComplete: boolean;
  permissionsPending: boolean;
  onEnter: () => void;
};

export default function PreloaderOverlayLayer({
  visible,
  fading,
  preloaderRef,
  strokeTrackRef,
  strokeProgressRef,
  introHitRef,
  essentialsReady,
  introRingComplete,
  permissionsPending,
  onEnter,
}: PreloaderOverlayLayerProps) {
  if (!visible) return null;

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
          aria-label={
            !essentialsReady
              ? "Loading essential assets"
              : !introRingComplete
                ? "Finishing intro animation"
                : permissionsPending
                  ? "Requesting device permissions"
                  : "Enter site"
          }
          aria-busy={!introRingComplete}
        >
          <span
            className={`intro-preloader-action-tagline${introRingComplete ? " intro-preloader-action-tagline--hidden" : ""}`}
          >
            {essentialsReady ? "Duforn" : "Loading"}
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
