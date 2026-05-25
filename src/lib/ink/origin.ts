interface InkOrigin {
  x: number;
  y: number;
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0.5;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function resolveCanvasInkOrigin(el?: HTMLElement | null): InkOrigin {
  if (typeof window === "undefined") return { x: 0.5, y: 0.5 };
  if (!el || typeof el.getBoundingClientRect !== "function") {
    return { x: 0.5, y: 0.5 };
  }
  const rect = el.getBoundingClientRect();
  if (!rect.width && !rect.height) return { x: 0.5, y: 0.5 };
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const w = window.innerWidth || 1;
  const h = window.innerHeight || 1;
  return { x: clamp01(cx / w), y: clamp01(cy / h) };
}
