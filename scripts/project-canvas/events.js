import { debounce } from '../runtime/timing.js';
import { createTeardownBag } from '../runtime/lifecycle.js';

export function createProjectCanvasEvents({ onResize, onScroll, onVisibilityChange }) {
  const teardowns = createTeardownBag();
  const debouncedResize = debounce(onResize, 150);
  let scrollRafPending = false;

  const handleScroll = () => {
    if (scrollRafPending) return;
    scrollRafPending = true;
    requestAnimationFrame(() => {
      scrollRafPending = false;
      onScroll();
    });
  };

  const handleVisibility = () => {
    onVisibilityChange(!document.hidden);
  };

  const attach = () => {
    window.addEventListener('resize', debouncedResize);
    teardowns.add(() => {
      window.removeEventListener('resize', debouncedResize);
      debouncedResize.cancel?.();
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    teardowns.add(() => window.removeEventListener('scroll', handleScroll));

    document.addEventListener('visibilitychange', handleVisibility);
    teardowns.add(() => document.removeEventListener('visibilitychange', handleVisibility));
  };

  const detach = () => {
    teardowns.run();
  };

  return { attach, detach };
}
