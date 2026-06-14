import React, { useLayoutEffect, useRef, useState } from "react";
import RotateHoverLabel from "../ui/HoverLabel";
import TextRevealLines from "../text/Reveal";
import CameraRevealGroup from "../text/CameraRevealGroup";
import MaskReveal from "../text/MaskReveal";
import { shouldUseNavRotateHover } from "../../scripts/link-hover";
import ContactWordmark from "./ContactWordmark";

const CONTACT_EMAIL = "naman@duforn.com";
const CONTACT_DESKTOP_MQ = "(min-width: 769px)";

export default function ContactPage() {
  const useRotateEmailHover = shouldUseNavRotateHover();
  const buttonsRef = useRef<HTMLDivElement>(null);
  const [buttonsHeight, setButtonsHeight] = useState<number | null>(null);
  const [isDesktopLayout, setIsDesktopLayout] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(CONTACT_DESKTOP_MQ).matches : true,
  );

  useLayoutEffect(() => {
    const mq = window.matchMedia(CONTACT_DESKTOP_MQ);
    const onLayoutChange = () => setIsDesktopLayout(mq.matches);
    onLayoutChange();
    mq.addEventListener("change", onLayoutChange);
    return () => mq.removeEventListener("change", onLayoutChange);
  }, []);

  useLayoutEffect(() => {
    const el = buttonsRef.current;
    if (!el) return;

    const mq = window.matchMedia(CONTACT_DESKTOP_MQ);

    const update = () => {
      if (!mq.matches) {
        setButtonsHeight(null);
        return;
      }
      setButtonsHeight(el.getBoundingClientRect().height);
    };

    update();

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(el);
    mq.addEventListener("change", update);

    return () => {
      ro?.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  const contactContentStyle =
    buttonsHeight != null
      ? ({ "--contact-buttons-height": `${buttonsHeight}px` } as React.CSSProperties)
      : undefined;

  return (
    <main id="main" data-page-container="true" data-page-namespace="contact">
      <section className="contact u-color-light u-background-transparent u-min-height-screen u-flex-vertical-nowrap u-justify-content-center u-align-items-center">
        <div
          className="contact-content u-container-main u-height-auto u-width-full u-max-width-full"
          style={contactContentStyle}
        >
          <div className="contact-grid__title u-overflow-hidden u-width-full">
            <MaskReveal waitForCamera delay={0.06} className="contact-page-title-mask">
              <h1
                className="contact-page-title"
                aria-label="contact"
                data-brand-handoff-title="contact"
              >
                <ContactWordmark
                  className="contact-page-title-svg"
                  align={isDesktopLayout ? "start" : "mid"}
                />
              </h1>
            </MaskReveal>
          </div>
          <TextRevealLines animateOnScroll={false} waitForCamera delay={0.06}>
            <p className="contact-grid__intro contact-intro u-text-align-right u-width-full">
              AVAILABLE FOR FREELANCE PROJECTS,
              <br />
              ART DIRECTION, AND DIGITAL DESIGN INQUIRIES.
            </p>
          </TextRevealLines>

          <div className="contact-grid__actions u-flex-vertical-nowrap u-gap-3">
            <CameraRevealGroup delay={0.12}>
              <div
                ref={buttonsRef}
                className="contact-grid__buttons u-flex-vertical-nowrap u-gap-2"
              >
                <a
                  className="button button-primary"
                  href="https://www.instagram.com/namanprat_"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-rotate-hover={useRotateEmailHover ? "" : undefined}
                >
                  {useRotateEmailHover ? <RotateHoverLabel text="INSTAGRAM" /> : "INSTAGRAM"}{" "}
                  <span aria-hidden="true">↗</span>
                </a>
                <a
                  className="button button-secondary"
                  href="https://cal.com/namanprat/discovery-call"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-rotate-hover={useRotateEmailHover ? "" : undefined}
                >
                  {useRotateEmailHover ? (
                    <RotateHoverLabel text="DISCOVERY CALL" />
                  ) : (
                    "DISCOVERY CALL"
                  )}{" "}
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
              <h2 className="contact-grid__email contact-email u-text-italic">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  data-rotate-hover={useRotateEmailHover ? "" : undefined}
                >
                  {useRotateEmailHover ? <RotateHoverLabel text={CONTACT_EMAIL} /> : CONTACT_EMAIL}
                </a>
              </h2>
            </CameraRevealGroup>
          </div>
        </div>
      </section>
    </main>
  );
}
