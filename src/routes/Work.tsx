import React, { useEffect, useMemo, useState } from "react";
import { workItems } from "../../data/work-items";
import { navigateTo } from "../lib/nav";
import WorkSceneControls from "../debug/WorkScene";

// Dev-only debug GUI for the live work strip controls.
const SHOW_WORK_SCENE_CONTROLS = import.meta.env.DEV;

export default function WorkPage() {
  const initialTitle = workItems[0]?.title ?? "Work";
  const [title, setTitle] = useState<string>(initialTitle);

  useEffect(() => {
    const onTitle = (event: Event) => {
      const detail = (event as CustomEvent<{ title?: string }>).detail;
      if (detail?.title) {
        setTitle(detail.title);
      }
    };
    window.addEventListener("duforn:work-strip-title", onTitle as EventListener);
    return () => window.removeEventListener("duforn:work-strip-title", onTitle as EventListener);
  }, []);

  const { firstLine, secondLine } = useMemo(() => {
    const words = String(title).trim().split(/\s+/).filter(Boolean);
    const hasMultipleWords = words.length > 1;
    return {
      firstLine: hasMultipleWords ? words[0] : title,
      secondLine: hasMultipleWords ? words.slice(1).join(" ") : null,
    };
  }, [title]);

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
    <>
      <main id="main" data-page-container="true" data-page-namespace="work">
        <div className="u-section-spacer-large" />
        <h1
          className="u-container-full u-text-align-center u-text-style-h1 work-page__title u-color-light"
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
      </main>
      {SHOW_WORK_SCENE_CONTROLS ? <WorkSceneControls /> : null}
    </>
  );
}
