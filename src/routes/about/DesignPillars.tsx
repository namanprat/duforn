// @ts-nocheck
import React, { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import TextRevealLines from "../../text/Reveal";

gsap.registerPlugin(SplitText);

const ACCORDION_EXPANDED = 52;
const ACCORDION_COLLAPSED = 16;
const ACCORDION_DURATION = 0.6;
const ACCORDION_EASE = "power3.out";
const ACCORDION_WORD_STAGGER = 0.015;
const ACCORDION_DEFAULT_ACTIVE = 1;
const ACCORDION_MOBILE_BREAKPOINT = 1000;

export default function DesignPillars({ items = [] }) {
  const accordionRef = useRef(null);
  const panelsRef = useRef([]);
  const splitsRef = useRef([]);
  const activeRef = useRef(ACCORDION_DEFAULT_ACTIVE);
  const stackedRef = useRef(false);

  const applyLayout = useCallback((stacked) => {
    accordionRef.current?.classList.toggle("about-page__accordion--stacked", stacked);

    panelsRef.current.forEach((panel, i) => {
      if (!panel) return;

      if (stacked) {
        gsap.killTweensOf(panel);
        panel.style.flexGrow = "";
        panel.style.flexShrink = "";
        panel.style.flexBasis = "";

        const split = splitsRef.current[i];
        if (split?.words?.length) {
          gsap.set(split.words, { opacity: 1, y: 0 });
        }
        return;
      }

      const isActive = i === activeRef.current;
      panel.style.flexGrow = isActive ? ACCORDION_EXPANDED : ACCORDION_COLLAPSED;
      panel.style.flexShrink = "0";
      panel.style.flexBasis = "0";

      const split = splitsRef.current[i];
      if (split?.words?.length) {
        gsap.set(split.words, {
          opacity: isActive ? 1 : 0,
          y: isActive ? 0 : 6,
        });
      }
    });
  }, []);

  const setActive = useCallback((index) => {
    if (stackedRef.current) return;
    if (activeRef.current === index) return;
    const prevIndex = activeRef.current;
    activeRef.current = index;

    panelsRef.current.forEach((panel, i) => {
      if (!panel) return;
      const isActive = i === index;
      gsap.to(panel, {
        flexGrow: isActive ? ACCORDION_EXPANDED : ACCORDION_COLLAPSED,
        duration: ACCORDION_DURATION,
        ease: ACCORDION_EASE,
      });
    });

    const prevSplit = splitsRef.current[prevIndex];
    if (prevSplit?.words?.length) {
      gsap.to(prevSplit.words, {
        opacity: 0,
        y: 6,
        duration: 0.2,
        ease: "power2.in",
        overwrite: true,
      });
    }

    const activeSplit = splitsRef.current[index];
    if (activeSplit?.words?.length) {
      gsap.to(activeSplit.words, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        stagger: ACCORDION_WORD_STAGGER,
        ease: "power2.out",
        delay: 0.2,
        overwrite: true,
      });
    }
  }, []);

  useEffect(() => {
    splitsRef.current = panelsRef.current.map((panel) => {
      if (!panel) return null;
      const desc = panel.querySelector(".about-page__accordion-panel-desc");
      if (!desc) return null;
      const split = SplitText.create(desc, { type: "words" });
      gsap.set(split.words, { opacity: 0, y: 6 });
      return split;
    });

    panelsRef.current.forEach((panel, i) => {
      if (!panel) return;
      const isActive = i === ACCORDION_DEFAULT_ACTIVE;
      panel.style.flexGrow = isActive ? ACCORDION_EXPANDED : ACCORDION_COLLAPSED;
      panel.style.flexShrink = "0";
      panel.style.flexBasis = "0";
    });

    const handleResize = (initial = false) => {
      const stacked = window.innerWidth < ACCORDION_MOBILE_BREAKPOINT;
      if (!initial && stacked === stackedRef.current) return;
      stackedRef.current = stacked;
      applyLayout(stacked);
    };

    handleResize(true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      splitsRef.current.forEach((split) => split?.revert());
    };
  }, [applyLayout, items.length]);

  return (
    <section className="about-page__accordion" ref={accordionRef}>
      <div className="about-page__accordion-header u-text-align-center">
        <TextRevealLines>
          <p className="u-text-style-small u-text-style-font-secondary u-color-light u-margin-0">
            Design Pillars
          </p>
        </TextRevealLines>
        <TextRevealLines delay={0.05}>
          <h2 className="u-text-style-h6 u-margin-0 u-color-light">
            Four principles that guide every build
          </h2>
        </TextRevealLines>
      </div>

      <div className="about-page__accordion-panels">
        <div className="u-container-main about-page__accordion-row">
          {items.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => {
                panelsRef.current[index] = el;
              }}
              className="about-page__accordion-panel"
              onMouseEnter={() => setActive(index)}
            >
              <img
                className="about-page__accordion-panel-img"
                src={item.image}
                alt={item.title}
                loading="lazy"
                decoding="async"
              />
              <div className="about-page__accordion-panel-overlay" aria-hidden="true" />
              <div className="about-page__accordion-panel-content">
                <span className="about-page__accordion-panel-number u-text-style-font-secondary">
                  {item.id}
                </span>
                <p className="about-page__accordion-panel-title u-color-light u-margin-0">
                  {item.title}
                </p>
              </div>
              <div className="about-page__accordion-panel-desc-wrap">
                <p className="about-page__accordion-panel-desc u-color-light u-margin-0">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
