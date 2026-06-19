export interface WorkItem {
  id: string;
  title: string;
  image: string;
  href: string;
}

const MONEY_ME_HREF = "/money-me";

export const workItems: WorkItem[] = [
  { id: "money-me", title: "money.me", image: "/work/15.webp", href: MONEY_ME_HREF },
  { id: "haptic", title: "Haptic", image: "/work/14.webp", href: MONEY_ME_HREF },
  { id: "flashcloud", title: "Flashcloud", image: "/work/13.webp", href: MONEY_ME_HREF },
  {
    id: "project-qaafi",
    title: "Project Qaafi",
    image: "/work/1.webp",
    href: MONEY_ME_HREF,
  },
  { id: "t-bonk", title: "t.Bonk", image: "/work/12.webp", href: MONEY_ME_HREF },
  {
    id: "perception-pod",
    title: "Perception Pod",
    image: "/work/11.webp",
    href: MONEY_ME_HREF,
  },
];
