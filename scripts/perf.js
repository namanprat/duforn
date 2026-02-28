let cachedProfile = null;

function safeMatchMedia(query) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(query).matches;
}

export function isCoarsePointerDevice() {
  return safeMatchMedia('(pointer: coarse)');
}

export function getPerformanceProfile() {
  if (cachedProfile) return cachedProfile;

  const reduceMotion = safeMatchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = isCoarsePointerDevice();
  const hardwareConcurrency = typeof navigator !== 'undefined' && navigator.hardwareConcurrency
    ? navigator.hardwareConcurrency
    : 8;
  const deviceMemory = typeof navigator !== 'undefined' && navigator.deviceMemory
    ? navigator.deviceMemory
    : 8;

  const mobileCapable = coarsePointer && hardwareConcurrency >= 6 && deviceMemory >= 6;
  const lowPower = reduceMotion || hardwareConcurrency <= 4 || deviceMemory <= 4 || (coarsePointer && !mobileCapable);
  const veryLowPower = hardwareConcurrency <= 2 || deviceMemory <= 2;

  cachedProfile = {
    reduceMotion,
    lowPower,
    veryLowPower,
    pixelRatioCap: veryLowPower ? 1.0 : (lowPower ? 1.25 : 1.75),
    enableBloom: !lowPower,
    enableEdgeDistortion: !veryLowPower,
    enableGrain: !lowPower,
    grainStrength: lowPower ? 0.01 : 0.03,
  };

  return cachedProfile;
}
