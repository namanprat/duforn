import { prefersReducedMotion } from "./prefersReducedMotion";

export type DeviceTier = 0 | 1 | 2 | 3;

// ponytail: small regex blocklists; extend when support tickets name a GPU
const BLOCKLIST = /SwiftShader|llvmpipe|Microsoft Basic Render|software/i;
const WEAK_GPU =
  /Intel.*HD\s*(Graphics\s*)?(3\d{3}|4\d{3}|5[0-4]\d{2})|Mali-[34]|Adreno \(TM\) 3|PowerVR SGX/i;

function readDevTierOverride(): DeviceTier | null {
  if (!import.meta.env.DEV || typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("tier");
  if (raw === null) return null;
  const n = Number(raw);
  if (Number.isInteger(n) && n >= 0 && n <= 3) return n as DeviceTier;
  return null;
}

function probeWebGL(): { ok: boolean; renderer: string } {
  if (typeof document === "undefined") return { ok: false, renderer: "" };
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl");
    if (!gl) return { ok: false, renderer: "" };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = ext
      ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL))
      : "";
    return { ok: true, renderer };
  } catch {
    return { ok: false, renderer: "" };
  }
}

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  if (/iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent)) return true;
  return navigator.maxTouchPoints > 1 && !/Macintosh/i.test(navigator.userAgent);
}

export function resolveDeviceTier(): DeviceTier {
  const override = readDevTierOverride();
  if (override !== null) return override;

  const { ok, renderer } = probeWebGL();
  if (!ok || BLOCKLIST.test(renderer)) return 0;
  if (prefersReducedMotion() || WEAK_GPU.test(renderer)) return 1;
  if (isMobile()) return 2;
  return 3;
}

let cachedTier: DeviceTier | null = null;

export function getDeviceTier(): DeviceTier {
  if (cachedTier === null) cachedTier = resolveDeviceTier();
  return cachedTier;
}

/** ponytail: one runnable smoke check — import and call in dev if needed */
export function deviceTierSelfCheck(): void {
  console.assert(BLOCKLIST.test("ANGLE SwiftShader"), "blocklist matches SwiftShader");
  console.assert(WEAK_GPU.test("Intel HD Graphics 4000"), "weak GPU matches Intel 4000");
  console.assert(!WEAK_GPU.test("Apple M2"), "M2 is not weak-tier");
}

if (import.meta.env.DEV) deviceTierSelfCheck();
