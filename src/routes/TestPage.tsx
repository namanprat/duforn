import React from "react";
import { navigateTo } from "../lib/navigationBridge";
import TextRevealLines from "../components/textReveal/TextRevealLines";
import RotateHoverLabel from "../components/RotateHoverLabel";
import { shouldUseNavRotateHover } from "../../scripts/link-hover";
import TestSceneControls from "../components/debug/TestSceneControls";

const TEST_CTA_LABEL = "View work";

export default function TestPage() {
  const useRotateButtonHover = shouldUseNavRotateHover();

  return (
    <>
      <TestSceneControls />
      <main id="main" data-page-container="true" data-page-namespace="test">
        <section className="hero u-background-transparent u-min-height-screen">
          <div className="u-container-main u-height-full u-width-full u-max-width-full u-padding-top-3 u-padding-bottom-10 u-flex-vertical-nowrap u-justify-content-center u-align-items-center">
            <div className="hero-bottom-contain u-flex-vertical-nowrap u-align-items-center u-text-align-center u-gap-4 u-width-full">
              <div className="home-hero-brand-clip u-width-full">
                <TextRevealLines>
                  <h1
                    className="u-text-style-display u-text-transform-uppercase u-color-light"
                    data-brand-handoff-title="test"
                  >
                    duforn
                  </h1>
                </TextRevealLines>
              </div>
              <TextRevealLines delay={0.06}>
                <p className="u-text-wrap-balance u-width-full u-color-light">
                  Test scene for inspecting model placement, orbit framing, and light balance.
                </p>
              </TextRevealLines>
              <button
                type="button"
                className="button button-secondary u-theme-light u-radius-round u-display-inline-flex u-align-items-center u-gap-2 u-padding-inline-5 u-padding-block-3 u-text-transform-uppercase u-text-style-font-secondary u-pointer-cursor u-border-none"
                data-rotate-hover={useRotateButtonHover ? "" : undefined}
                onClick={() => navigateTo("/work")}
              >
                {useRotateButtonHover ? <RotateHoverLabel text={TEST_CTA_LABEL} /> : TEST_CTA_LABEL}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
