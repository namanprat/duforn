let navigateHandler = null;

export function setNavigateHandler(handler) {
  navigateHandler = typeof handler === 'function' ? handler : null;
}

export function navigateTo(path) {
  if (navigateHandler) {
    navigateHandler(path);
    return;
  }
  window.location.href = path;
}
