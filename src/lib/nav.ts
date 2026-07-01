/**
 * Navigation bridge. React Router's `navigate` lives inside the component tree,
 * but DOM links / 3D objects need to trigger navigation from anywhere. The
 * router registers its handler here on mount; `navigateTo` proxies to it.
 */
type NavigateHandler = (path: string) => void | Promise<void>;

let navigateHandler: NavigateHandler | null = null;

const EXTERNAL_HREF_RE = /^https?:\/\//i;

export function isExternalHref(href: string): boolean {
  return EXTERNAL_HREF_RE.test(href);
}

export function isNavigableHref(href: string | undefined | null): href is string {
  return Boolean(href) && href !== "#";
}

export function setNavigateHandler(handler: NavigateHandler | null): void {
  navigateHandler = typeof handler === "function" ? handler : null;
}

export function navigateTo(path: string): void {
  if (!isNavigableHref(path)) return;

  if (isExternalHref(path)) {
    window.open(path, "_blank", "noopener,noreferrer");
    return;
  }

  if (navigateHandler) {
    void Promise.resolve(navigateHandler(path));
    return;
  }

  window.location.href = path;
}
