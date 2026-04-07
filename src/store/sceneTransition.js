import { create } from "zustand";
import gsap from "gsap";

const DEFAULT_DURATION = 0.7;

/**
 * Drives the slide-up wipe between scene slots.
 *
 * Only `currentId`, `nextId`, and `progress` are read by the compositor. The
 * tween handle is kept internally so rapid re-navigations can cancel the
 * previous animation.
 */
export const useSceneTransitionStore = create((set, get) => ({
  currentId: "home",
  nextId: null,
  progress: 0,
  duration: DEFAULT_DURATION,
  _tween: null,

  startTransition: (nextId) => {
    const state = get();

    // Already here, nothing in flight.
    if (nextId === state.currentId && !state.nextId) return;
    // Same target already animating.
    if (state.nextId === nextId) return;

    if (state._tween) {
      state._tween.kill();
    }

    // Retarget: keep currentId as whatever is already drawn (or the previously
    // in-flight currentId) and restart the wipe toward the new target.
    set({ nextId, progress: 0, _tween: null });

    const obj = { p: 0 };
    const tween = gsap.to(obj, {
      p: 1,
      duration: state.duration,
      ease: "power2.inOut",
      onUpdate: () => set({ progress: obj.p }),
      onComplete: () => {
        set({
          currentId: nextId,
          nextId: null,
          progress: 0,
          _tween: null,
        });
      },
    });

    set({ _tween: tween });
  },

  setCurrentImmediate: (id) => {
    const state = get();
    if (state._tween) state._tween.kill();
    set({ currentId: id, nextId: null, progress: 0, _tween: null });
  },
}));
