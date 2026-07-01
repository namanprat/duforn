import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ABOUT_CLIENTS, ABOUT_INTRO_PARAGRAPHS, ABOUT_SERVICES } from "../content/studio";
import AboutDitherCanvas from "./AboutDitherCanvas";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import { getDeviceTier } from "../lib/deviceTier";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
gsap.registerPlugin(SplitText);

const CLIENT_COLS = [
  ABOUT_CLIENTS.filter((_, i) => i % 2 === 0),
  ABOUT_CLIENTS.filter((_, i) => i % 2 === 1),
] as const;

/** ponytail: skip tier-0 / reduced-motion; distortion hover stays fine-pointer-only */
function shouldMountAboutHelmet(): boolean {
  if (getDeviceTier() === 0) return false;
  return !prefersReducedMotion();
}

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
  const contentRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const linesRef = useRef<HTMLElement[]>([]);
  const splitsRef = useRef<SplitText[]>([]);
  const revealTweenRef = useRef<gsap.core.Tween | null>(null);
  const hideTweenRef = useRef<gsap.core.Tween | null>(null);
  // ponytail: the helmet Canvas does heavy synchronous Three.js init (env map, GLTF,
  // postFX). Mounting it on the same frame as the reveal froze the line tween until init
  // finished. Defer it until the reveal has played, then dissolve it in.
  const [mountCanvas, setMountCanvas] = useState(false);

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

    const overshoot = MOTION_TOKENS.textReveal.revealHiddenPercent;

    hideTweenRef.current = gsap.to(lines, {
      yPercent: up ? -overshoot : overshoot,
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
    const content = contentRef.current;
    if (!active || !content) return;

    if (mediaRef.current) {
      gsap.set(mediaRef.current, { clearProps: "opacity,visibility" });
    }

    if (prefersReducedMotion()) {
      gsap.set(content, { clearProps: "opacity,visibility" });
      if (mediaRef.current) gsap.set(mediaRef.current, { autoAlpha: 1 });
      if (shouldMountAboutHelmet()) setMountCanvas(true);
      return;
    }

    gsap.set(content, { autoAlpha: 0 });

    const blocks = Array.from(content.querySelectorAll<HTMLElement>("[data-reveal]"));
    const splits: SplitText[] = [];
    let allLines: HTMLElement[] = [];

    try {
      blocks.forEach((block) => {
        if (block.querySelector(".about-reveal-line")) return;
        const split = SplitText.create(block, {
          type: "lines",
          mask: "lines",
          linesClass: "about-reveal-line",
        });
        splits.push(split);
      });
      allLines = splits.flatMap((split) => split.lines) as HTMLElement[];
    } catch {
      gsap.set(content, { autoAlpha: 1 });
      if (shouldMountAboutHelmet()) setMountCanvas(true);
      return;
    }

    if (!allLines.length) {
      gsap.set(content, { autoAlpha: 1 });
      if (shouldMountAboutHelmet()) setMountCanvas(true);
      return;
    }

    splitsRef.current = splits;
    linesRef.current = allLines;
    gsap.set(allLines, { yPercent: MOTION_TOKENS.textReveal.revealHiddenPercent });
    gsap.set(content, { autoAlpha: 1 });

    const { revealDuration, revealStagger, revealEase } = MOTION_TOKENS.textReveal;
    revealTweenRef.current = gsap.to(allLines, {
      yPercent: 0,
      duration: revealDuration,
      stagger: revealStagger,
      ease: revealEase,
    });

    // Mount helmet early in the reveal so init overlaps text (preload handles GLTF).
    const canvasRaf = shouldMountAboutHelmet()
      ? requestAnimationFrame(() => setMountCanvas(true))
      : undefined;

    return () => {
      if (canvasRaf !== undefined) cancelAnimationFrame(canvasRaf);
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
      gsap.set(content, { clearProps: "opacity,visibility" });
    };
  }, [active]);

  useEffect(() => {
    if (!active) setMountCanvas(false);
  }, [active]);

  // Dissolve the helmet canvas in once it mounts (after the text reveal).
  useEffect(() => {
    if (!mountCanvas || !mediaRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      mediaRef.current,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: MOTION_TOKENS.menu.aboutHelmetFadeIn, ease: MOTION_TOKENS.textReveal.revealEase },
    );
  }, [mountCanvas]);

  return (
    <div className="about-panel__scroll">
      <div className="about-panel__content" ref={contentRef}>
        {ABOUT_INTRO_PARAGRAPHS.map((paragraph) => (
          <p key={paragraph} className="about-panel__text" data-reveal>
            {paragraph}
          </p>
        ))}

        <div className="about-panel__media" ref={mediaRef}>
          {mountCanvas && <AboutDitherCanvas eventSource={mediaRef} />}
        </div>

        <div className="about-panel__columns">
          <section className="about-panel__col">
            <p className="about-panel__label" data-reveal>
              Services
            </p>
            <div className="about-panel__list">
              {ABOUT_SERVICES.map((service) => (
                <p key={service} className="about-panel__item" data-reveal>
                  {service}
                </p>
              ))}
            </div>
          </section>

          <section className="about-panel__col">
            <p className="about-panel__label" data-reveal>
              Clients
            </p>
            <div className="about-panel__clients-cols">
              {CLIENT_COLS.map((col, colIdx) => (
                <div key={colIdx} className="about-panel__list">
                  {col.map((client) => (
                    <p key={client} className="about-panel__item" data-reveal>
                      {client}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
});

export default AboutPanel;
