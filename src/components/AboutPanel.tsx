import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ABOUT_CLIENTS, ABOUT_INTRO_PARAGRAPHS } from "../content/studio";
import AboutDitherCanvas from "./AboutDitherCanvas";
import Lenis from "lenis";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";

gsap.registerPlugin(SplitText);

export type AboutPanelHandle = {
  /** Unreveal lines (up = exit through the top); returns total duration in seconds. */
  hide: (up: boolean) => number;
};

interface AboutPanelProps {
  /** True once the about box is visible and ready for line reveal setup. */
  active: boolean;
}

const AboutPanel = forwardRef<AboutPanelHandle, AboutPanelProps>(function AboutPanel(
  { active },
  ref,
) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const linesRef = useRef<HTMLElement[]>([]);
  const splitsRef = useRef<SplitText[]>([]);
  const revealTweenRef = useRef<gsap.core.Tween | null>(null);
  const hideTweenRef = useRef<gsap.core.Tween | null>(null);
  const rafRef = useRef(0);

  const runHide = (up: boolean) => {
    revealTweenRef.current?.kill();
    hideTweenRef.current?.kill();

    const lines = linesRef.current;
    if (!lines.length) return 0;

    const { hideDuration, hideStagger, hideEase } = MOTION_TOKENS.textReveal;
    const close = MOTION_TOKENS.menu.closeSpeedScale;
    const dur = hideDuration * close;
    const stag = hideStagger * close;
    const total = dur + stag * Math.max(lines.length - 1, 0);

    hideTweenRef.current = gsap.to(lines, {
      yPercent: up ? -100 : 100,
      duration: dur,
      stagger: { each: stag, from: "end" },
      ease: hideEase,
    });

    // Dissolve the 3D canvas out in parallel, over the full text-unreveal span.
    if (mediaRef.current) {
      gsap.to(mediaRef.current, { autoAlpha: 0, duration: total, ease: hideEase });
    }

    return total;
  };

  useImperativeHandle(ref, () => ({
    hide: runHide,
  }));

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!active || !wrapper || !content) return;

    if (prefersReducedMotion()) {
      gsap.set(content, { clearProps: "opacity,visibility" });
      return;
    }

    gsap.set(content, { autoAlpha: 0 });

    const blocks = Array.from(content.querySelectorAll<HTMLElement>("[data-reveal]"));
    const splits: SplitText[] = [];

    blocks.forEach((block) => {
      if (block.querySelector(".about-reveal-line")) return;
      const split = SplitText.create(block, {
        type: "lines",
        mask: "lines",
        linesClass: "about-reveal-line",
      });
      splits.push(split);
    });

    splitsRef.current = splits;
    const allLines = splits.flatMap((split) => split.lines) as HTMLElement[];
    linesRef.current = allLines;
    gsap.set(allLines, { yPercent: 100 });
    gsap.set(content, { autoAlpha: 1 });

    const { revealDuration, revealStagger, revealEase } = MOTION_TOKENS.textReveal;
    revealTweenRef.current = gsap.to(allLines, {
      yPercent: 0,
      duration: revealDuration,
      stagger: revealStagger,
      ease: revealEase,
    });

    // Dissolve the 3D canvas in, in parallel over the full text-reveal span.
    const revealSpan = revealDuration + revealStagger * Math.max(allLines.length - 1, 0);
    if (mediaRef.current) {
      gsap.fromTo(
        mediaRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: revealSpan, ease: revealEase },
      );
    }

    const lenis = new Lenis({
      wrapper,
      content,
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 0.8,
    });
    lenis.scrollTo(0, { immediate: true });
    lenis.resize();

    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    const resizeId = requestAnimationFrame(() => lenis.resize());

    return () => {
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(resizeId);
      revealTweenRef.current?.kill();
      hideTweenRef.current?.kill();
      splits.forEach((split) => {
        try {
          split.revert();
        } catch {
          /* ignore */
        }
      });
      splitsRef.current = [];
      linesRef.current = [];
      lenis.destroy();
      gsap.set(content, { clearProps: "opacity,visibility" });
    };
  }, [active]);

  return (
    <div className="about-panel__scroll" ref={wrapperRef} data-lenis-prevent="true">
      <div className="about-panel__content" ref={contentRef}>
        {ABOUT_INTRO_PARAGRAPHS.map((paragraph) => (
          <p key={paragraph} className="about-panel__text" data-reveal>
            {paragraph}
          </p>
        ))}

        <div className="about-panel__media" ref={mediaRef}>
          {active && <AboutDitherCanvas />}
        </div>

        <section className="about-panel__section">
          <p className="about-panel__label" data-reveal>
            Clients
          </p>
          <div className="about-panel__list">
            {ABOUT_CLIENTS.map((client) => (
              <p key={client} className="about-panel__item" data-reveal>
                {client}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
});

export default AboutPanel;
