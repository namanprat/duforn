// @ts-nocheck
import React from "react";
import TextRevealLines from "../text/Reveal";
import AboutIntroReveal from "./about/AboutIntroReveal";
import DesignPillars from "./about/DesignPillars";
import BehindTheLock from "./about/BehindTheLock";

/**
 * About page — studio layout from deadlock-studios, DOM over unified #background canvas.
 * 3D: AboutScene (spiral hero + smoke closing).
 */

export const INTRO_PARAGRAPHS = [
  "Duforn is a design-led studio that operates at the edge of comfort. We make experiences for people who want to be unsettled, challenged, and held in place by worlds that feel more real than they should.",
  "We work at the intersection of systems design and psychological tension. Every project ships only when you feel watched from the first frame and never fully shake it after the last.",
];

/** Accordion + arc cards — pillar copy from deadlock-studios Design Pillars. */
export const PILLARS = [
  {
    id: "01",
    title: "Tension Over Reward",
    image: "/accordion/accordion-1.jpg",
    description:
      "We don't design progression loops that hand people a treat for completing tasks. We design systems where the absence of resolution is the point. You are always reaching for ground that shifts beneath you. Comfort is the enemy of memorable design.",
  },
  {
    id: "02",
    title: "Atmosphere First",
    image: "/accordion/accordion-2.jpg",
    description:
      "Every project begins with a feeling, not a feature list. We define the emotional signature of a world before we write a single line of code. If we cannot describe how it makes you feel in one sentence, it is not ready to be built.",
  },
  {
    id: "03",
    title: "Invisible Systems",
    image: "/accordion/accordion-3.jpg",
    description:
      "The best mechanics are the ones you never notice consciously. We build rulesets that shape behavior from underneath, adjusting pacing and cues based on how you move and hesitate. The work watches you as much as you watch it.",
  },
  {
    id: "04",
    title: "Restraint as Language",
    image: "/accordion/accordion-4.jpg",
    description:
      "We say more by showing less. Empty space carries more weight than crowded space. A single flickering light communicates more than an army of detail. Every element earns its place through subtraction, and what remains is only what absolutely needs to exist.",
  },
];

export default function AboutPage() {
  return (
    <main
      id="main"
      className="about-page"
      data-page-container="true"
      data-page-namespace="about"
      aria-label="About"
    >
      <section className="about-page__hero" data-about-section="hero">
        <div className="about-page__hero-header u-container-main">
          <TextRevealLines delay={0.65}>
            <h1 className="u-text-align-center u-text-style-display u-color-light u-margin-0">
              We exist in the space where control breaks down and something else takes over
            </h1>
          </TextRevealLines>
        </div>
      </section>

      <AboutIntroReveal paragraphs={INTRO_PARAGRAPHS} />

      <DesignPillars items={PILLARS} />

      <BehindTheLock pillars={PILLARS} />

      <section className="about-page__closing" data-about-section="closing" aria-label="Closing">
        <div className="about-page__closing-content u-container-main">
          <TextRevealLines>
            <p className="u-text-align-center u-text-style-small u-text-style-font-secondary u-color-light u-margin-0">
              Establish Contact
            </p>
          </TextRevealLines>
          <TextRevealLines delay={0.05}>
            <h2 className="u-text-align-center u-text-style-display u-color-light u-margin-0 about-page__closing-heading">
              Let's make something they can't walk away from
            </h2>
          </TextRevealLines>
        </div>

        <div className="about-page__closing-bar u-container-main">
          <p className="u-text-style-small u-text-style-font-secondary u-color-light u-margin-0">
            &copy; {new Date().getFullYear()} Duforn
          </p>
          <p className="u-text-style-small u-text-style-font-secondary u-color-light u-margin-0">
            Design-led studio
          </p>
        </div>
      </section>
    </main>
  );
}
