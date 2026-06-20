const PATH_TO_NAMESPACE: Record<string, string> = {
  "/": "main",
  "/work": "work",
  "/contact": "contact",
  "/money-me": "projectDetail",
  "/404": "notFound",
};

export function normalizePath(path: string | null | undefined): string {
  if (!path) return "/";
  const trimmed = path.replace(/\/+$/, "");
  if (!trimmed) return "/";
  return trimmed.toLowerCase();
}

export function getRouteNamespace(path: string | null | undefined): string {
  return PATH_TO_NAMESPACE[normalizePath(path)] ?? "notFound";
}
