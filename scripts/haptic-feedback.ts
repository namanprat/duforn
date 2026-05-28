// @ts-nocheck
/**
 * Haptic feedback for nav links. `web-haptics` uses `navigator.vibrate` where
 * available (Android Chrome) and a hidden `<input switch>` click fallback that
 * triggers iOS Safari's built-in switch tactile feedback.
 */

let webHapticsInstance = null;
let webHapticsPromise = null;

/** Master gain applied downstream of the lib's internal gain node. The lib
 *  hardcodes its own gain to `0.5 * intensity`; this multiplies that by 0.3,
 *  giving a 30 % perceived volume (peak ~0.15 instead of ~0.5).
 */
const DEBUG_AUDIO_VOLUME = 0.3;

/** Patch the audio graph on first use: `audioGain → masterGain(0.3) → destination`.
 *  The lib mutates `audioGain.gain` on every click, but only the upstream side —
 *  our `masterGain` keeps clamping the final output regardless. */
function attachVolumeClamp(instance) {
  if (!instance || instance.__dufornVolumeClamped) return;
  const originalEnsureAudio = instance.ensureAudio?.bind(instance);
  if (typeof originalEnsureAudio !== "function") return;
  instance.ensureAudio = async function patchedEnsureAudio() {
    await originalEnsureAudio();
    if (
      !instance.__dufornVolumeClamped &&
      instance.audioCtx &&
      instance.audioGain &&
      typeof instance.audioCtx.createGain === "function"
    ) {
      const master = instance.audioCtx.createGain();
      master.gain.value = DEBUG_AUDIO_VOLUME;
      instance.audioGain.disconnect();
      instance.audioGain.connect(master);
      master.connect(instance.audioCtx.destination);
      instance.__dufornVolumeClamped = true;
    }
  };
}

function getWebHaptics() {
  if (typeof window === "undefined") return null;
  if (webHapticsInstance) return webHapticsInstance;
  if (!webHapticsPromise) {
    webHapticsPromise = import("web-haptics").then(({ WebHaptics }) => {
      /* debug:true enables the audible fallback (`<input switch>` click + tone)
         on browsers without `navigator.vibrate` (iOS Safari, desktop). Keep on
         in production so the haptic cue is always perceivable. */
      webHapticsInstance = new WebHaptics({ debug: true });
      attachVolumeClamp(webHapticsInstance);
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
