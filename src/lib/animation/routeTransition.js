import gsap from 'gsap';

export function runRouteEnterTransition(element) {
  if (!element) return () => {};
  const tween = gsap.fromTo(
    element,
    { autoAlpha: 0, y: 10 },
    { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }
  );

  return () => {
    tween.kill();
  };
}
