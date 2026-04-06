import React from "react";

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
      <h1 className="reveal-title u-width-full u-text-align-center u-text-style-display">
        {title}
      </h1>
    </>
  );
}

function ProjectDetailsHero({ hero }) {
  if (!hero) return null;

  const { titleLines, overview, services, facts, cta } = hero;

  return (
    <section className="project-details-hero">
      <div className="project-details-shell u-container-main u-flex-vertical-nowrap">
        <ProjectDetailsHeroHeadline lines={titleLines} />

        <div className="project-details-hero-info u-flex-horizontal-nowrap u-justify-content-between u-gap-gutter">
          <article className="project-details-overview project-details-content">
            <p className="project-details-kicker reveal-body">Project Overview</p>
            <p className="project-details-overview-copy reveal-body">{overview}</p>
          </article>

          <div className="project-details-services project-details-content">
            <p className="project-details-kicker reveal-body">Services</p>
            <div className="project-details-info-copy">
              {services?.map((service) => (
                <p key={service} className="project-details-info-line reveal-body">
                  {service}
                </p>
              ))}
            </div>
            {cta ? (
              <a
                className="project-details-cta reveal-body"
                href={cta.href}
                target={cta.target}
                rel={cta.rel}
              >
                {cta.label}
              </a>
            ) : null}
          </div>

          <div className="project-details-facts project-details-content u-flex-vertical-nowrap u-gap-4">
            {facts?.map((item) => (
              <article key={item.label} className="project-details-fact">
                <p className="project-details-kicker reveal-body">{item.label}</p>
                <div className="project-details-info-copy">
                  {Array.isArray(item.value) ? (
                    item.value.map((entry) => (
                      <p key={entry} className="project-details-info-line reveal-body">
                        {entry}
                      </p>
                    ))
                  ) : (
                    <p className="project-details-info-line reveal-body">{item.value}</p>
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

function ProjectDetailsMedia({ item, eager = false }) {
  return (
    <article
      className={`project-details-media-card project-details-media-card--${item.layout || "landscape"}`}
    >
      <div className="project-details-media-frame" data-film-plane-trigger="true">
        <ProjectDetailsImage item={item} eager={eager} />
      </div>
    </article>
  );
}

function ProjectDetailsCover({ item }) {
  return (
    <section className="project-details-cover">
      <div className="project-details-shell u-container-main">
        <div className="project-details-cover-frame" data-film-plane-trigger="true">
          <ProjectDetailsImage item={item} eager />
        </div>
      </div>
    </section>
  );
}

function ProjectDetailsStorySection({ section }) {
  return (
    <section className="project-details-story-row project-details-content">
      <div className="project-details-story-heading">
        <h2 className="u-text-style-h4" data-scroll-reveal>
          {section.heading}
        </h2>
      </div>
      <div className="project-details-story-copy">
        {section.intro ? <p data-scroll-reveal>{section.intro}</p> : null}
        {section.body?.map((paragraph) => (
          <p key={paragraph} data-scroll-reveal>
            {paragraph}
          </p>
        ))}
        {section.questions?.length ? (
          <ol className="project-details-question-list">
            {section.questions.map((question) => (
              <li key={question} data-scroll-reveal>
                {question}
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}

function ProjectDetailsFindingsSection({ section }) {
  return (
    <section className="project-details-story-row project-details-content">
      <div className="project-details-story-heading">
        <h2 className="u-text-style-h4" data-scroll-reveal>
          {section.heading}
        </h2>
      </div>
      <div className="project-details-story-copy">
        <div className="project-details-findings-grid">
          {section.items.map((item, index) => (
            <article key={item} className="project-details-finding-card">
              <p data-scroll-reveal>
                {index + 1}. {item}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
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

function ProjectDetailsScreenGallery({ intro, images }) {
  if (!images?.length) return null;

  return (
    <section className="project-details-screens" id="project-gallery">
      <div className="project-details-shell u-container-main">
        {intro ? (
          <p className="project-details-gallery-intro project-details-content" data-scroll-reveal>
            {intro}
          </p>
        ) : null}
        <div className="project-details-screen-grid">
          {images.map((image) => (
            <ProjectDetailsMedia key={image.alt} item={image} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ProjectDetailsPageShell({
  projectHero,
  heroImage,
  sections,
  interstitialImage,
  findingsSection,
  figureImage,
  closingSection,
  galleryIntro = "Selected frames",
  galleryImages,
  outro,
}) {
  return (
    <main
      id="main"
      className="project-details-page"
      data-page-container="true"
      data-page-namespace="projectDetail"
    >
      <ProjectDetailsHero hero={projectHero} />

      {heroImage ? <ProjectDetailsCover item={heroImage} /> : null}

      {sections?.length ? (
        <section className="project-details-story">
          <div className="project-details-shell project-details-story-shell u-container-main">
            {sections.map((section) => (
              <ProjectDetailsStorySection key={section.heading} section={section} />
            ))}
          </div>
        </section>
      ) : null}

      {interstitialImage ? (
        <div className="project-details-shell u-container-main">
          <ProjectDetailsSupportingImage
            item={interstitialImage}
            className="project-details-supporting-image--wide"
          />
        </div>
      ) : null}

      {findingsSection ? (
        <section className="project-details-story">
          <div className="project-details-shell project-details-story-shell u-container-main">
            <ProjectDetailsFindingsSection section={findingsSection} />
          </div>
        </section>
      ) : null}

      {figureImage ? (
        <div className="project-details-shell u-container-main">
          <ProjectDetailsSupportingImage item={figureImage} />
        </div>
      ) : null}

      {closingSection ? (
        <section className="project-details-story">
          <div className="project-details-shell project-details-story-shell u-container-main">
            <ProjectDetailsStorySection section={closingSection} />
          </div>
        </section>
      ) : null}

      <ProjectDetailsScreenGallery intro={galleryIntro} images={galleryImages} />

      {outro ? (
        <section className="project-details-outro">
          <div className="project-details-shell u-container-main">
            <div className="project-details-outro-grid project-details-content">
              <p className="project-details-outro-note" data-scroll-reveal>
                {outro}
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
