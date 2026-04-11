// @ts-nocheck
let navigateHandler = null;
let navigationRequest = null;

export function setNavigateHandler(handler) {
  navigateHandler = typeof handler === "function" ? handler : null;
}

export function navigateTo(path) {
  if (navigateHandler) {
    if (navigationRequest?.path === path) {
      return navigationRequest.promise;
    }

    const promise = Promise.resolve(navigateHandler(path)).finally(() => {
      if (navigationRequest?.promise === promise) {
        navigationRequest = null;
      }
    });

    navigationRequest = { path, promise };
    return promise;
  }

  window.location.href = path;
  return Promise.resolve();
}
