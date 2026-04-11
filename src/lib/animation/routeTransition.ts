// @ts-nocheck
import gsap from "gsap";

function killTweens(elements) {
  if (!elements.length) return;
  gsap.killTweensOf(elements);
}

function compactElements(elements) {
  return elements.filter(Boolean);
}

const HOME_NAMESPACE = "home";
const CONTACT_NAMESPACE = "contact";

function isHomeContactPair(a, b) {
  return (
    (a === HOME_NAMESPACE && b === CONTACT_NAMESPACE) ||
    (a === CONTACT_NAMESPACE && b === HOME_NAMESPACE)
  );
}

/**
 * One persistent R3F canvas wraps all routes; we still tween its DOM wrapper on namespace changes
 * so leave/enter motion stays aligned with route transitions.
 * Home and contact share the same canvas branch; skip the fade between them.
 */
export function shouldAnimateCanvasBetweenNamespaces(fromNamespace, toNamespace) {
  if (!fromNamespace || !toNamespace || fromNamespace === toNamespace) return false;
  if (isHomeContactPair(fromNamespace, toNamespace)) return false;
  return true;
}

export function runRouteEnterTransition({ canvasElement } = {}) {
  const canvasTargets = compactElements([canvasElement]);
  const targets = compactElements([...canvasTargets]);

  if (!targets.length) return () => {};

  killTweens(targets);

  const timeline = gsap.timeline({
    defaults: { ease: "power3.out" },
  });

  if (canvasTargets.length) {
    timeline.fromTo(
      canvasTargets,
      { autoAlpha: 0, yPercent: 12, scale: 1.02 },
      { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.7, clearProps: "transform,opacity" },
      0,
    );
  }

  return () => {
    timeline.kill();
    killTweens(targets);
  };
}

export function runRouteLeaveTransition({ canvasElement } = {}) {
  const canvasTargets = compactElements([canvasElement]);
  const targets = compactElements([...canvasTargets]);

  if (!targets.length) return Promise.resolve();

  killTweens(targets);

  return new Promise((resolve) => {
    const finish = () => {
      gsap.set(targets, { clearProps: "transform,opacity" });
      resolve();
    };
    const timeline = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: finish,
      onInterrupt: finish,
    });

    if (canvasTargets.length) {
      timeline.to(canvasTargets, { autoAlpha: 0, yPercent: -12, scale: 0.985, duration: 0.46 }, 0);
    }
  });
}
