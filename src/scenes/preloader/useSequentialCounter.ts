import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../../lib/prefersReducedMotion";

const TICK_MS_DEFAULT = 16;
const TICK_MS_FAST = 8;
const FAST_GAP = 20;

/**
 * Display counter that ticks +1 toward `target` without skipping integers.
 * ponytail: rAF + elapsed-time gate — ceiling ~60 ticks/s when catching up fast.
 */
export function useSequentialCounter(target: number, active: boolean): number {
  const [displayed, setDisplayed] = useState(0);
  const displayedRef = useRef(0);
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    if (!active) return undefined;

    if (prefersReducedMotion()) {
      displayedRef.current = target;
      setDisplayed(target);
      return undefined;
    }

    let raf = 0;
    let lastTick = 0;

    const tick = (now: number) => {
      const t = targetRef.current;
      const d = displayedRef.current;
      if (d < t) {
        const gap = t - d;
        const interval = gap > FAST_GAP ? TICK_MS_FAST : TICK_MS_DEFAULT;
        if (now - lastTick >= interval) {
          lastTick = now;
          const next = d + 1;
          displayedRef.current = next;
          setDisplayed(next);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);

  return displayed;
}
