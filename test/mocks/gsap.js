import { vi } from 'vitest';

// Track active tweens and ScrollTriggers
export const activeTweens = new Set();
export const activeScrollTriggers = new Set();
export const activeTimelines = new Set();

// Mock Tween
class MockTween {
  constructor(target, vars) {
    this.target = target;
    this.vars = vars;
    this._killed = false;
    this.scrollTrigger = null;
    activeTweens.add(this);
  }

  kill() {
    this._killed = true;
    activeTweens.delete(this);
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }
  }

  then(onResolve) {
    setTimeout(() => onResolve(), this.vars.duration ? this.vars.duration * 1000 : 0);
    return this;
  }

  isActive() {
    return !this._killed;
  }
}

// Mock Timeline
class MockTimeline {
  constructor() {
    this._tweens = [];
    this._killed = false;
    activeTimelines.add(this);
  }

  to(target, vars) {
    const tween = new MockTween(target, vars);
    this._tweens.push(tween);
    return this;
  }

  from(target, vars) {
    const tween = new MockTween(target, vars);
    this._tweens.push(tween);
    return this;
  }

  fromTo(target, fromVars, toVars) {
    const tween = new MockTween(target, toVars);
    this._tweens.push(tween);
    return this;
  }

  kill() {
    this._killed = true;
    this._tweens.forEach(t => t.kill());
    activeTimelines.delete(this);
  }

  play() {
    return this;
  }

  pause() {
    return this;
  }

  reverse() {
    return this;
  }
}

// Mock ScrollTrigger
class MockScrollTrigger {
  constructor(vars) {
    this.vars = vars;
    this._killed = false;
    activeScrollTriggers.add(this);
  }

  kill() {
    this._killed = true;
    activeScrollTriggers.delete(this);
  }

  refresh() {}

  update() {}

  static create(vars) {
    return new MockScrollTrigger(vars);
  }

  static getAll() {
    return Array.from(activeScrollTriggers);
  }

  static refresh() {}

  static update() {}

  static clearMatchMedia() {}
}

// Mock Draggable
class MockDraggable {
  constructor(target, vars) {
    this.target = target;
    this.vars = vars;
    this._killed = false;
  }

  kill() {
    this._killed = true;
  }

  enable() {
    return this;
  }

  disable() {
    return this;
  }

  static create(target, vars) {
    return new MockDraggable(target, vars);
  }
}

// Main GSAP object
const gsap = {
  to: vi.fn((target, vars) => {
    const tween = new MockTween(target, vars);
    if (vars.scrollTrigger) {
      tween.scrollTrigger = new MockScrollTrigger(vars.scrollTrigger);
    }
    return tween;
  }),

  from: vi.fn((target, vars) => {
    const tween = new MockTween(target, vars);
    if (vars.scrollTrigger) {
      tween.scrollTrigger = new MockScrollTrigger(vars.scrollTrigger);
    }
    return tween;
  }),

  fromTo: vi.fn((target, fromVars, toVars) => {
    const tween = new MockTween(target, toVars);
    if (toVars.scrollTrigger) {
      tween.scrollTrigger = new MockScrollTrigger(toVars.scrollTrigger);
    }
    return tween;
  }),

  set: vi.fn((target, vars) => {
    Object.assign(target, vars);
  }),

  timeline: vi.fn((vars = {}) => new MockTimeline()),

  registerPlugin: vi.fn(),

  ticker: {
    add: vi.fn(),
    remove: vi.fn(),
    lagSmoothing: vi.fn(),
  },

  utils: {
    toArray: vi.fn((target) => {
      if (Array.isArray(target)) return target;
      if (typeof target === 'string') {
        return Array.from(document.querySelectorAll(target));
      }
      return [target];
    }),
    clamp: vi.fn((min, max, value) => Math.max(min, Math.min(max, value))),
  },
};

// Export helpers
export function resetGsapTracking() {
  activeTweens.clear();
  activeScrollTriggers.clear();
  activeTimelines.clear();
  gsap.to.mockClear();
  gsap.from.mockClear();
  gsap.fromTo.mockClear();
  gsap.set.mockClear();
  gsap.timeline.mockClear();
}

export function getGsapLeaks() {
  return {
    tweens: activeTweens.size,
    scrollTriggers: activeScrollTriggers.size,
    timelines: activeTimelines.size,
  };
}

export { MockScrollTrigger as ScrollTrigger };
export { MockDraggable as Draggable };
export { MockTimeline };
export { MockTween };
export default gsap;
