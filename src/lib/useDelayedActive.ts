import { useEffect, useState } from "react";

/**
 * Stay true for `delayMs` after `active` goes false — smooth subgraph deload.
 * `activateDelayMs` (default 0) delays turning true, so a heavy subgraph mounts
 * after a camera transition instead of stuttering it mid-flight. The initial mount
 * (active from first render) is never delayed — it's seeded into state directly.
 */
export function useDelayedActive(active: boolean, delayMs = 1000, activateDelayMs = 0): boolean {
  const [mounted, setMounted] = useState(active);

  useEffect(() => {
    if (active) {
      if (activateDelayMs <= 0) {
        setMounted(true);
        return;
      }
      const timer = window.setTimeout(() => setMounted(true), activateDelayMs);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setMounted(false), delayMs);
    return () => window.clearTimeout(timer);
  }, [active, delayMs, activateDelayMs]);

  return mounted;
}
