export const TITLES: Record<string, string> = {
  "/": "Duforn | Home",
  "/work": "Duforn | Work",
  "/contact": "Duforn | Contact",
  "/archive": "Duforn | Archive",
  "/money-me": "Duforn | money.me Project Details",
  "/404": "Duforn | 404",
  "/test": "Duforn | Test",
};

export const PATH_TO_NAMESPACE: Record<string, string> = {
  "/": "home",
  "/work": "work",
  "/contact": "contact",
  "/archive": "archive",
  "/money-me": "projectDetail",
  "/404": "notFound",
  "/test": "test",
};

export const REVEAL_START_DELAY_MS = 400;
export const REVEAL_SHORT_DELAY_MS = 80;

export function normalizePath(pathname: string): string {
  const cleaned = pathname.replace(/\/+$/, "");
  return cleaned === "" ? "/" : cleaned;
}

export function getNamespace(pathname: string): string {
  return PATH_TO_NAMESPACE[normalizePath(pathname)] || "notFound";
}

export function waitForRevealDelay(ms = REVEAL_START_DELAY_MS): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function applyBodyRouteClasses(namespace: string): void {
  document.body.classList.add("page-wrap");
  document.body.classList.toggle("page-wrap--scrollable", namespace === "projectDetail");
}
