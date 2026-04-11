import React from "react";

export default function TestPage() {
  return (
    <main id="main" data-page-container="true" data-page-namespace="test">
      <section className="hero u-background-transparent u-min-height-screen">
        <div className="hero-contain u-container-main u-height-full u-flex-vertical-nowrap u-justify-content-between u-align-items-center">
          <div className="home-hero-brand-clip">
            <h1
              className="reveal-title home-hero-brand u-text-style-display"
              data-brand-handoff-title="test"
              data-split-type="chars"
            >
              duforn
            </h1>
          </div>
          <div className="hero-bottom-contain u-flex-vertical-nowrap u-gap-3 u-align-items-center u-text-align-center">
            <h2 className="reveal-body u-text-style-h2 u-width-full">
              duforn is a Digital Designer based in Mumbai, India and is currently open to new
              freelance opportunities.
            </h2>
            <p className="reveal-body u-mobile-hidden">
              duforn, an Art Direction and UX Design expert, is committed to crafting exceptional
              digital products that foster growth and engagement through meticulous design and
              strategic innovation.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
