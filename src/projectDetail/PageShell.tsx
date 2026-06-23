import TextRevealLines from "../text/Reveal";
import { ProjectCoverAnchor } from "./ProjectCanvasAnchor";
import MoneyMeStripCanvas from "./MoneyMeStripCanvas";

const HERO_TITLE = "money.me";
const HERO_OVERVIEW =
  "money.me helps with financial awareness. With a simple and easy to use interface, it empowers its users to take control of their finances by tracking expenses.";
const SERVICES = ["UI/UX Strategy", "Research Synthesis", "Interface Design", "Prototype Systems"];
const STORY_SECTIONS = [
  {
    heading: "Why this, why now",
    body: [
      "Financial management is one of the most quietly consequential life skills a person picks up, or doesn't. Knowing how to hold the line between what comes in and what goes out shapes the texture of an entire decade, not a single month.",
      "But the further into independence you get, the harder that ledger is to hold in your head. Income arrives in fragments. Expenses leak through a dozen apps, cards, and casual taps. Without a way to see it cleanly, small decisions stack into a pattern: irresponsible by accident, not by intention.",
      "money.me started from that observation. Not as another budgeting app but as a way to give people back the visibility they had stopped expecting from their phones. We worked with the money.me team to turn that idea into something real.",
    ],
  },
  {
    heading: "Listening before designing",
    body: [
      "Before drawing a single screen, we wanted to understand how people actually live with their money. We built a questionnaire and ran it across a small but varied group of users: students just managing their first stipend, working professionals juggling two or three cards, and friends who treated splitting a dinner bill like a small group project.",
      "The conversations probed the things you only learn by asking: how they keep track of expenses (or pretend to), how often they impulse buy and whether they regret it, how many cards live in their wallet, whether they had ever installed a money app and what made them open it less and less, and how a group actually splits a bill when the waiter brings the check. The aim was less to confirm a feature list and more to find the friction worth designing around.",
    ],
  },
  {
    heading: "What people actually said",
    body: [
      "People wanted to save, time as much as money, and they wanted financial apps to make life easier, not noisier. Several said outright that every app they had tried felt the same, and that managing their finances mattered to them but they couldn't seem to be regular about it.",
      "Underneath the surface, they were asking for control. They wanted simple, efficient ways to handle the awkward bits: splitting a bill, paying back a friend, capturing a transaction without thinking about it. They wished their app actually knew them, when a transaction happened, where, and what it meant.",
      "What they did was telling. Most fell back on bank statements at the end of the month, or kept a half-hearted log they updated for a week and abandoned. Plenty had tried multiple money apps and kept none. The same problems came up every time: no way to ask the app how much they had spent on food this month, entering income and expenses was unclear enough to put people off, alerts arrived too late or not at all, and no one wanted to install another app just to remember to open it.",
    ],
  },
  {
    heading: "The moneymaker",
    body: [
      "The goal that came out of the research was unusually simple: the app should ask less of the user, not more. Logging an expense should be something that has already happened by the time you look at the screen.",
      "The first move was to lean on something the user already gets for free: the transaction SMS their bank sends every time their card moves. money.me reads those messages on-device, parses them into categorised entries, and quietly fills the ledger. No manual entry, no forgotten lunches, no abandoned spreadsheets.",
      "On top of that runs a layer of small smart nudges. Instead of a single end-of-month notification telling you that you overspent, the app surfaces patterns as they form: a category creeping up, a recurring charge you forgot about, a place to trim without changing how you actually live. The tone is closer to a friend pointing something out than a bank warning you.",
      "The savings that come out of those nudges don't sit abstract. They slide into a Piggy Bank the user sets up, a container with a name and a goal, where the money saved in one place reappears as progress somewhere else. The point is to make saving feel like watching something grow, not giving something up.",
    ],
  },
] as const;

function StorySection({ heading, body }: { heading: string; body: readonly string[] }) {
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

function StorySectionGroup({ sections }: { sections: readonly (typeof STORY_SECTIONS)[number][] }) {
  return (
    <section className="u-margin-top-0">
      <div className="u-container-main">
        <div className="project-details-content project-details-story-stack">
          {sections.map((section) => (
            <StorySection key={section.heading} heading={section.heading} body={section.body} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ProjectDetailPage() {
  const introSections = STORY_SECTIONS.slice(0, 2);
  const restSections = STORY_SECTIONS.slice(2);

  return (
    <main
      className="project-details-page"
      data-page-container="true"
      data-page-namespace="projectDetail"
    >
      <section className="u-margin-top-0">
        <div className="u-container-main">
          <div className="u-section-spacer-large" />
          <TextRevealLines animateOnScroll={false}>
            <h1 className="u-width-full u-text-align-center u-text-style-display">{HERO_TITLE}</h1>
          </TextRevealLines>

          <div className="project-details-hero-info u-grid-autofit u-align-items-start">
            <article className="project-details-overview u-column-span-9">
              <TextRevealLines animateOnScroll={false}>
                <h5>Project Overview</h5>
              </TextRevealLines>
              <TextRevealLines animateOnScroll={false} delay={0.05}>
                <h2 className="project-details-overview-copy">{HERO_OVERVIEW}</h2>
              </TextRevealLines>
            </article>

            <div className="project-details-services u-column-span-3">
              <TextRevealLines animateOnScroll={false}>
                <h5>Services</h5>
              </TextRevealLines>
              <div className="u-display-grid">
                {SERVICES.map((service) => (
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
          <ProjectCoverAnchor src="/media/money-me/money-cover.webp" />
        </div>
      </section>

      <StorySectionGroup sections={introSections} />

      <section className="project-details-supporting-image u-margin-top-0">
        <div className="u-container-main">
          <div className="project-details-supporting-image-frame">
            <MoneyMeStripCanvas />
          </div>
        </div>
      </section>

      <StorySectionGroup sections={restSections} />

      <section className="project-details-outro">
        <div className="u-container-main">
          <div className="project-details-content">
            <TextRevealLines>
              <p>{HERO_TITLE}</p>
            </TextRevealLines>
          </div>
        </div>
      </section>
    </main>
  );
}
