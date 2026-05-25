// @ts-nocheck
import gsap from "gsap";
import { CANVAS_INK_MENU_TIMING, CANVAS_INK_ROUTE_TIMING } from "./route";

const DEFAULT_ORIGIN = { x: 0.5, y: 0.5 };
const DEFAULT_RADIAL_BIAS = 0.6;

let activeHandle = null;
let activeTween = null;

function prefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function killActiveTween() {
  if (activeTween) {
    activeTween.kill();
    activeTween = null;
  }
}

function setOrigin(origin) {
  if (!activeHandle?.uniforms?.uOrigin) return;
  const o = origin || DEFAULT_ORIGIN;
  const target = activeHandle.uniforms.uOrigin.value;
  if (target && typeof target.set === "function") {
    target.set(o.x, o.y);
  } else {
    activeHandle.uniforms.uOrigin.value = { x: o.x, y: o.y };
  }
}

function setProgress(value) {
  if (!activeHandle?.uniforms?.uInkProgress) return;
  activeHandle.uniforms.uInkProgress.value = value;
}

function setVisible(value) {
  if (!activeHandle?.uniforms?.uVisible) return;
  activeHandle.uniforms.uVisible.value = value;
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("duforn:ink-visible-change", {
        detail: { visible: value > 0.001 },
      }),
    );
  }
}

function setRadialBias(value) {
  if (!activeHandle?.uniforms?.uRadialBias) return;
  activeHandle.uniforms.uRadialBias.value = value;
}

function tweenProgress(from, to, durationMs, ease = "power3.inOut") {
  return new Promise((resolve) => {
    if (!activeHandle?.uniforms?.uInkProgress) {
      resolve();
      return;
    }
    const uniform = activeHandle.uniforms.uInkProgress;
    uniform.value = from;
    const proxy = { v: from };
    activeTween = gsap.to(proxy, {
      v: to,
      duration: Math.max(0.001, durationMs / 1000),
      ease,
      onUpdate: () => {
        uniform.value = proxy.v;
      },
      onComplete: () => {
        uniform.value = to;
        activeTween = null;
        resolve();
      },
      onInterrupt: () => {
        activeTween = null;
        resolve();
      },
    });
  });
}

function tweenVisible(from, to, durationMs, ease = "power2.out") {
  return new Promise((resolve) => {
    if (!activeHandle?.uniforms?.uVisible) {
      resolve();
      return;
    }
    const uniform = activeHandle.uniforms.uVisible;
    uniform.value = from;
    const proxy = { v: from };
    activeTween = gsap.to(proxy, {
      v: to,
      duration: Math.max(0.001, durationMs / 1000),
      ease,
      onUpdate: () => {
        uniform.value = proxy.v;
      },
      onComplete: () => {
        uniform.value = to;
        activeTween = null;
        resolve();
      },
      onInterrupt: () => {
        activeTween = null;
        resolve();
      },
    });
  });
}

function nextFrame() {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 16);
    }
  });
}

export const canvasInk = {
  register(handle) {
    activeHandle = handle;
    return () => {
      if (activeHandle === handle) {
        killActiveTween();
        activeHandle = null;
      }
    };
  },

  isReady() {
    return Boolean(activeHandle?.uniforms);
  },

  async enter({
    surface,
    origin,
    expandMs,
    holdMs,
    collapseMs,
    onCovered,
    /** Start already fully covered (no expand tween). Used for intro: CSS preloader matches ink, Enter only reveals. */
    skipExpand,
  } = {}) {
    if (!activeHandle?.uniforms) {
      onCovered?.();
      return;
    }

    killActiveTween();
    setOrigin(origin);
    setRadialBias(DEFAULT_RADIAL_BIAS);
    setVisible(1);

    if (skipExpand) {
      setProgress(1);
      if (prefersReducedMotion()) {
        onCovered?.();
        await nextFrame();
        if (surface === "archive") {
          setVisible(0);
        } else {
          setProgress(0);
          setVisible(0);
        }
        return;
      }
      await nextFrame();
      onCovered?.();
      if (holdMs && holdMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, holdMs));
      }
      if (surface === "archive") {
        await nextFrame();
        await tweenVisible(1, 0, collapseMs ?? CANVAS_INK_ROUTE_TIMING.collapseMs, "power2.inOut");
        setProgress(0);
        setVisible(0);
      } else {
        await tweenProgress(1, 0, collapseMs ?? CANVAS_INK_ROUTE_TIMING.collapseMs, "power3.in");
        setVisible(0);
      }
      return;
    }

    if (prefersReducedMotion()) {
      setProgress(1);
      onCovered?.();
      await nextFrame();
      if (surface === "archive") {
        setVisible(0);
      } else {
        setProgress(0);
      }
      return;
    }

    await tweenProgress(0, 1, expandMs ?? CANVAS_INK_ROUTE_TIMING.expandMs, "power3.inOut");

    onCovered?.();

    if (holdMs && holdMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, holdMs));
    }

    if (surface === "archive") {
      await nextFrame();
      await tweenVisible(1, 0, collapseMs ?? CANVAS_INK_ROUTE_TIMING.collapseMs, "power2.inOut");
      setProgress(0);
      setVisible(0);
    } else {
      await tweenProgress(1, 0, collapseMs ?? CANVAS_INK_ROUTE_TIMING.collapseMs, "power3.in");
      setVisible(0);
    }
  },

  async cover({ origin, expandMs } = {}) {
    if (!activeHandle?.uniforms) return;
    killActiveTween();
    setOrigin(origin);
    setRadialBias(DEFAULT_RADIAL_BIAS);
    setVisible(1);

    if (prefersReducedMotion()) {
      setProgress(1);
      return;
    }

    await tweenProgress(0, 1, expandMs ?? CANVAS_INK_MENU_TIMING.expandMs, "power3.inOut");
  },

  async reveal({ origin, collapseMs } = {}) {
    if (!activeHandle?.uniforms) return;
    killActiveTween();
    if (origin) setOrigin(origin);

    if (prefersReducedMotion()) {
      setProgress(0);
      setVisible(0);
      return;
    }

    await tweenProgress(1, 0, collapseMs ?? CANVAS_INK_ROUTE_TIMING.collapseMs, "power3.in");
    setVisible(0);
  },

  setHoldVisible(visible) {
    if (!activeHandle?.uniforms) return;
    setVisible(visible ? 1 : 0);
    if (visible) setProgress(1);
  },
};
