import { useEffect, useMemo, useRef, useState } from "react";
import { workItems } from "../content/work-items";
import { navigateTo } from "../lib/nav";
import TextRevealLines from "../text/Reveal";

export default function WorkPage() {
  const initialTitle = workItems[0]?.title ?? "Work";
  const [title, setTitle] = useState<string>(initialTitle);
  const revealedRef = useRef(false);
  // ponytail: ref gates first reveal only; strip title changes remount via key without re-animating

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

  const activeHref = useMemo(
    () => workItems.find((item) => item.title === title)?.href || workItems[0]?.href || "/",
    [title],
  );

  const { firstLine, secondLine } = useMemo(() => {
    const words = String(title).trim().split(/\s+/).filter(Boolean);
    if (words.length <= 1) return { firstLine: title, secondLine: null as string | null };
    return { firstLine: words[0], secondLine: words.slice(1).join(" ") };
  }, [title]);

  const handleTitleActivate = () => {
    if (!activeHref) return;
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
          className="u-container-full u-text-align-center u-text-style-display work-page__title u-color-light"
          data-work-strip-title
          role="link"
          tabIndex={0}
          onClick={handleTitleActivate}
          onKeyDown={handleTitleKeyDown}
          data-href={activeHref}
        >
          <span className="work-page__title-line">{firstLine}</span>
          {secondLine ? " " : null}
          {secondLine ? <span className="work-page__title-line">{secondLine}</span> : null}
        </h1>
      </TextRevealLines>
    </main>
  );
}
