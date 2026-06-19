import Lenis from "lenis";

export function createAboutLenis(wrapper: HTMLElement, content: HTMLElement) {
  return new Lenis({
    wrapper,
    content,
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 0.8,
  });
}
