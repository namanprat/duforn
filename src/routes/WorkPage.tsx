import React from "react";
import { workItems } from "../../data/work-items";
import { navigateTo } from "../lib/navigationBridge";
import TextRevealLines from "../components/textReveal/TextRevealLines";

export default function WorkPage() {
  const title = workItems[0]?.title ?? "Work";
  const words = String(title).trim().split(/\s+/).filter(Boolean);
  const hasMultipleWords = words.length > 1;
  const firstLine = hasMultipleWords ? words[0] : title;
  const secondLine = hasMultipleWords ? words.slice(1).join(" ") : null;

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
      <TextRevealLines>
        <h1
          className="u-container-full u-text-align-center u-text-style-display work-page__title"
          data-work-strip-title
          role="link"
          tabIndex={0}
          data-href=""
          onClick={handleTitleActivate}
          onKeyDown={handleTitleKeyDown}
        >
          <span className="work-page__title-line">{firstLine}</span>
          {secondLine ? <span className="work-page__title-line">{secondLine}</span> : null}
        </h1>
      </TextRevealLines>
    </main>
  );
}
