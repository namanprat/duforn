import type { AppNamespace } from "../store/webgl";

const PATH_TO_NAMESPACE: Record<string, AppNamespace> = {
  "/": "main",
  "/work": "work",
  "/contact": "contact",
  "/archive": "archive",
  "/money-me": "projectDetail",
};

export function getRouteNamespace(pathname: string): AppNamespace {
  return PATH_TO_NAMESPACE[pathname] ?? "main";
}
