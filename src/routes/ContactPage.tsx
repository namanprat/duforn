import React from "react";
import RotateHoverLabel from "../components/RotateHoverLabel";
import TextRevealLines from "../components/textReveal/TextRevealLines";
import { shouldUseNavRotateHover } from "../../scripts/link-hover";

const CONTACT_EMAIL = "naman@duforn.com";

export default function ContactPage() {
  const useRotateEmailHover = shouldUseNavRotateHover();

  return (
    <main id="main" data-page-container="true" data-page-namespace="contact">
      <section className="contact u-color-light u-background-transparent u-min-height-screen u-flex-vertical-nowrap u-justify-content-center u-align-items-center">
        <div className="contact-content u-container-main u-height-auto u-width-full u-max-width-full">
          <div className="contact-grid__title u-overflow-hidden u-width-full ">
            <TextRevealLines animateOnScroll={false}>
              <h1
                className="contact-page-title u-text-align-right u-text-style-h1 u-text-italic"
                data-brand-handoff-title="contact"
              >
                contact
              </h1>
            </TextRevealLines>
          </div>
          <TextRevealLines animateOnScroll={false} delay={0.06}>
            <p className="contact-grid__intro contact-intro u-text-align-right u-width-full">
              AVAILABLE FOR FREELANCE PROJECTS,
              <br />
              ART DIRECTION, AND DIGITAL DESIGN INQUIRIES.
            </p>
          </TextRevealLines>

          <div className="contact-info u-display-contents">
            <div className="u-flex-horizontal-wrap u-gap-3 u-align-items-center">
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
          </div>
        </div>
      </section>
    </main>
  );
}
