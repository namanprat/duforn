import React from "react";
import { navigateTo } from "../lib/navigationBridge";

export default function HomePage() {
  return (
    <main id="main" data-page-container="true" data-page-namespace="home">
      <section className="hero u-color-light u-background-transparent u-min-height-screen">
        <div className="hero-stage__contain u-container-main u-height-full u-width-full u-max-width-full u-padding-top-3 u-padding-bottom-10">
          <div className="hero-stage__center">
            <div className="hero-stage__brand-stack">
              <div className="home-hero-brand-clip">
                <h1
                  className="home-hero-brand u-text-style-display"
                  data-brand-handoff-title="home"
                >
                  duforn
                </h1>
              </div>
              <div className="hero-bottom-contain u-flex-vertical-nowrap u-align-items-stretch u-gap-4">
                <p className="hero-stage__eyebrow">
                  AN ART DIRECTION AND UX DESIGN EXPERT IS COMMITTED TO CRAFTING EXCEPTIONAL DIGITAL
                  PRODUCTS THAT FOSTER GROWTH AND ENGAGEMENT THROUGH METICULOUS DESIGN AND STRATEGIC
                  INNOVATION.
                </p>
                <button
                  type="button"
                  className="button-secondary hero-stage__cta"
                  onClick={() => {
                    navigateTo("/work");
                  }}
                >
                  VIEW WORK
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
