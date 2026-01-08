import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const splits = new Map();

gsap.registerPlugin(SplitText, ScrollTrigger);

function tweenToPromise(tween) {
  return tween ? new Promise((resolve) => tween.eventCallback("onComplete", resolve)) : Promise.resolve();
}

function getOrSplit(element) {
  if (!element) return null;
  if (splits.has(element)) return splits.get(element);
  const split = new SplitText(element, { type: "lines, words, chars" });
  if (split.lines) {
    split.lines.forEach((line) => {
      line.style.overflow = "hidden";
    });
  }
  splits.set(element, split);
  return split;
}

function revealWords(element, { direction = "up", duration = 0.8, stagger = 0.03, ease = "power2.out" } = {}) {
  const split = getOrSplit(element);
  if (!split) return null;
  const yStart = direction === "down" ? 100 : -100;
  return gsap.fromTo(
    split.words,
    { y: yStart, filter: "blur(0px)", opacity: 0 },
    { y: 0, filter: "blur(0px)", opacity: 1, duration, stagger, ease }
  );
}

function fadeNodes(nodes, { duration = 0.55, stagger = 0.03, ease = "power2.out" } = {}) {
  if (!nodes || !nodes.length) return null;
  return gsap.fromTo(nodes, { opacity: 0 }, { opacity: 1, duration, stagger, ease });
}

async function animateRevealEnter(container) {
  const texts = container?.querySelectorAll("a,p,h2,h3,h4");
  const textReveal = container?.querySelector(".text-reveal");
  const textRevealReverse = container?.querySelector(".text-reveal-reverse");

  if (texts?.length) {
    gsap.set(texts, { opacity: 0, clearProps: "transform" });
  }

  if (textReveal) {
    const others = Array.from(texts || []).filter((t) => t !== textReveal);
    const mainTween = revealWords(textReveal, { direction: "up" });
    const othersTween = fadeNodes(others);
    await Promise.all([tweenToPromise(mainTween), tweenToPromise(othersTween)]);
    return;
  }

  if (textRevealReverse) {
    const others = Array.from(texts || []).filter((t) => t !== textRevealReverse);
    const mainTween = revealWords(textRevealReverse, { direction: "down" });
    const othersTween = fadeNodes(others);
    await Promise.all([tweenToPromise(mainTween), tweenToPromise(othersTween)]);
    return;
  }

  if (texts?.length) {
    await tweenToPromise(fadeNodes(Array.from(texts)));
  }
}

function initScrollTextReveals() {
  const regular = document.querySelectorAll(".text-reveal");
  regular.forEach((el) => {
    const split = getOrSplit(el);
    if (!split) return;
    gsap.fromTo(
      split.words,
      { y: -100, filter: "blur(0px)", opacity: 0 },
      {
        y: 0,
        filter: "blur(0px)",
        opacity: 1,
        duration: 1,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 80%" },
      }
    );
  });

  const reverse = document.querySelectorAll(".text-reveal-reverse");
  reverse.forEach((el) => {
    const split = getOrSplit(el);
    if (!split) return;
    gsap.fromTo(
      split.words,
      { y: 100, filter: "blur(0px)", opacity: 0 },
      {
        y: 0,
        filter: "blur(0px)",
        opacity: 1,
        duration: 1,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 80%" },
      }
    );
  });
}

export { getOrSplit, animateRevealEnter, initScrollTextReveals };
