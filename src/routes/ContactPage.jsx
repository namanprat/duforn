import React from "react";

export default function ContactPage() {
  return (
    <main id="main" data-page-container="true" data-page-namespace="contact">
      <section className="hero u-background-transparent">
        <div className="u-container contact-contain u-alignment-center">
          <h2 className="contact-header reveal-body">Say Hi!</h2>
          <a
            href="mailto:naman@duforn.com"
            className="u-text-style-h2 u-text-style-font-primary reveal-body"
          >
            naman@duforn.com
          </a>
          <div className="middle u-flex-horizontal-nowrap u-alignment-center u-gap-2 reveal-body">
            <a
              href="https://www.instagram.com/namanprat_"
              target="_blank"
              rel="noopener noreferrer"
              className="u-text-style-h2 u-text-style-font-primary"
            >
              Instagram
            </a>
            <p className="u-text-style-h2 u-text-style-font-primary">/</p>
            <a
              href="https://www.are.na/naman-pratulya/channels"
              target="_blank"
              rel="noopener noreferrer"
              className="u-text-style-h2 u-text-style-font-primary"
            >
              are.na
            </a>
            <p className="u-text-style-h2 u-text-style-font-primary">/</p>
            <a
              href="https://www.linkedin.com/in/namanprat/"
              target="_blank"
              rel="noopener noreferrer"
              className="u-text-style-h2 u-text-style-font-primary"
            >
              LinkedIn
            </a>
          </div>
          <a
            href="https://cal.com/namanprat/discovery-call"
            target="_blank"
            rel="noopener noreferrer"
            className="u-text-style-h2 u-text-style-font-primary reveal-body"
          >
            schedule a discovery call
          </a>
        </div>
      </section>
    </main>
  );
}
