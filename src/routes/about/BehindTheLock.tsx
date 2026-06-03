// @ts-nocheck
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextRevealLines from "../../text/Reveal";
import { waitForPreloader } from "../../text/useRevealGate";

gsap.registerPlugin(ScrollTrigger);

export default function BehindTheLock({ pillars = [] }) {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let disposePreloader = null;
    let cancelled = false;
    let trigger = null;

    const setup = () => {
      if (cancelled) return;

      const cards = cardsRef.current.filter(Boolean);
      if (!cards.length) return;

      const stickyHeight = window.innerHeight * 7;
      const totalCards = cards.length;

      const arcAngle = Math.PI * 0.4;
      const startAngle = Math.PI / 2 - arcAngle / 2;

      function getRadius() {
        return window.innerWidth < 900 ? window.innerWidth * 7.5 : window.innerWidth * 2.5;
      }

      function positionCards(progress = 0) {
        const radius = getRadius();
        const cardSpacing = 0.15;
        const initialOffset = -cardSpacing * (totalCards - 1);
        const totalTravel = 1 - initialOffset;
        const arcProgress = initialOffset + progress * totalTravel;

        cards.forEach((card, i) => {
          if (!card) return;
          const cardOffset = (totalCards - 1 - i) * cardSpacing;
          const cardProgress = cardOffset + arcProgress;
          const angle = startAngle + arcAngle * cardProgress;

          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const rotation = (angle - Math.PI / 2) * (180 / Math.PI);

          gsap.set(card, {
            x,
            y: -y + radius,
            rotation: -rotation,
            transformOrigin: "center center",
          });
        });
      }

      positionCards(0);

      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${stickyHeight}px`,
        pin: true,
        pinSpacing: true,
        scrub: true,
        invalidateOnRefresh: true,
        refreshPriority: -1,
        onUpdate: (self) => {
          positionCards(self.progress);
        },
      });

      const handleResize = () => {
        positionCards(0);
      };
      window.addEventListener("resize", handleResize);
      ScrollTrigger.refresh();

      return () => {
        trigger?.kill();
        window.removeEventListener("resize", handleResize);
      };
    };

    let teardownSetup = null;
    disposePreloader = waitForPreloader(() => {
      teardownSetup = setup();
    });

    return () => {
      cancelled = true;
      disposePreloader?.();
      teardownSetup?.();
    };
  }, [pillars.length]);

  return (
    <section className="about-page__lock" ref={sectionRef}>
      <div className="about-page__lock-header u-display-grid u-gap-2 u-text-align-center">
        <TextRevealLines>
          <p className="u-text-style-small u-text-style-font-secondary u-color-light">
            The Collective
          </p>
        </TextRevealLines>
        <TextRevealLines delay={0.05}>
          <h2 className="u-text-style-h4 u-margin-0 u-color-light">Behind the Lock</h2>
        </TextRevealLines>
      </div>

      <div className="about-page__lock-footer u-container-main">
        <p className="u-text-style-small u-text-style-font-secondary u-color-light u-margin-0">
          Roster Verified
        </p>
        <p className="u-text-style-small u-text-style-font-secondary u-color-light u-margin-0">
          Defectors: None
        </p>
      </div>

      <div className="about-page__lock-cards">
        {pillars.map((pillar, i) => (
          <article
            key={pillar.id}
            className="about-page__lock-card"
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
          >
            <div className="about-page__lock-card-img">
              <img src={pillar.image} alt={pillar.title} loading="lazy" decoding="async" />
            </div>
            <div className="about-page__lock-card-body u-display-grid u-gap-2">
              <p className="u-text-style-small u-text-style-font-secondary u-color-light u-margin-0">
                {pillar.id}
              </p>
              <h3 className="u-text-style-h6 u-margin-0 u-color-light">{pillar.title}</h3>
              <p className="u-color-light u-margin-0 about-page__lock-card-desc">
                {pillar.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
