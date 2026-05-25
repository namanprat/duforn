// @ts-nocheck
export const projectDetailContent = {
  projectHero: {
    titleLines: [{ main: "money.me", align: "left" }],
    overview:
      "money.me helps with financial awareness. With a simple and easy to use interface, it empowers its users to take control of their finances by tracking expenses.",
    services: ["UI/UX Strategy", "Research Synthesis", "Interface Design", "Prototype Systems"],
    facts: [
      { label: "Date", value: "2024" },
      { label: "Client", value: "money.me" },
      { label: "Location", value: "Mumbai, India" },
    ],
    cta: {
      label: "Browse Screens",
    },
  },
  heroImage: {
    src: "/money-me/money-cover.webp",
    alt: "money.me cover image",
    label: "Cover image",
    caption: "The case-study cover from the original money.me project page.",
    layout: "hero",
  },
  sections: [
    {
      heading: "Why this, why now",
      body: [
        "Financial management is one of the most quietly consequential life skills a person picks up — or doesn't. Knowing how to hold the line between what comes in and what goes out shapes the texture of an entire decade, not a single month.",
        "But the further into independence you get, the harder that ledger is to hold in your head. Income arrives in fragments. Expenses leak through a dozen apps, cards, and casual taps. Without a way to see it cleanly, small unsound decisions stack into a posture: irresponsible by accident, not by intention.",
        "money.me started from that observation. Not as a budgeting app — there are enough of those — but as a way to give people back the visibility they had stopped expecting from their phones.",
      ],
    },
    {
      heading: "Listening before designing",
      body: [
        "Before drawing a single screen, I wanted to understand how people actually live with their money — not how a fintech deck imagines they do. I built a questionnaire and ran it across a small but varied group of users: students just managing their first stipend, working professionals juggling two or three cards, and friends who treated splitting a dinner bill like a small group project.",
        "The conversations probed the things you only learn by asking: how they keep track of expenses (or pretend to), how often they impulse buy and whether they regret it, how many cards live in their wallet, whether they've ever installed a money-management app and what made them open it less and less, and how a group actually splits a bill when the waiter brings the check. The aim was less to validate a feature and more to find the friction worth designing around.",
      ],
    },
    {
      heading: "What people actually said",
      body: [
        "People wanted to save — time as much as money — and they wanted financial apps to make life easier, not noisier. Several said outright that every app they had tried felt the same, and that managing their finances mattered to them but they couldn't seem to be regular about it.",
        "Underneath the surface, they were asking for control. They wanted automated, efficient ways to handle the awkward bits — splitting a bill, paying back a friend, capturing a transaction without thinking about it. They wished their app actually knew them: when a transaction happened, where, and what it meant. The advice they gave themselves out loud sounded like a parent's voice in their head — save up, you'll need it for the trip; note your expenses on a spreadsheet; you're young, you can take a risk. The app was rarely part of that internal monologue.",
        "What they did was telling. Most fell back on bank statements at the end of the month, or kept a half-hearted log they updated for a week and abandoned. A few impulse-bought without flinching. Plenty had tried multiple money-management apps and kept none. The apps they had tried suffered from the same set of problems: there was no good way to ask the app how much they had spent on a specific category like food this month, the main act of entering income and expenses was unclear enough to discourage doing it, alerts arrived too late or not at all, categorisation was crude, and — quietly the most damning — no one wanted to install another app just to remember to open it.",
      ],
    },
    {
      heading: "The moneymaker",
      body: [
        "The brief that came out of the research was unusually simple: the app should require less of the user, not more. Logging an expense should be a thing that has already happened by the time you look at the screen.",
        "The first move was to lean on something the user already gets for free — the transaction SMS their bank sends every time their card moves. money.me reads those messages on-device, parses them into categorised entries, and quietly populates the ledger. No manual entry, no forgotten lunches, no abandoned spreadsheets.",
        "On top of that runs a layer of small AI nudges. Instead of a single end-of-month notification screaming that you overspent, the app surfaces patterns as they form — a category creeping up, a recurring charge you forgot about, a place to trim without changing how you actually live. The tone is closer to a friend pointing something out than a bank threatening you.",
        "The savings that come out of those nudges don't sit abstract. They slide into a Piggy Bank the user sets up — a soft container with a name and a goal, where the money cut from one place reappears as progress somewhere else. The point is to make the act of saving feel like watching something grow, not denying yourself something today.",
      ],
    },
  ],
  interstitialImage: {
    src: "/money-me/Showcase-1.webp",
    alt: "money.me showcase screen",
    caption: "A mid-case-study showcase image used in the original project page.",
  },
  closingSection: null,
  outro: "money.me",
};
