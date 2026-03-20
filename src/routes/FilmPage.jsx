import React from "react";

export default function FilmPage() {
  return (
    <main id="main" data-page-container="true" data-page-namespace="film">
      <div className="u-section-spacer-large" />
      <h1 className="slide-title reveal-title u-width-full u-text-align-center u-text-style-display u-pointer-events-none">
        money.me
      </h1>

      <section className="project-hero">
        <div className="u-section-spacer-medium" />
        <div className="u-container-main u-flex-horizontal-wrap u-gap-5 u-align-items-start u-column-width-10">
          <p className="reveal-body u-width-full">
            Silent Offset was developed as part of an internal research cycle focused on formal
            restraint and perceptual balance.
          </p>
          <div className="u-flex-horizontal-nowrap u-width-full u-justify-content-between">
            <div className="project-info-sub-col">
              <p>Study Period</p>
              <p>Q4 2025</p>
            </div>
            <div className="project-info-sub-col">
              <p>Scope</p>
              <p>Art Direction</p>
            </div>
          </div>
        </div>
        <div className="u-section-spacer-medium" />
      </section>

      <div className="coverimg u-overflow-hidden">
        <img
          src="/money-me/Showcase-1.webp"
          alt="money.me showcase"
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      <section className="u-container-main u-flex-vertical-nowrap u-gap-5 u-align-items-center">
        <div className="project-img">
          <picture>
            <source
              type="image/webp"
              srcSet={["/project/project_1.webp 3840w"].join(", ")}
              sizes="(max-width: 991px) 92vw, 72vw"
            />
            <img
              src="/project/project_1.jpg"
              srcSet={[
                "/project/project_1-1200.jpg 1200w",
                "/project/project_1-1800.jpg 1800w",
                "/project/project_1-2160.jpg 2160w",
              ].join(", ")}
              sizes="(max-width: 991px) 92vw, 72vw"
              alt="Project showcase image 1"
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </picture>
        </div>
        <div className="project-img">
          <picture>
            <source
              type="image/webp"
              srcSet={["/project/project_4.webp 3840w"].join(", ")}
              sizes="(max-width: 991px) 92vw, 72vw"
            />
            <img
              src="/project/project_4.jpg"
              srcSet={[
                "/project/project_4-1200.jpg 1200w",
                "/project/project_4-1800.jpg 1800w",
                "/project/project_4-2160.jpg 2160w",
              ].join(", ")}
              sizes="(max-width: 991px) 92vw, 72vw"
              alt="Project showcase image 2"
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </picture>
        </div>
      </section>
    </main>
  );
}
