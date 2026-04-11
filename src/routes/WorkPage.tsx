import React from "react";
import { navigateTo } from "../lib/navigationBridge";

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
      <div className="u-section-spacer-medium" />
      <h1
        className="reveal-title slide-title work-slide-title u-container-full u-text-align-center u-text-style-display"
        role="link"
        tabIndex={0}
        data-href=""
        onClick={handleTitleActivate}
        onKeyDown={handleTitleKeyDown}
      >
        Selected Work
      </h1>
    </main>
  );
}
