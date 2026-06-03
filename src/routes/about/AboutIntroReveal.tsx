// @ts-nocheck
import React, { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { waitForPreloader } from "../../text/useRevealGate";

gsap.registerPlugin(ScrollTrigger);

const HIGHLIGHT_BG = "60, 60, 60";
const PIN_DURATION = 4;

function updateWordStyles(words, progress, highlightBg) {
  const totalWords = words.length;

  words.forEach((word, index) => {
    const wordText = word.querySelector("span");
    if (!wordText) return;

    if (progress <= 0.7) {
      const revealProgress = Math.min(1, progress / 0.7);
      const overlapWords = 15;
      const wordStart = index / totalWords;
      const wordEnd = wordStart + overlapWords / totalWords;
      const timelineScale =
        1 /
        Math.min(
          1 + overlapWords / totalWords,
          1 + (totalWords - 1) / totalWords + overlapWords / totalWords,
        );
      const adjStart = wordStart * timelineScale;
      const adjEnd = wordEnd * timelineScale;
      const duration = adjEnd - adjStart;
      const wordProgress =
        revealProgress <= adjStart
          ? 0
          : revealProgress >= adjEnd
            ? 1
            : (revealProgress - adjStart) / duration;

      word.style.opacity = String(wordProgress);

      const bgFade = wordProgress >= 0.9 ? (wordProgress - 0.9) / 0.1 : 0;
      word.style.backgroundColor = `rgba(${highlightBg}, ${Math.max(0, 1 - bgFade)})`;

      const textReveal = wordProgress >= 0.9 ? (wordProgress - 0.9) / 0.1 : 0;
      wordText.style.opacity = String(Math.pow(textReveal, 0.5));
    } else {
      const reverseProgress = (progress - 0.7) / 0.3;
      word.style.opacity = "1";

      const reverseOverlap = 5;
      const rStart = index / totalWords;
      const rEnd = rStart + reverseOverlap / totalWords;
      const rScale = 1 / Math.max(1, (totalWords - 1) / totalWords + reverseOverlap / totalWords);
      const rAdjStart = rStart * rScale;
      const rAdjEnd = rEnd * rScale;
      const rDur = rAdjEnd - rAdjStart;
      const rProgress =
        reverseProgress <= rAdjStart
          ? 0
          : reverseProgress >= rAdjEnd
            ? 1
            : (reverseProgress - rAdjStart) / rDur;

      if (rProgress > 0) {
        wordText.style.opacity = String(1 - rProgress);
        word.style.backgroundColor = `rgba(${highlightBg}, ${rProgress})`;
      } else {
        wordText.style.opacity = "1";
        word.style.backgroundColor = `rgba(${highlightBg}, 0)`;
      }
    }
  });
}

export default function AboutIntroReveal({ paragraphs = [] }) {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposePreloader = null;
    let cancelled = false;

    const setup = () => {
      if (cancelled) return;

      const words = Array.from(container.querySelectorAll(".about-page__intro-word"));

      triggerRef.current = ScrollTrigger.create({
        trigger: container,
        pin: container,
        start: "top top",
        end: `+=${window.innerHeight * PIN_DURATION}`,
        pinSpacing: true,
        onUpdate: (self) => {
          updateWordStyles(words, self.progress, HIGHLIGHT_BG);
        },
      });

      ScrollTrigger.refresh();
    };

    disposePreloader = waitForPreloader(setup);

    return () => {
      cancelled = true;
      disposePreloader?.();
      triggerRef.current?.kill();
      triggerRef.current = null;
    };
  }, [paragraphs]);

  useLayoutEffect(() => {
    return () => {
      triggerRef.current?.kill();
      triggerRef.current = null;
    };
  }, []);

  return (
    <section
      className="about-page__intro u-min-height-screen u-flex-vertical-nowrap u-justify-content-center"
      ref={containerRef}
    >
      <div className="about-page__intro-inner u-text-align-center">
        {paragraphs.map((para, pi) => (
          <p key={pi} className="u-text-style-h6 u-color-light about-page__intro-paragraph">
            {para
              .split(/\s+/)
              .filter(Boolean)
              .map((word, wi) => (
                <span key={wi} className="about-page__intro-word">
                  <span>{word}</span>
                </span>
              ))}
          </p>
        ))}
      </div>
    </section>
  );
}
