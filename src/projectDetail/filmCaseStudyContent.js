export const projectDetailsCaseStudyContent = {
  projectHero: {
    titleLines: [{ main: "film", align: "left" }],
    overview:
      "A film-led study framed around motion, restraint, and a stronger editorial rhythm for the core campaign imagery.",
    services: ["Art Direction", "Motion Direction", "Editorial Layout", "WebGPU TSL"],
    facts: [
      { label: "Date", value: "Q4 2025" },
      { label: "Client", value: "Internal Study" },
      { label: "Location", value: "Mumbai, India" },
    ],
    cta: {
      label: "View Frames",
      href: "#project-gallery",
    },
  },
  heroImage: {
    src: "/money-me/Showcase-1.webp",
    alt: "money.me showcase",
    label: "Cover frame",
    caption: "A large first surface to reintroduce the original image-led pace of the page.",
    layout: "hero",
  },
  galleryImages: [
    {
      alt: "Project showcase image 1",
      webpSrcSet: ["/project/project_1.webp 3840w"],
      jpgSrc: "/project/project_1.jpg",
      jpgSrcSet: [
        "/project/project_1-1200.jpg 1200w",
        "/project/project_1-1800.jpg 1800w",
        "/project/project_1-2160.jpg 2160w",
      ],
      sizes: "(max-width: 991px) 92vw, 72vw",
      label: "Frame 01",
      caption: "Primary interface frame held closer to the motion and typography system.",
      layout: "portrait",
    },
    {
      alt: "Project showcase image 2",
      webpSrcSet: ["/project/project_4.webp 3840w"],
      jpgSrc: "/project/project_4.jpg",
      jpgSrcSet: [
        "/project/project_4-1200.jpg 1200w",
        "/project/project_4-1800.jpg 1800w",
        "/project/project_4-2160.jpg 2160w",
      ],
      sizes: "(max-width: 991px) 92vw, 72vw",
      label: "Frame 02",
      caption: "A secondary composition used to slow the sequence after the cover image.",
      layout: "landscape",
    },
  ],
};
