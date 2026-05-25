// @ts-nocheck
import React from "react";
import TextRevealLines from "../components/textReveal/TextRevealLines";
import RotateHoverLabel from "../components/RotateHoverLabel";
import { shouldUseNavRotateHover } from "../../scripts/link-hover";

function ProjectDetailsImage({ item, eager = false }) {
  const imgProps = {
    alt: item.alt,
    decoding: "async",
    className: `project-details-media-image project-details-media-image--${item.objectFit || "cover"}`,
    "data-film-plane-target": "true",
  };

  if (!eager) {
    imgProps.loading = "lazy";
  }

  if (item.webpSrcSet?.length) {
    return (
      <picture>
        <source type="image/webp" srcSet={item.webpSrcSet.join(", ")} sizes={item.sizes} />
        <img
          {...imgProps}
          src={item.jpgSrc}
          srcSet={item.jpgSrcSet?.join(", ")}
          sizes={item.sizes}
        />
      </picture>
    );
  }

  return <img {...imgProps} src={item.src} />;
}

function ProjectDetailsHeroHeadline({ lines = [] }) {
  const title = lines
    .map((line) => [line.accent, line.main].filter(Boolean).join(" "))
    .filter(Boolean)
    .join(" ");

  if (!title) return null;

  return (
    <>
      <div className="u-section-spacer-large" />
      <TextRevealLines>
        <h1 className="u-width-full u-text-align-center u-text-style-display">{title}</h1>
      </TextRevealLines>
    </>
  );
}

function ProjectDetailsHero({ hero }) {
  if (!hero) return null;

  const { titleLines, overview, services, facts, cta } = hero;
  const useRotateCtaHover = shouldUseNavRotateHover();

  return (
    <section className="project-details-hero">
      <div className="u-container-main u-flex-vertical-nowrap">
        <ProjectDetailsHeroHeadline lines={titleLines} />

        <div className="project-details-hero-info u-flex-horizontal-nowrap u-justify-content-between u-gap-gutter">
          <article className="project-details-overview project-details-content">
            <TextRevealLines>
              <p className="project-details-kicker u-text-style-small u-text-style-font-secondary">
                Project Overview
              </p>
            </TextRevealLines>
            <TextRevealLines delay={0.05}>
              <h2 className="project-details-overview-copy">{overview}</h2>
            </TextRevealLines>
          </article>

          <div className="project-details-services project-details-content">
            <TextRevealLines>
              <p className="project-details-kicker u-text-style-small u-text-style-font-secondary">
                Services
              </p>
            </TextRevealLines>
            <div className="project-details-info-copy u-display-grid u-gap-2">
              {services?.map((service) => (
                <TextRevealLines key={service} delay={0.02}>
                  <h4 className="project-details-info-line">{service}</h4>
                </TextRevealLines>
              ))}
            </div>
            {cta ? (
              <button
                type="button"
                className="button button-primary button-primary--black project-details-cta"
                data-rotate-hover={useRotateCtaHover ? "" : undefined}
              >
                {useRotateCtaHover ? <RotateHoverLabel text={cta.label} /> : cta.label}
              </button>
            ) : null}
          </div>

          <div className="project-details-facts project-details-content u-flex-vertical-nowrap u-gap-4">
            {facts?.map((item) => (
              <article key={item.label} className="project-details-fact">
                <TextRevealLines>
                  <p className="project-details-kicker u-text-style-small u-text-style-font-secondary">
                    {item.label}
                  </p>
                </TextRevealLines>
                <div className="project-details-info-copy u-display-grid u-gap-4">
                  {Array.isArray(item.value) ? (
                    item.value.map((entry) => (
                      <TextRevealLines key={entry} delay={0.02}>
                        <h4 className="project-details-info-line">{entry}</h4>
                      </TextRevealLines>
                    ))
                  ) : (
                    <TextRevealLines>
                      <h4 className="project-details-info-line">{item.value}</h4>
                    </TextRevealLines>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectDetailsCover({ item }) {
  return (
    <section className="project-details-cover">
      <div className="u-container-main">
        <div className="project-details-cover-frame" data-film-plane-trigger="true">
          <ProjectDetailsImage item={item} eager />
        </div>
      </div>
    </section>
  );
}

function ProjectDetailsStorySection({ section }) {
  return (
    <article className="project-details-story-section">
      <TextRevealLines>
        <h2 className="project-details-story-heading u-text-style-h4">{section.heading}</h2>
      </TextRevealLines>
      <div className="project-details-story-copy">
        {section.body?.map((paragraph) => (
          <TextRevealLines key={paragraph}>
            <p className="project-details-story-paragraph">{paragraph}</p>
          </TextRevealLines>
        ))}
      </div>
    </article>
  );
}

function ProjectDetailsSupportingImage({ item, className = "" }) {
  return (
    <section className={`project-details-supporting-image ${className}`.trim()}>
      <div className="project-details-supporting-image-frame" data-film-plane-trigger="true">
        <ProjectDetailsImage item={item} />
      </div>
    </section>
  );
}

export default function ProjectDetailsPageShell({
  projectHero,
  heroImage,
  sections,
  interstitialImage,
  closingSection,
  outro,
}) {
  const introSections = sections?.slice(0, 2) ?? [];
  const restSections = sections?.slice(2) ?? [];

  return (
    <main
      id="main"
      className="project-details-page"
      data-page-container="true"
      data-page-namespace="projectDetail"
    >
      <ProjectDetailsHero hero={projectHero} />

      {heroImage ? <ProjectDetailsCover item={heroImage} /> : null}

      {introSections.length ? (
        <section className="project-details-story u-margin-top-0">
          <div className="u-container-main project-details-story-stack u-column-width-10">
            {introSections.map((section) => (
              <ProjectDetailsStorySection key={section.heading} section={section} />
            ))}
          </div>
        </section>
      ) : null}

      {interstitialImage ? (
        <div className="u-container-main">
          <ProjectDetailsSupportingImage
            item={interstitialImage}
            className="project-details-supporting-image--wide"
          />
        </div>
      ) : null}

      {restSections.length ? (
        <section className="project-details-story u-margin-top-0">
          <div className="u-container-main project-details-story-stack u-column-width-10">
            {restSections.map((section) => (
              <ProjectDetailsStorySection key={section.heading} section={section} />
            ))}
          </div>
        </section>
      ) : null}

      {closingSection ? (
        <section className="project-details-story u-margin-top-0">
          <div className="u-container-main project-details-story-stack u-column-width-10">
            <ProjectDetailsStorySection section={closingSection} />
          </div>
        </section>
      ) : null}

      {outro ? (
        <section className="project-details-outro">
          <div className="u-container-main">
            <div className="project-details-outro-grid project-details-content">
              <TextRevealLines>
                <p className="project-details-outro-note">{outro}</p>
              </TextRevealLines>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
