export const STUDIO_INTRO_COPY =
  "We are an art direction and web studio in Mumbai. Working with culture, curating digital experiences. Making work that moves people.";

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

export const ABOUT_HEADING = "About the studio";

export const ABOUT_INTRO_PARAGRAPHS: string[] = [
  "Hey I'm Huy. I started MONOLOG because I watched exceptional founders stay invisible because their presence never caught up to who they'd become despite the scale of their ambition.",
  "That gap became an obsession. I've spent years breaking down what separates forgettable digital presence from work that actually moves people, thinking that's reached over 60,000 creatives and shapes every project we take on.",
  "When we work with founders, we are immersed in your story, ruthless about what moves people, and built to close the gap between who you are and how the world sees you.",
];

export const ABOUT_META = {
  est: "EST 2022",
  based: "BASED IN MELBOURNE and HANOI",
} as const;

export const ABOUT_CLIENTS: string[] = [
  "Vinamilk",
  "Moc Chau Creamery",
  "OH Architecture",
  "Supersolid Agency",
  "Mammoth Murals",
  "SLIK Agency",
  "BlueBrown Partners",
  "Backhouse",
  "University of Sydney",
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
