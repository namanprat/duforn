import React from "react";

export default function ContactPage() {
  return (
    <main id="main" data-page-container="true" data-page-namespace="contact">
      <section className="contact-section u-background-transparent">
        <div className="contact-content u-container-main">
          <div className="contact-group contact-group--title">
            <div className="home-hero-brand-clip">
              <h1
                className="reveal-title contact-page-title u-text-style-display"
                data-brand-handoff-title="contact"
                data-split-type="chars"
              >
                contact
              </h1>
            </div>
            <p className="contact-intro reveal-body">
              AVAILABLE FOR FREELANCE PROJECTS, ART DIRECTION, AND DIGITAL DESIGN INQUIRIES.
            </p>
          </div>

          <div
            className="contact-group contact-group--cluster contact-info reveal-body"
            data-reveal-allow-interactive
          >
            <div className="contact-block">
              <p className="contact-label">EMAIL</p>
              <h2>
                <a href="mailto:naman@duforn.com">NAMAN@DUFORN.COM</a>
              </h2>
            </div>

            <div className="contact-block">
              <p className="contact-label">INSTAGRAM</p>
              <h2>
                <a
                  href="https://www.instagram.com/namanprat_"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NAMANPRAT_
                </a>
              </h2>
            </div>

            <div className="contact-block">
              <p className="contact-label">CAL.COM</p>
              <h2>
                <a
                  href="https://cal.com/namanprat/discovery-call"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  DISCOVERY CALL
                </a>
              </h2>
            </div>
          </div>
        </div>

        <div className="contact-footer">
          <div className="contact-footer-svg" role="img" aria-label="Duforn sticker" />
        </div>
      </section>
    </main>
  );
}
