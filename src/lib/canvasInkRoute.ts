/** Ink bleed is slowed 40% vs original base timings (duration × 1.4). */
export const INK_TIMING_SCALE = 1.4 as const;

const BASE_ROUTE = {
  expandMs: 700,
  holdMs: 220,
  collapseMs: 750,
} as const;

const BASE_MENU = {
  expandMs: 600,
  collapseMs: 600,
} as const;

export const CANVAS_INK_ROUTE_TIMING = {
  expandMs: Math.round(BASE_ROUTE.expandMs * INK_TIMING_SCALE),
  holdMs: Math.round(BASE_ROUTE.holdMs * INK_TIMING_SCALE),
  collapseMs: Math.round(BASE_ROUTE.collapseMs * INK_TIMING_SCALE),
} as const;

export const CANVAS_INK_MENU_TIMING = {
  expandMs: Math.round(BASE_MENU.expandMs * INK_TIMING_SCALE),
  collapseMs: Math.round(BASE_MENU.collapseMs * INK_TIMING_SCALE),
} as const;

const PATH_TO_NAMESPACE: Record<string, string> = {
  "/": "home",
  "/work": "work",
  "/contact": "contact",
  "/archive": "archive",
  "/money-me": "projectDetail",
  "/404": "notFound",
  "/test": "test",
};

/** Namespaces where route navigation may use the full-screen ink bleed (archive + 404). */
const ROUTE_INK_BLEED_NAMESPACES = new Set(["archive", "notFound"]);

export function normalizePath(path: string | null | undefined): string {
  if (!path) return "/";
  const trimmed = path.replace(/\/+$/, "");
  if (!trimmed) return "/";
  return trimmed.toLowerCase();
}

export function getRouteInkNamespace(path: string | null | undefined): string {
  return PATH_TO_NAMESPACE[normalizePath(path)] ?? "notFound";
}

/**
 * Route ink (NavigationBridge) only for archive and 404-ish views.
 * Preloader, menu, and project flows use their own call sites.
 */
export function shouldUseRouteInkBleed(fromPath: string, toPath: string): boolean {
  const a = getRouteInkNamespace(fromPath);
  const b = getRouteInkNamespace(toPath);
  return ROUTE_INK_BLEED_NAMESPACES.has(a) || ROUTE_INK_BLEED_NAMESPACES.has(b);
}
