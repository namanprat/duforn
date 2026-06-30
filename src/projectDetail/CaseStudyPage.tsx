import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getCaseStudy } from "../content/projects";
import type { InlineMediaBlock, StorySection } from "../content/projects/types";
import TextRevealLines from "../text/Reveal";
import { ProjectCoverAnchor, ProjectStripsAnchor } from "./ProjectCanvasAnchor";

function StorySectionBlock({ heading, body }: StorySection) {
  return (
    <article className="u-display-grid u-gap-2">
      <TextRevealLines>
        <h2 className="u-text-style-h4 u-margin-0">{heading}</h2>
      </TextRevealLines>
      <div className="u-display-grid u-gap-4">
        {body.map((paragraph) => (
          <TextRevealLines key={paragraph}>
            <p>{paragraph}</p>
          </TextRevealLines>
        ))}
      </div>
    </article>
  );
}

function ProjectInlineMedia({ block }: { block: InlineMediaBlock }) {
  if (block.type === "video") {
    return (
      <section className="project-details-inline-media project-details-inline-media--video u-margin-top-0">
        <div className="u-container-main">
          <video src={block.src} autoPlay muted loop playsInline />
        </div>
      </section>
    );
  }

  return (
    <section className="project-details-inline-media u-margin-top-0">
      <div className="u-container-main">
        <img src={block.src} alt={block.alt ?? ""} loading="lazy" decoding="async" />
      </div>
    </section>
  );
}

function StorySectionGroup({ sections }: { sections: readonly StorySection[] }) {
  return (
    <section className="u-margin-top-0">
      <div className="u-container-main">
        <div className="project-details-content project-details-story-stack">
          {sections.map((section) => (
            <StorySectionBlock key={section.heading} heading={section.heading} body={section.body} />
          ))}
        </div>
      </div>
    </section>
  );
}

function InterleavedStory({
  sections,
  inlineMedia,
}: {
  sections: readonly StorySection[];
  inlineMedia: readonly InlineMediaBlock[];
}) {
  const mediaByIndex = useMemo(() => {
    const map = new Map<number, InlineMediaBlock[]>();
    for (const block of inlineMedia) {
      const list = map.get(block.afterSectionIndex) ?? [];
      list.push(block);
      map.set(block.afterSectionIndex, list);
    }
    return map;
  }, [inlineMedia]);

  return (
    <>
      {sections.map((section, index) => (
        <div key={section.heading}>
          <section className="u-margin-top-0">
            <div className="u-container-main">
              <div className="project-details-content project-details-story-stack">
                <StorySectionBlock heading={section.heading} body={section.body} />
              </div>
            </div>
          </section>
          {mediaByIndex.get(index)?.map((block) => (
            <ProjectInlineMedia key={`${block.afterSectionIndex}-${block.src}`} block={block} />
          ))}
        </div>
      ))}
    </>
  );
}

export default function CaseStudyPage() {
  const { pathname } = useLocation();
  const caseStudy = getCaseStudy(pathname);

  if (!caseStudy) return null;

  const { title, overview, services, storySections, coverSrc, stripPaths, inlineMedia } =
    caseStudy;
  const hasStrips = Boolean(stripPaths?.length);
  const hasInlineMedia = Boolean(inlineMedia?.length);

  const introSections = hasStrips ? storySections.slice(0, 2) : [];
  const restSections = hasStrips ? storySections.slice(2) : [];

  return (
    <main className="project-details-page" data-page-namespace="projectDetail">
      <section className="u-margin-top-0">
        <div className="u-container-main">
          <div className="u-section-spacer-medium" />
          <TextRevealLines animateOnScroll={false}>
            <h1 className="u-container-full u-text-align-center u-text-style-display work-page__title">
              {title}
            </h1>
          </TextRevealLines>

          <div className="project-details-hero-info u-grid-autofit u-align-items-start">
            <article className="project-details-overview u-column-span-9">
              <TextRevealLines animateOnScroll={false}>
                <h5>Project Overview</h5>
              </TextRevealLines>
              <TextRevealLines animateOnScroll={false} delay={0.05}>
                <h2 className="project-details-overview-copy">{overview}</h2>
              </TextRevealLines>
            </article>

            <div className="project-details-services u-column-span-3">
              <TextRevealLines animateOnScroll={false}>
                <h5>Services</h5>
              </TextRevealLines>
              <div className="u-display-grid">
                {services.map((service) => (
                  <TextRevealLines key={service} animateOnScroll={false} delay={0.02}>
                    <h4>{service}</h4>
                  </TextRevealLines>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="project-details-cover">
        <div className="project-details-cover-frame">
          <ProjectCoverAnchor src={coverSrc} />
        </div>
      </section>

      {hasStrips ? (
        <>
          <StorySectionGroup sections={introSections} />
          <section className="project-details-supporting-image u-margin-top-0">
            <div className="u-container-main">
              <div className="project-details-supporting-image-frame">
                <ProjectStripsAnchor />
              </div>
            </div>
          </section>
          <StorySectionGroup sections={restSections} />
        </>
      ) : null}

      {hasInlineMedia && inlineMedia ? (
        <InterleavedStory sections={storySections} inlineMedia={inlineMedia} />
      ) : null}

      <section className="project-details-outro">
        <div className="u-container-main">
          <div className="project-details-content">
            <TextRevealLines>
              <p>{title}</p>
            </TextRevealLines>
          </div>
        </div>
      </section>
    </main>
  );
}
