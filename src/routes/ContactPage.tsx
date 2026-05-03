import React from "react";
import RotateHoverLabel from "../components/RotateHoverLabel";
import { shouldUseNavRotateHover } from "../../scripts/link-hover";

const CONTACT_EMAIL = "naman@duforn.com";

export default function ContactPage() {
  const useRotateEmailHover = shouldUseNavRotateHover();

  return (
    <main id="main" data-page-container="true" data-page-namespace="contact">
      <section className="contact-section u-color-light u-background-transparent">
        <div className="contact-content contact-content--grid u-container-main">
          <div className="contact-grid__title u-overflow-hidden u-width-full">
            <h2
              className="contact-page-title u-text-align-right"
              data-brand-handoff-title="contact"
              data-split-type="chars"
            >
              contact
            </h2>
          </div>
          <p className="contact-grid__intro contact-intro u-text-align-right u-width-full">
            AVAILABLE FOR FREELANCE PROJECTS,
            <br />
            ART DIRECTION, AND DIGITAL DESIGN INQUIRIES.
          </p>

          <div className="contact-info u-display-contents">
            <div className="contact-grid__chips contact-action-row">
              <a
                className="button button-primary"
                href="https://www.instagram.com/namanprat_"
                target="_blank"
                rel="noopener noreferrer"
              >
                INSTAGRAM <span aria-hidden="true">↗</span>
              </a>
              <a
                className="button button-secondary"
                href="https://cal.com/namanprat/discovery-call"
                target="_blank"
                rel="noopener noreferrer"
              >
                DISCOVERY CALL <span aria-hidden="true">↗</span>
              </a>
            </div>
            <h2 className="contact-grid__email contact-email">
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
