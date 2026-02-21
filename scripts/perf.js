let cachedProfile = null;

function safeMatchMedia(query) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(query).matches;
}

export function getPerformanceProfile() {
  if (cachedProfile) return cachedProfile;

  const reduceMotion = safeMatchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = safeMatchMedia('(pointer: coarse)');
  const hardwareConcurrency = typeof navigator !== 'undefined' && navigator.hardwareConcurrency
    ? navigator.hardwareConcurrency
    : 8;
  const deviceMemory = typeof navigator !== 'undefined' && navigator.deviceMemory
    ? navigator.deviceMemory
    : 8;

  const lowPower = reduceMotion || coarsePointer || hardwareConcurrency <= 4 || deviceMemory <= 4;
  const veryLowPower = hardwareConcurrency <= 2 || deviceMemory <= 2;

  cachedProfile = {
    reduceMotion,
    lowPower,
    veryLowPower,
    pixelRatioCap: veryLowPower ? 0.9 : (lowPower ? 1.0 : 1.5),
    enableBloom: !lowPower,
    enableEdgeDistortion: !veryLowPower,
    enableGrain: !lowPower,
    grainStrength: lowPower ? 0.01 : 0.03,
  };

  return cachedProfile;
}
