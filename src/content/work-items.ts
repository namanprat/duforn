export interface WorkItem {
  id: string;
  slug: string;
  title: string;
  image: string;
  href: string;
}

export const workItems: WorkItem[] = [
  { id: "money-me", slug: "money-me", title: "money.me", image: "/work/15.webp", href: "/money-me" },
  { id: "haptic", slug: "haptic", title: "Haptic", image: "/work/14.webp", href: "/money-me" },
  { id: "flashcloud", slug: "flashcloud", title: "Flashcloud", image: "/work/13.webp", href: "/money-me" },
  {
    id: "project-qaafi",
    slug: "project-qaafi",
    title: "Project Qaafi",
    image: "/work/1.webp",
    href: "/money-me",
  },
  { id: "t-bonk", slug: "t-bonk", title: "t.Bonk", image: "/work/12.webp", href: "/money-me" },
  {
    id: "perception-pod",
    slug: "perception-pod",
    title: "Perception Pod",
    image: "/work/11.webp",
    href: "/money-me",
  },
];
