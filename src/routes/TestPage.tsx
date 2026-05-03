import React from "react";
import { navigateTo } from "../lib/navigationBridge";

export default function TestPage() {
  return (
    <main id="main" data-page-container="true" data-page-namespace="test">
      <section className="hero u-background-transparent u-min-height-screen">
        <div className="u-container-main u-height-full u-width-full u-max-width-full u-padding-top-3 u-padding-bottom-10 u-flex-vertical-nowrap u-justify-content-center u-align-items-center">
          <div className="hero-bottom-contain u-flex-vertical-nowrap u-align-items-center u-text-align-center u-gap-4 u-width-full">
            <div className="home-hero-brand-clip u-width-full">
              <h1
                className="u-text-style-display u-text-transform-uppercase u-color-light"
                data-brand-handoff-title="test"
                data-split-type="chars"
              >
                duforn
              </h1>
            </div>
            <p className="u-text-wrap-balance u-width-full u-color-light">
              Test scene for inspecting the model, camera framing, and light balance.
            </p>
            <button
              type="button"
              className="u-theme-light u-radius-round u-display-inline-flex u-align-items-center u-gap-2 u-padding-inline-5 u-padding-block-3 u-text-transform-uppercase u-text-style-font-secondary u-pointer-cursor u-border-none"
              onClick={() => navigateTo("/work")}
            >
              View work
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
