export function createTeardownBag() {
  const teardowns = [];

  return {
    add(fn) {
      if (typeof fn === 'function') teardowns.push(fn);
    },
    run() {
      while (teardowns.length) {
        const teardown = teardowns.pop();
        try {
          teardown();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[lifecycle] teardown failed', error);
        }
      }
    },
  };
}
