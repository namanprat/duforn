// @ts-nocheck
import React from "react";
import TextRevealLines from "../text/Reveal";
import RotateHoverLabel from "../ui/HoverLabel";
import { shouldUseNavRotateHover } from "../../scripts/link-hover";

function ProjectDetailsImage({ item, eager = false }) {
  const fit = item.objectFit === "contain" ? "u-object-fit-contain" : "u-object-fit-cover";
  const imgProps = {
    alt: item.alt,
    decoding: "async",
    className: `u-display-block u-width-full u-height-full ${fit}`,
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
    <section className="u-margin-top-0">
      <div className="u-container-main u-flex-vertical-nowrap">
        <ProjectDetailsHeroHeadline lines={titleLines} />

        <div className="project-details-hero-info u-column-width-10 u-margin-x-auto u-flex-horizontal-nowrap u-justify-content-center u-gap-gutter u-align-items-start">
          <article className="project-details-overview">
            <TextRevealLines>
              <p className="project-details-kicker u-text-style-small u-text-style-font-secondary">
                Project Overview
              </p>
            </TextRevealLines>
            <TextRevealLines delay={0.05}>
              <h2 className="project-details-overview-copy">{overview}</h2>
            </TextRevealLines>
          </article>

          <div className="project-details-services">
            <TextRevealLines>
              <p className="project-details-kicker u-text-style-small u-text-style-font-secondary">
                Services
              </p>
            </TextRevealLines>
            <div className="u-display-grid u-gap-2">
              {services?.map((service) => (
                <TextRevealLines key={service} delay={0.02}>
                  <h4>{service}</h4>
                </TextRevealLines>
              ))}
            </div>
            {cta ? (
              <button
                type="button"
                className="button button-primary button-primary--black u-margin-top-4"
                data-rotate-hover={useRotateCtaHover ? "" : undefined}
              >
                {useRotateCtaHover ? <RotateHoverLabel text={cta.label} /> : cta.label}
              </button>
            ) : null}
          </div>

          <div className="project-details-facts u-flex-vertical-nowrap u-gap-4">
            {facts?.map((item) => (
              <article key={item.label}>
                <TextRevealLines>
                  <p className="project-details-kicker u-text-style-small u-text-style-font-secondary">
                    {item.label}
                  </p>
                </TextRevealLines>
                <div className="u-display-grid u-gap-4">
                  {Array.isArray(item.value) ? (
                    item.value.map((entry) => (
                      <TextRevealLines key={entry} delay={0.02}>
                        <h4>{entry}</h4>
                      </TextRevealLines>
                    ))
                  ) : (
                    <TextRevealLines>
                      <h4>{item.value}</h4>
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
        <div
          className="project-details-cover-frame u-column-width-10 u-margin-x-auto"
          data-film-plane-trigger="true"
        >
          <ProjectDetailsImage item={item} eager />
        </div>
      </div>
    </section>
  );
}

function ProjectDetailsStorySection({ section }) {
  return (
    <article className="u-display-grid u-gap-2">
      <TextRevealLines>
        <h2 className="u-text-style-h4 u-margin-0">{section.heading}</h2>
      </TextRevealLines>
      <div className="u-display-grid u-gap-4">
        {section.body?.map((paragraph) => (
          <TextRevealLines key={paragraph}>
            <p>{paragraph}</p>
          </TextRevealLines>
        ))}
      </div>
    </article>
  );
}

function ProjectDetailsSupportingImage({ item, wide = false }) {
  const cls = wide
    ? "project-details-supporting-image u-column-width-10 u-margin-x-auto u-margin-top-0"
    : "project-details-supporting-image u-column-width-10 u-margin-x-auto";
  return (
    <section className={cls}>
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
        <section className="u-margin-top-0">
          <div className="u-container-main project-details-story-stack u-column-width-10 u-margin-x-auto">
            {introSections.map((section) => (
              <ProjectDetailsStorySection key={section.heading} section={section} />
            ))}
          </div>
        </section>
      ) : null}

      {interstitialImage ? (
        <div className="u-container-main">
          <ProjectDetailsSupportingImage item={interstitialImage} wide />
        </div>
      ) : null}

      {restSections.length ? (
        <section className="u-margin-top-0">
          <div className="u-container-main project-details-story-stack u-column-width-10 u-margin-x-auto">
            {restSections.map((section) => (
              <ProjectDetailsStorySection key={section.heading} section={section} />
            ))}
          </div>
        </section>
      ) : null}

      {closingSection ? (
        <section className="u-margin-top-0">
          <div className="u-container-main project-details-story-stack u-column-width-10 u-margin-x-auto">
            <ProjectDetailsStorySection section={closingSection} />
          </div>
        </section>
      ) : null}

      {outro ? (
        <section className="project-details-outro">
          <div className="u-container-main">
            <div className="u-column-width-10 u-margin-x-auto u-align-items-start">
              <TextRevealLines>
                <p>{outro}</p>
              </TextRevealLines>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
