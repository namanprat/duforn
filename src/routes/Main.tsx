import { useLayoutEffect, useRef, useState } from "react";
import { navigateTo } from "../lib/nav";
import TextRevealLines from "../text/Reveal";
import CameraRevealGroup from "../text/CameraRevealGroup";
import RotateHoverLabel from "../components/RotateHoverLabel";
import { shouldUseNavRotateHover } from "../lib/link-hover";
import {
  STUDIO_INTRO_COPY,
  HERO_EYEBROW,
  HERO_TITLE_LEAD,
  HERO_TITLE_SERIF,
} from "../content/studio";

export default function MainPage() {
  const pillRef = useRef<HTMLAnchorElement | null>(null);
  const useRotateHover = shouldUseNavRotateHover();
  // Width of the centered pill. The copy rail is sized to this so the
  // left-aligned paragraph shares the button's left edge (per Figma), while the
  // text overflows to the right.
  const [ctaWidthPx, setCtaWidthPx] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = pillRef.current;
    if (!el) return;

    const measure = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      if (w > 0) setCtaWidthPx(w);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    let cancelled = false;
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) measure();
      });
    }

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, []);

  const go = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    event.preventDefault();
    navigateTo(path);
  };

  return (
    <main
      className="hero_wrap u-min-height-screen u-color-light u-background-transparent"
      data-page-namespace="main"
    >
      <div className="hero_contain u-container-main">
        <div className="hero_stack">
          <CameraRevealGroup waitForCamera waitForScene>
            <p className="hero_eyebrow">{HERO_EYEBROW}</p>
          </CameraRevealGroup>
          <div className="home-hero-brand-clip">
            <TextRevealLines animateOnScroll={false} waitForCamera waitForScene>
              <h1 className="hero_title_lead">{HERO_TITLE_LEAD}</h1>
            </TextRevealLines>
            <TextRevealLines animateOnScroll={false} waitForCamera waitForScene delay={0.06}>
              <p className="hero_title_serif">{HERO_TITLE_SERIF}</p>
            </TextRevealLines>
          </div>
          <div className="hero_cluster">
            <div
              className="hero-stage__copy-rail"
              style={ctaWidthPx ? { width: ctaWidthPx } : undefined}
            >
              <TextRevealLines animateOnScroll={false} waitForCamera waitForScene delay={0.12}>
                <p className="hero_text">{STUDIO_INTRO_COPY}</p>
              </TextRevealLines>
            </div>
            <CameraRevealGroup waitForCamera waitForScene delay={0.18}>
              <div className="hero_actions">
                <a
                  ref={pillRef}
                  className="button button-primary hero_pill"
                  href="/work"
                  data-rotate-hover={useRotateHover ? "" : undefined}
                  onClick={(e) => go(e, "/work")}
                >
                  <span className="hero_pill_text">
                    {useRotateHover ? <RotateHoverLabel text="View Work" /> : "View Work"}
                  </span>
                  <span className="hero_pill_dot" aria-hidden="true" />
                </a>
              </div>
            </CameraRevealGroup>
          </div>
        </div>
      </div>
    </main>
  );
}
