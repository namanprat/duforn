import type { DebouncedFunction } from "../../src/types/timing";

export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  wait = 0,
): DebouncedFunction<TArgs> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced: DebouncedFunction<TArgs> = (...args: TArgs) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, wait);
  };

  debounced.cancel = () => {
    if (!timeoutId) return;
    clearTimeout(timeoutId);
    timeoutId = null;
  };

  return debounced;
}
