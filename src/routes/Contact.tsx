import { useLayoutEffect, useRef, useState } from "react";
import ContactWordmark from "./ContactWordmark";
import TextRevealLines from "../text/Reveal";
import CameraRevealGroup from "../text/CameraRevealGroup";
import MaskReveal from "../text/MaskReveal";
import StaggerHoverButton from "../components/StaggerHoverButton";
import StaggerHoverChars from "../components/StaggerHoverChars";
import { CONTACT_EMAIL, CONTACT_INTRO_COPY, CONTACT_LINKS } from "../content/studio";

const DESKTOP_MQ = "(min-width: 50em)";

export default function ContactPage() {
  const buttonsRef = useRef<HTMLDivElement>(null);
  const [buttonsHeight, setButtonsHeight] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(DESKTOP_MQ).matches : true,
  );

  useLayoutEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useLayoutEffect(() => {
    const el = buttonsRef.current;
    if (!el) return;
    const mq = window.matchMedia(DESKTOP_MQ);

    const update = () => {
      if (!mq.matches) {
        setButtonsHeight(null);
        return;
      }
      setButtonsHeight(el.getBoundingClientRect().height);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    mq.addEventListener("change", update);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  const containStyle =
    buttonsHeight != null
      ? ({ "--contact-buttons-height": `${buttonsHeight}px` } as React.CSSProperties)
      : undefined;

  return (
    <main
      className="contact_wrap u-min-height-screen u-color-light u-background-transparent"
      data-page-namespace="contact"
    >
      <div className="contact_contain u-container-main" style={containStyle}>
        <div className="contact_title_wrap u-width-full">
          <MaskReveal waitForCamera delay={0.06}>
            <h1 className="contact_title" aria-label="contact">
              <ContactWordmark className="contact_title_svg" align={isDesktop ? "start" : "mid"} />
            </h1>
          </MaskReveal>
        </div>

        <TextRevealLines animateOnScroll={false} waitForCamera delay={0.06}>
          <p className="contact_intro u-width-full">{CONTACT_INTRO_COPY}</p>
        </TextRevealLines>

        <div className="contact_actions_wrap">
          <CameraRevealGroup delay={0.12}>
            <div ref={buttonsRef} className="contact_buttons_wrap">
              {CONTACT_LINKS.map((link, index) => (
                <StaggerHoverButton
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant={index === 0 ? "primary" : "secondary"}
                  className="contact_button_wrap"
                  label={link.label}
                  icon={
                    <span className="contact_button_icon" aria-hidden="true">
                      ↗
                    </span>
                  }
                />
              ))}
            </div>
            <h2 className="contact_email">
              <a
                className="contact_email_link_wrap u-text-style-h2 u-text-lowercase"
                href={`mailto:${CONTACT_EMAIL}`}
              >
                <StaggerHoverChars>{CONTACT_EMAIL}</StaggerHoverChars>
              </a>
            </h2>
          </CameraRevealGroup>
        </div>
      </div>
    </main>
  );
}
