import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import {
  ABOUT_CLIENTS,
  ABOUT_INTRO_PARAGRAPHS,
  ABOUT_META,
} from "../content/studio";
import AboutDitherCanvas from "./AboutDitherCanvas";
import Lenis from "lenis";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";

gsap.registerPlugin(SplitText);

export type AboutPanelHandle = {
  /** Unreveal lines; returns total animation duration in seconds. */
  hide: () => number;
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
  const linesRef = useRef<HTMLElement[]>([]);
  const splitsRef = useRef<SplitText[]>([]);
  const revealTweenRef = useRef<gsap.core.Tween | null>(null);
  const hideTweenRef = useRef<gsap.core.Tween | null>(null);
  const rafRef = useRef(0);

  useImperativeHandle(ref, () => ({
    hide() {
      revealTweenRef.current?.kill();
      hideTweenRef.current?.kill();

      const lines = linesRef.current;
      if (!lines.length) return 0;

      const { hideDuration, hideStagger, hideEase } = MOTION_TOKENS.textReveal;
      const total = hideDuration + hideStagger * Math.max(lines.length - 1, 0);

      hideTweenRef.current = gsap.to(lines, {
        yPercent: 100,
        duration: hideDuration,
        stagger: { each: hideStagger, from: "end" },
        ease: hideEase,
      });

      return total;
    },
  }));

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!active || !wrapper || !content) return;

    if (prefersReducedMotion()) {
      gsap.set(content, { clearProps: "opacity,visibility" });
      return;
    }

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

    const { revealDuration, revealStagger, revealEase } = MOTION_TOKENS.textReveal;
    revealTweenRef.current = gsap.to(allLines, {
      yPercent: 0,
      duration: revealDuration,
      stagger: revealStagger,
      ease: revealEase,
      delay: MOTION_TOKENS.menu.aboutRevealDelay,
    });

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

        <div className="about-panel__media">
          {active && <AboutDitherCanvas />}
        </div>

        <p className="about-panel__meta" data-reveal>
          {ABOUT_META.est} — {ABOUT_META.based}
        </p>

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
