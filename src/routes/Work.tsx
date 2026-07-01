import { useEffect, useMemo, useRef, useState } from "react";
import { workItems } from "../content/work-items";
import { navigateTo, isNavigableHref } from "../lib/nav";
import TextRevealLines from "../text/Reveal";
import { getActiveStripItemIndex } from "../work/math";
import { DEFAULT_GAP_SIZE, getStripVisibleItems, NUM_UNIQUE_FALLBACK } from "../work/config";

function workTitleAtScrollZero() {
  const idx = getActiveStripItemIndex(
    0,
    getStripVisibleItems(),
    DEFAULT_GAP_SIZE,
    NUM_UNIQUE_FALLBACK,
  );
  return workItems[idx]?.title ?? "Work";
}

export default function WorkPage() {
  const [title, setTitle] = useState(workTitleAtScrollZero);
  // First mount reveals (camera-gated); later title swaps remount via key={title} into the
  // no-animate branch. Effect-based so StrictMode's double render doesn't kill the reveal.
  const revealedRef = useRef(false);

  useEffect(() => {
    revealedRef.current = true;
  }, []);

  useEffect(() => {
    const onTitle = (event: Event) => {
      const detail = (event as CustomEvent<{ title?: string }>).detail;
      if (detail?.title) setTitle(detail.title);
    };
    window.addEventListener("duforn:work-strip-title", onTitle as EventListener);
    return () => window.removeEventListener("duforn:work-strip-title", onTitle as EventListener);
  }, []);

  const activeItem = useMemo(() => workItems.find((item) => item.title === title), [title]);
  const activeHref = activeItem?.href ?? workItems[0]?.href ?? "/";
  const canNavigate = isNavigableHref(activeHref);

  const { firstLine, secondLine } = useMemo(() => {
    const words = String(title).trim().split(/\s+/).filter(Boolean);
    if (words.length <= 1) return { firstLine: title, secondLine: null as string | null };
    return { firstLine: words[0], secondLine: words.slice(1).join(" ") };
  }, [title]);

  const handleTitleActivate = () => {
    if (!canNavigate) return;
    navigateTo(activeHref);
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLHeadingElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleTitleActivate();
  };

  return (
    <main
      className="work_page u-min-height-screen u-color-light u-background-transparent"
      data-page-namespace="work"
    >
      <div className="u-section-spacer-medium" />
      <TextRevealLines
        key={title}
        animateOnScroll={false}
        animate={!revealedRef.current}
        waitForCamera
      >
        <h1
          className={`u-container-full u-text-align-center u-text-style-display work-page__title u-color-light${canNavigate ? "" : " work-page__title--static"}`}
          data-work-strip-title
          data-no-strip-drag
          role={canNavigate ? "link" : undefined}
          tabIndex={canNavigate ? 0 : undefined}
          onClick={canNavigate ? handleTitleActivate : undefined}
          onKeyDown={canNavigate ? handleTitleKeyDown : undefined}
          data-href={canNavigate ? activeHref : undefined}
        >
          <span className="work-page__title-line">{firstLine}</span>
          {secondLine ? " " : null}
          {secondLine ? <span className="work-page__title-line">{secondLine}</span> : null}
        </h1>
      </TextRevealLines>
    </main>
  );
}
