import gsap from "gsap";

function killTweens(elements) {
  if (!elements.length) return;
  gsap.killTweensOf(elements);
}

function compactElements(elements) {
  return elements.filter(Boolean);
}

/** All routes share one R3F canvas (`UnifiedCanvas`); navigation never swaps canvas roots. */
export function getCanvasKey() {
  return "app";
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
    const timeline = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        gsap.set(targets, { clearProps: "transform,opacity" });
        resolve();
      },
    });

    if (canvasTargets.length) {
      timeline.to(canvasTargets, { autoAlpha: 0, yPercent: -12, scale: 0.985, duration: 0.46 }, 0);
    }
  });
}
