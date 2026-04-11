export type RouteNamespace =
  | "home"
  | "work"
  | "contact"
  | "archive"
  | "projectDetail"
  | "notFound"
  | "test";

export type RoutePathname =
  | "/"
  | "/work"
  | "/contact"
  | "/archive"
  | "/money-me"
  | "/404"
  | "/test";

export interface RouteTransitionState {
  inFlight: boolean;
  targetPath: string | null;
}
