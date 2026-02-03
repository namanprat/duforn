import { vi } from 'vitest';

/**
 * Memory leak detector utility
 * Tracks RAF IDs, event listeners, and resource disposal
 */
export class MemoryLeakDetector {
  constructor() {
    this.rafIds = new Set();
    this.listeners = new Map();
    this.originalAddEventListener = null;
    this.originalRemoveEventListener = null;
    this.originalRAF = null;
    this.originalCAF = null;
  }

  start() {
    this.rafIds.clear();
    this.listeners.clear();

    // Track RAF
    this.originalRAF = global.requestAnimationFrame;
    this.originalCAF = global.cancelAnimationFrame;

    global.requestAnimationFrame = vi.fn((callback) => {
      const id = this.originalRAF.call(global, callback);
      this.rafIds.add(id);
      return id;
    });

    global.cancelAnimationFrame = vi.fn((id) => {
      this.rafIds.delete(id);
      this.originalCAF.call(global, id);
    });

    // Track event listeners
    this.originalAddEventListener = EventTarget.prototype.addEventListener;
    this.originalRemoveEventListener = EventTarget.prototype.removeEventListener;

    const self = this;

    EventTarget.prototype.addEventListener = function(type, listener, options) {
      const key = `${this.constructor.name}:${type}`;
      if (!self.listeners.has(key)) {
        self.listeners.set(key, new Set());
      }
      self.listeners.get(key).add(listener);
      self.originalAddEventListener.call(this, type, listener, options);
    };

    EventTarget.prototype.removeEventListener = function(type, listener, options) {
      const key = `${this.constructor.name}:${type}`;
      const set = self.listeners.get(key);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          self.listeners.delete(key);
        }
      }
      self.originalRemoveEventListener.call(this, type, listener, options);
    };
  }

  stop() {
    if (this.originalRAF) {
      global.requestAnimationFrame = this.originalRAF;
    }
    if (this.originalCAF) {
      global.cancelAnimationFrame = this.originalCAF;
    }
    if (this.originalAddEventListener) {
      EventTarget.prototype.addEventListener = this.originalAddEventListener;
    }
    if (this.originalRemoveEventListener) {
      EventTarget.prototype.removeEventListener = this.originalRemoveEventListener;
    }
  }

  hasRAFLeaks() {
    return this.rafIds.size > 0;
  }

  hasListenerLeaks() {
    return this.listeners.size > 0;
  }

  getRAFCount() {
    return this.rafIds.size;
  }

  getListenerCount() {
    let total = 0;
    for (const [key, set] of this.listeners) {
      total += set.size;
    }
    return total;
  }

  getListenerDetails() {
    const details = {};
    for (const [key, set] of this.listeners) {
      details[key] = set.size;
    }
    return details;
  }

  assertNoLeaks() {
    const rafLeaks = this.hasRAFLeaks();
    const listenerLeaks = this.hasListenerLeaks();

    if (rafLeaks) {
      console.error(`RAF leak detected: ${this.getRAFCount()} uncancelled frames`);
    }

    if (listenerLeaks) {
      console.error(`Listener leaks detected:`, this.getListenerDetails());
    }

    return !rafLeaks && !listenerLeaks;
  }

  reset() {
    this.rafIds.clear();
    this.listeners.clear();
  }
}

export function createLeakDetector() {
  return new MemoryLeakDetector();
}
