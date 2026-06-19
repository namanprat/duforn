import { useLayoutEffect, useRef, useState } from "react";
import { navigateTo } from "../lib/nav";
import TextRevealLines from "../text/Reveal";
import CameraRevealGroup from "../text/CameraRevealGroup";
import { STUDIO_INTRO_COPY } from "../content/studio";
import RotateHoverLabel from "../components/RotateHoverLabel";
import { shouldUseNavRotateHover } from "../lib/link-hover";

export default function MainPage() {
  const brandClipRef = useRef<HTMLDivElement | null>(null);
  const [heroCopyWidthPx, setHeroCopyWidthPx] = useState<number | null>(null);
  const useRotateHover = shouldUseNavRotateHover();

  useLayoutEffect(() => {
    const el = brandClipRef.current;
    if (!el) return;

    const measure = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      if (w > 0) setHeroCopyWidthPx(w);
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
          <div ref={brandClipRef} className="home-hero-brand-clip">
            <TextRevealLines animateOnScroll={false} waitForCamera>
              <h1 className="hero_title u-text-style-display">Duforn</h1>
            </TextRevealLines>
          </div>
          <div className="hero_cluster">
            {heroCopyWidthPx != null ? (
              <div
                className="hero-stage__copy-rail"
                style={{ width: heroCopyWidthPx, maxWidth: "100%" }}
              >
                <TextRevealLines
                  animateOnScroll={false}
                  waitForCamera
                  delay={0.08}
                  layoutKey={heroCopyWidthPx}
                >
                  <p className="hero_text u-text-align-center u-width-full">{STUDIO_INTRO_COPY}</p>
                </TextRevealLines>
              </div>
            ) : (
              <div
                className="hero-stage__copy-rail hero-stage__copy-rail--measuring"
                aria-hidden="true"
              />
            )}
            <CameraRevealGroup waitForCamera delay={0.16}>
              <div className="hero_actions">
                <a
                  className="button button-primary hero_action_wrap"
                  href="/work"
                  onClick={(e) => go(e, "/work")}
                  data-rotate-hover={useRotateHover ? "" : undefined}
                >
                  <span className="hero_action_text">
                    {useRotateHover ? <RotateHoverLabel text="View Work" /> : "View Work"}
                  </span>
                  <span className="hero_action_icon" aria-hidden="true">
                    ↗
                  </span>
                </a>
                <a
                  className="button button-secondary hero_action_wrap"
                  href="/contact"
                  onClick={(e) => go(e, "/contact")}
                  data-rotate-hover={useRotateHover ? "" : undefined}
                >
                  <span className="hero_action_text">
                    {useRotateHover ? <RotateHoverLabel text="Contact" /> : "Contact"}
                  </span>
                  <span className="hero_action_icon" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
            </CameraRevealGroup>
          </div>
        </div>
      </div>
    </main>
  );
}
