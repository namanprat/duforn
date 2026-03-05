export function createPaintDebugLogger(namespace = 'paint-debug') {
  const enabled =
    typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).has('debugPaint');

  return function paintDebug(step, payload = null) {
    if (!enabled) return;
    const ts = performance.now().toFixed(1);
    if (payload !== null) {
      // eslint-disable-next-line no-console
      console.log(`[${namespace} @${ts}ms] ${step}`, payload);
      return;
    }
    // eslint-disable-next-line no-console
    console.log(`[${namespace} @${ts}ms] ${step}`);
  };
}
