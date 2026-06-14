import React, { useLayoutEffect, useRef, useState } from "react";
import { navigateTo } from "../lib/nav";
import TextRevealLines from "../text/Reveal";
import CameraRevealGroup from "../text/CameraRevealGroup";
import RotateHoverLabel from "../ui/HoverLabel";
import { shouldUseNavRotateHover } from "../../scripts/link-hover";
import { STUDIO_INTRO_COPY } from "../content/studio";

const HERO_CTA_LABEL = "VIEW WORK";
const HERO_CONTACT_LABEL = "CONTACT";

export default function MainPage() {
  const brandClipRef = useRef<HTMLDivElement | null>(null);
  const [heroCopyWidthPx, setHeroCopyWidthPx] = useState<number | null>(null);
  const useRotateButtonHover = shouldUseNavRotateHover();

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

  return (
    <>
      <main id="main" data-page-container="true" data-page-namespace="main">
        <section className="hero u-color-light u-background-transparent u-min-height-screen">
          <div className="hero-stage__contain u-container-main u-height-full u-width-full u-max-width-full">
            <div className="hero-stage__center">
              <div className="hero-stage__brand-stack">
                <div ref={brandClipRef} className="home-hero-brand-clip">
                  <TextRevealLines animateOnScroll={false} waitForPreloader waitForCamera>
                    <h1
                      className="home-hero-brand u-text-style-display"
                      data-brand-handoff-title="main"
                    >
                      Duforn
                    </h1>
                  </TextRevealLines>
                </div>
                <div className="u-flex-vertical-nowrap u-align-items-center u-gap-4">
                  {heroCopyWidthPx != null ? (
                    <div
                      className="hero-stage__copy-rail"
                      style={{ width: heroCopyWidthPx, maxWidth: "100%" }}
                    >
                      <TextRevealLines
                        animateOnScroll={false}
                        waitForPreloader
                        waitForCamera
                        delay={0.08}
                        layoutKey={heroCopyWidthPx}
                      >
                        <p className="u-text-align-center u-width-full">{STUDIO_INTRO_COPY}</p>
                      </TextRevealLines>
                    </div>
                  ) : (
                    <div
                      className="hero-stage__copy-rail hero-stage__copy-rail--measuring"
                      aria-hidden="true"
                    />
                  )}
                  <CameraRevealGroup waitForCamera waitForPreloader delay={0.16}>
                    <div className="hero-stage__actions">
                      <a
                        className="button button-primary hero-stage__cta"
                        href="/work"
                        data-rotate-hover={useRotateButtonHover ? "" : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo("/work");
                        }}
                      >
                        {useRotateButtonHover ? (
                          <RotateHoverLabel text={HERO_CTA_LABEL} />
                        ) : (
                          <span className="hero-stage__cta-label">{HERO_CTA_LABEL}</span>
                        )}
                        <span aria-hidden="true">↗</span>
                      </a>
                      <a
                        className="button button-secondary hero-stage__cta"
                        href="/contact"
                        data-rotate-hover={useRotateButtonHover ? "" : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo("/contact");
                        }}
                      >
                        {useRotateButtonHover ? (
                          <RotateHoverLabel text={HERO_CONTACT_LABEL} />
                        ) : (
                          <span className="hero-stage__cta-label">{HERO_CONTACT_LABEL}</span>
                        )}
                        <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </CameraRevealGroup>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
