/**
 * Navigation bridge. React Router's `navigate` lives inside the component tree,
 * but DOM links / 3D objects need to trigger navigation from anywhere. The
 * router registers its handler here on mount; `navigateTo` proxies to it.
 */
type NavigateHandler = (path: string) => void | Promise<void>;

let navigateHandler: NavigateHandler | null = null;

export function setNavigateHandler(handler: NavigateHandler | null): void {
  navigateHandler = typeof handler === "function" ? handler : null;
}

export function navigateTo(path: string): void {
  if (navigateHandler) {
    void Promise.resolve(navigateHandler(path));
    return;
  }
  window.location.href = path;
}
