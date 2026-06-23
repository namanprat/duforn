export const STUDIO_INTRO_COPY =
  "Based out of mumbai and bangalore. Working with culture, curating digital experiences.";

export const HERO_EYEBROW = "2026";
export const HERO_TITLE_LEAD = "Naman Pratulya";
export const HERO_TITLE_SERIF = "CREATIVE PORTFOLIO";

export const CONTACT_INTRO_COPY =
  "Available for freelance projects, art direction, and digital design inquiries.";

export const CONTACT_EMAIL = "naman@duforn.com";

export interface ContactLink {
  label: string;
  href: string;
}

export const CONTACT_LINKS: ContactLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/namanprat_" },
  { label: "Discovery Call", href: "https://cal.com/namanprat/discovery-call" },
];

/* --- About panel content (verbatim from Figma node 566-2767) -------------- */

export const ABOUT_INTRO_PARAGRAPHS: string[] = [
  "I'm a digital designer with a simple goal: make things look good and work even better. I spend most of my time designing websites, obsessing over details, and figuring out how to turn ideas into experiences that feel clear, intuitive, and visually compelling. I enjoy the process as much as the outcome—understanding what's important, stripping away what's not, and creating work that feels effortless. For me, good design isn't about adding more; it's about knowing what to leave out.",
];

export const ABOUT_META = {
  est: " ",
  based: " ",
} as const;

export const ABOUT_CLIENTS: string[] = [
  "Animal",
  "November",
  "Notice",
  "Egodeath",
  "Project Qaafi",
  "Haptic AI",
  "Perception Pod",
  "t.Bonk",
];

export const ABOUT_AWARDS: string[] = [
  "Awwwards SOTD (x5)",
  "FWA SOTD (x5)",
  "CSSDA SOTD (x5)",
  "Awwwards Honorable Mention (x8)",
  "Awwwards Typography Honors (x1)",
  "Awwwards Independent of The Year Nominee (x1)",
];

export interface AboutPrinciple {
  title: string;
  body: string;
}

export const ABOUT_PRINCIPLES: AboutPrinciple[] = [
  {
    title: "Outcomes first, taste second",
    body: "Every creative decision we make is interrogated against one question: does this actually serve your growth?",
  },
  {
    title: "All in or nothing",
    body: "We take on fewer projects so we can give each one everything. When we commit to your brand, we're fully present, fully invested, fully responsible for the result.",
  },
  {
    title: "Human-first, always",
    body: "Behind every brand is a person with a real story and real stakes. We never lose sight of that. The most powerful digital experiences are the ones that feel unmistakably human.",
  },
  {
    title: "Intention over speed",
    body: "Rushed work compounds into regret. We move at the pace the work demands. Every layer earns its place before we move to the next.",
  },
];
