import React from "react";
import WorkSceneControls from "../components/debug/WorkSceneControls.jsx";
import { navigateTo } from "../lib/navigationBridge.js";

export default function WorkPage() {
  const handleTitleActivate = (event) => {
    const href = event.currentTarget.dataset.href;
    if (!href) return;
    navigateTo(href);
  };

  const handleTitleKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleTitleActivate(event);
  };

  return (
    <main id="main" data-page-container="true" data-page-namespace="work">
      <div className="u-section-spacer-large" />
      <h1
        className="reveal-title slide-title work-slide-title u-width-full u-text-align-center u-text-style-display"
        role="link"
        tabIndex={0}
        data-href=""
        onClick={handleTitleActivate}
        onKeyDown={handleTitleKeyDown}
      >
        Selected Work
      </h1>
      {import.meta.env.DEV ? <WorkSceneControls /> : null}
    </main>
  );
}
