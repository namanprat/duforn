import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ABOUT_AWARDS,
  ABOUT_CLIENTS,
  ABOUT_INTRO_PARAGRAPHS,
  ABOUT_META,
  ABOUT_PRINCIPLES,
} from "../content/studio";
import AboutDitherCanvas from "./AboutDitherCanvas";
import Lenis from "lenis";
import { MOTION_TOKENS } from "../lib/anim/tokens";
import { MOTION_TOKENS as MENU_MOTION } from "../lib/animation/motionTokens";

gsap.registerPlugin(SplitText, ScrollTrigger);

interface AboutPanelProps {
  /** Becomes true once the box has finished expanding — the cue to reveal the copy. */
  active: boolean;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function AboutPanel({ active }: AboutPanelProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!active || !wrapper || !content) return;

    if (prefersReducedMotion()) {
      gsap.set(content, { autoAlpha: 1 });
      return;
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

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Split each text block into lines, then reveal line-by-line as it scrolls into view.
    const blocks = Array.from(content.querySelectorAll<HTMLElement>("[data-reveal]"));
    const splits: SplitText[] = [];
    const linesByBlock = new Map<Element, Element[]>();

    blocks.forEach((block) => {
      const split = SplitText.create(block, {
        type: "lines",
        mask: "lines",
        linesClass: "about-reveal-line",
      });
      splits.push(split);
      linesByBlock.set(block, split.lines);
    });

    const allLines = splits.flatMap((split) => split.lines);
    gsap.set(allLines, { y: "100%" });
    gsap.set(content, { autoAlpha: 1 });

    const { revealDuration, revealStagger, revealEase } = MOTION_TOKENS.textReveal;
    const triggers = ScrollTrigger.batch(blocks, {
      scroller: wrapper,
      start: "top 95%",
      once: true,
      onEnter: (els) => {
        const lines = els.flatMap((el) => linesByBlock.get(el) ?? []);
        gsap.to(lines, {
          y: "0%",
          duration: revealDuration,
          stagger: revealStagger,
          ease: revealEase,
          delay: MENU_MOTION.menu.aboutRevealDelay,
        });
      },
    });

    lenis.on("scroll", ScrollTrigger.update);
    const refreshId = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(refreshId);
      lenis.off("scroll", ScrollTrigger.update);
      triggers.forEach((trigger) => trigger.kill());
      splits.forEach((split) => {
        try {
          split.revert();
        } catch {
          /* ignore */
        }
      });
      gsap.set(content, { clearProps: "opacity,visibility" });
      lenis.destroy();
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

        <section className="about-panel__section about-panel__section--divided">
          <p className="about-panel__label" data-reveal>
            Awards
          </p>
          <div className="about-panel__list">
            {ABOUT_AWARDS.map((award) => (
              <p key={award} className="about-panel__item" data-reveal>
                {award}
              </p>
            ))}
          </div>
        </section>

        <section className="about-panel__section about-panel__section--divided">
          <p className="about-panel__label" data-reveal>
            Our principles
          </p>
          <div className="about-panel__principles">
            {ABOUT_PRINCIPLES.map((principle) => (
              <div key={principle.title} className="about-panel__principle">
                <p className="about-panel__principle-title" data-reveal>
                  {principle.title}
                </p>
                <p className="about-panel__principle-body" data-reveal>
                  {principle.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
