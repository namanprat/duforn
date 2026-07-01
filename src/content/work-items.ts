export interface WorkItem {
  id: string;
  title: string;
  image: string;
  href: string;
}

export const workItems: WorkItem[] = [
  { id: "money-me", title: "money.me", image: "/media/work/money-me.webp", href: "/money-me" },
  { id: "haptic", title: "Haptic", image: "/media/work/haptic.webp", href: "/haptic" },
  { id: "notice", title: "Notice", image: "/media/work/13.webp", href: "https://wearenotice.com" },
  { id: "project-qaafi", title: "Project Qaafi", image: "/media/work/1.webp", href: "#" },
  { id: "t-bonk", title: "t.Bonk", image: "/media/work/12.webp", href: "https://wearenotice.co" },
  {
    id: "perception-pod",
    title: "Perception Pod",
    image: "/media/work/perception-pod.webp",
    href: "https://perceptionpod.com",
  },
];
