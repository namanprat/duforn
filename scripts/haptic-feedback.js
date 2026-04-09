/**
 * Haptic feedback for nav links. Uses the Vibration API on supported devices
 * (common on Android Chrome). iOS Safari does not expose navigator.vibrate.
 */

const IS_DEV = import.meta.env.DEV;

let webHapticsDev = null;

async function getWebHapticsDev() {
  if (!IS_DEV) return null;
  if (typeof window === "undefined") return null;
  if (webHapticsDev) return webHapticsDev;
  const { WebHaptics } = await import("web-haptics");
  webHapticsDev = new WebHaptics({ debug: true });
  return webHapticsDev;
}

/**
 * @param {"nudge"|"hover"|"click"} kind
 */
export function triggerNavHaptic(kind) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    if (kind === "nudge") {
      navigator.vibrate(12);
      return;
    }
    if (kind === "hover") {
      navigator.vibrate(10);
      return;
    }
    if (kind === "click") {
      navigator.vibrate([0, 35, 55, 28]);
      return;
    }
  }

  if (IS_DEV) {
    void getWebHapticsDev().then((h) => {
      if (!h) return;
      if (kind === "nudge") h.trigger("nudge");
      else if (kind === "hover") h.trigger([{ duration: 10 }], { intensity: 1 });
      else if (kind === "click") {
        h.trigger([
          { duration: 80, intensity: 0.8 },
          { delay: 80, duration: 50, intensity: 0.3 },
        ]);
      }
    });
  }
}
