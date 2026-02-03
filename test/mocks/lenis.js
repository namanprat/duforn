import { vi } from 'vitest';

// Mock Lenis class
export class Lenis {
  constructor(options = {}) {
    this.options = options;
    this._listeners = new Map();
    this._raf = null;
  }

  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this._listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  raf(time) {
    const listeners = this._listeners.get('scroll');
    if (listeners) {
      listeners.forEach(cb => cb({ scroll: 0, velocity: 0 }));
    }
  }

  scrollTo(target, options = {}) {
    // Trigger scroll event
    const listeners = this._listeners.get('scroll');
    if (listeners) {
      listeners.forEach(cb => cb({ scroll: target, velocity: 0 }));
    }
  }

  destroy() {
    this._listeners.clear();
    if (this._raf) {
      cancelAnimationFrame(this._raf);
    }
  }
}

export default Lenis;
