import TextRevealLines from "../text/Reveal";
import RotateHoverLabel from "../components/RotateHoverLabel";
import { shouldUseNavRotateHover } from "../lib/link-hover";
import MoneyMeStripCanvas from "./MoneyMeStripCanvas";

interface ImageItem {
  src?: string;
  alt: string;
  objectFit?: "contain" | "cover";
  webpSrcSet?: string[];
  jpgSrc?: string;
  jpgSrcSet?: string[];
  sizes?: string;
  kind?: string;
}

interface StorySection {
  heading: string;
  body: string[];
}

interface ProjectHero {
  titleLines: Array<{ main: string; align?: string; accent?: string }>;
  overview: string;
  services: string[];
  cta: { label: string } | null;
}

function ProjectDetailsImage({ item, eager = false }: { item: ImageItem; eager?: boolean }) {
  const fit = item.objectFit === "contain" ? "u-object-fit-contain" : "u-object-fit-cover";
  const imgProps: React.ImgHTMLAttributes<HTMLImageElement> = {
    alt: item.alt,
    decoding: "async",
    className: `u-display-block u-width-full u-height-full ${fit}`,
  };

  if (!eager) imgProps.loading = "lazy";

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

function ProjectDetailsHeroHeadline({
  lines = [],
}: {
  lines: ProjectHero["titleLines"];
}) {
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

function ProjectDetailsHero({ hero }: { hero: ProjectHero }) {
  const { titleLines, overview, services, cta } = hero;
  const useRotateHover = shouldUseNavRotateHover();

  return (
    <section className="u-margin-top-0">
      <div className="u-container-main">
        <ProjectDetailsHeroHeadline lines={titleLines} />

        <div className="project-details-hero-info u-grid-autofit u-align-items-start">
          <article className="project-details-overview u-column-span-9">
            <TextRevealLines>
              <p className="project-details-kicker u-text-style-small u-text-style-font-secondary">
                Project Overview
              </p>
            </TextRevealLines>
            <TextRevealLines delay={0.05}>
              <h2 className="project-details-overview-copy">{overview}</h2>
            </TextRevealLines>
          </article>

          <div className="project-details-services u-column-span-3">
            <TextRevealLines>
              <p className="project-details-kicker u-text-style-small u-text-style-font-secondary">
                Services
              </p>
            </TextRevealLines>
            <div className="u-display-grid">
              {services.map((service) => (
                <TextRevealLines key={service} delay={0.02}>
                  <h4>{service}</h4>
                </TextRevealLines>
              ))}
            </div>
            {cta ? (
              <button
                type="button"
                className="button button-primary button-primary--black u-margin-top-4"
                data-rotate-hover={useRotateHover ? "" : undefined}
              >
                {useRotateHover ? <RotateHoverLabel text={cta.label} /> : cta.label}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectDetailsCover({ item }: { item: ImageItem }) {
  return (
    <section className="project-details-cover">
      <div className="project-details-cover-frame">
        <ProjectDetailsImage item={item} eager />
      </div>
    </section>
  );
}

function ProjectDetailsStorySection({ section }: { section: StorySection }) {
  return (
    <article className="u-display-grid u-gap-2">
      <TextRevealLines>
        <h2 className="u-text-style-h4 u-margin-0">{section.heading}</h2>
      </TextRevealLines>
      <div className="u-display-grid u-gap-4">
        {section.body.map((paragraph) => (
          <TextRevealLines key={paragraph}>
            <p>{paragraph}</p>
          </TextRevealLines>
        ))}
      </div>
    </article>
  );
}

function ProjectDetailsStorySectionGroup({ sections }: { sections: StorySection[] }) {
  if (!sections.length) return null;

  return (
    <section className="u-margin-top-0">
      <div className="u-container-main">
        <div className="project-details-content project-details-story-stack">
          {sections.map((section) => (
            <ProjectDetailsStorySection key={section.heading} section={section} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectDetailsSupportingImage({
  item,
  wide = false,
}: {
  item: ImageItem;
  wide?: boolean;
}) {
  const cls = wide ? "project-details-supporting-image u-margin-top-0" : "project-details-supporting-image";
  return (
    <section className={cls}>
      <div className="u-container-main">
        <div className="project-details-supporting-image-frame">
          {item.kind === "money-me-strips" ? <MoneyMeStripCanvas /> : <ProjectDetailsImage item={item} />}
        </div>
      </div>
    </section>
  );
}

interface ProjectDetailsPageShellProps {
  projectHero: ProjectHero;
  heroImage: ImageItem;
  sections: StorySection[];
  interstitialImage: ImageItem;
  closingSection: StorySection | null;
  outro: string;
}

export default function ProjectDetailsPageShell({
  projectHero,
  heroImage,
  sections,
  interstitialImage,
  closingSection,
  outro,
}: ProjectDetailsPageShellProps) {
  const introSections = sections.slice(0, 2);
  const restSections = sections.slice(2);

  return (
    <main
      className="project-details-page"
      data-page-container="true"
      data-page-namespace="projectDetail"
    >
      <ProjectDetailsHero hero={projectHero} />
      {heroImage ? <ProjectDetailsCover item={heroImage} /> : null}
      <ProjectDetailsStorySectionGroup sections={introSections} />
      {interstitialImage ? <ProjectDetailsSupportingImage item={interstitialImage} wide /> : null}
      <ProjectDetailsStorySectionGroup sections={restSections} />
      {closingSection ? <ProjectDetailsStorySectionGroup sections={[closingSection]} /> : null}
      {outro ? (
        <section className="project-details-outro">
          <div className="u-container-main">
            <div className="project-details-content">
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
