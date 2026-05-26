// @ts-nocheck
/**
 * Haptic feedback for nav links. `web-haptics` uses `navigator.vibrate` where
 * available (Android Chrome) and a hidden `<input switch>` click fallback that
 * triggers iOS Safari's built-in switch tactile feedback.
 */

const IS_DEV = import.meta.env.DEV;

let webHapticsInstance = null;
let webHapticsPromise = null;

function getWebHaptics() {
  if (typeof window === "undefined") return null;
  if (webHapticsInstance) return webHapticsInstance;
  if (!webHapticsPromise) {
    webHapticsPromise = import("web-haptics").then(({ WebHaptics }) => {
      webHapticsInstance = new WebHaptics({ debug: IS_DEV });
      return webHapticsInstance;
    });
  }
  return webHapticsPromise;
}

/**
 * @param {"nudge"|"hover"|"click"} kind
 */
export function triggerNavHaptic(kind) {
  const h = getWebHaptics();
  if (!h) return;
  const fire = (instance) => {
    if (!instance) return;
    if (kind === "nudge") instance.trigger("nudge");
    else if (kind === "hover") instance.trigger([{ duration: 10 }], { intensity: 1 });
    else if (kind === "click") {
      instance.trigger([
        { duration: 80, intensity: 0.8 },
        { delay: 80, duration: 50, intensity: 0.3 },
      ]);
    }
  };
  if (typeof h.then === "function") {
    void h.then(fire);
  } else {
    fire(h);
  }
}
