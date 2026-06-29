import { useEffect, useState } from "react";

/** Stay true for `delayMs` after `active` goes false — smooth subgraph deload. */
export function useDelayedActive(active: boolean, delayMs = 1000): boolean {
  const [mounted, setMounted] = useState(active);

  useEffect(() => {
    if (active) {
      setMounted(true);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), delayMs);
    return () => window.clearTimeout(timer);
  }, [active, delayMs]);

  return mounted;
}
