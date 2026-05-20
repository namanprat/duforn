// @ts-nocheck

let lockedMobileHeight = 0;
let lastMobileWidth = 0;
let lastOrientationAngle = 0;

function isCoarsePointer() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

export function getScreenOrientationAngle() {
  if (typeof window === "undefined") return 0;
  if (window.screen?.orientation && Number.isFinite(window.screen.orientation.angle)) {
    return window.screen.orientation.angle;
  }
  if (Number.isFinite(window.orientation)) {
    return window.orientation;
  }
  return 0;
}

function readViewportDimensions() {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  const visualViewport = window.visualViewport;
  const width = Math.round(visualViewport?.width ?? window.innerWidth);
  const height = Math.round(visualViewport?.height ?? window.innerHeight);

  return {
    width: Math.max(width, 1),
    height: Math.max(height, 1),
  };
}

export function getStableViewportSize() {
  const { width, height } = readViewportDimensions();
  const orientationAngle = getScreenOrientationAngle();

  if (!isCoarsePointer()) {
    lockedMobileHeight = 0;
    lastMobileWidth = 0;
    lastOrientationAngle = orientationAngle;
    return { width, height };
  }

  if (lastMobileWidth !== width || lastOrientationAngle !== orientationAngle) {
    lastMobileWidth = width;
    lastOrientationAngle = orientationAngle;
    lockedMobileHeight = height;
  } else {
    lockedMobileHeight = Math.max(lockedMobileHeight || height, height);
  }

  return {
    width,
    height: lockedMobileHeight || height,
  };
}

export function normalizeViewportPoint(clientX, clientY, viewport = getStableViewportSize()) {
  const x = (clientX / viewport.width) * 2 - 1;
  const y = -((clientY / viewport.height) * 2 - 1);
  return { x, y };
}

export function subscribeStableViewport(onChange) {
  if (typeof window === "undefined") return () => {};

  let frame = 0;
  const notify = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      onChange(getStableViewportSize());
    });
  };

  window.addEventListener("resize", notify, { passive: true });
  window.addEventListener("orientationchange", notify, { passive: true });
  window.visualViewport?.addEventListener("resize", notify, { passive: true });
  window.visualViewport?.addEventListener("scroll", notify, { passive: true });

  notify();

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", notify);
    window.removeEventListener("orientationchange", notify);
    window.visualViewport?.removeEventListener("resize", notify);
    window.visualViewport?.removeEventListener("scroll", notify);
  };
}
