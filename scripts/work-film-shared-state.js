function normalizeRect(rect) {
  if (!rect) return null;
  const x = Number.isFinite(rect.x) ? rect.x : rect.left;
  const y = Number.isFinite(rect.y) ? rect.y : rect.top;
  const width = Number.isFinite(rect.width) ? rect.width : 0;
  const height = Number.isFinite(rect.height) ? rect.height : 0;
  if (!Number.isFinite(x) || !Number.isFinite(y) || width <= 0 || height <= 0) {
    return null;
  }
  return { x, y, width, height };
}

const state = {
  pendingWorkFilm: null,
  filmTextureOverrides: new Map(),
};

function normalizeTextureKey(src) {
  if (!src) return '';
  try {
    const parsed = new URL(src, window.location.origin);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return src;
  }
}

export function setWorkFilmPending(payload) {
  if (!payload) {
    state.pendingWorkFilm = null;
    return;
  }

  state.pendingWorkFilm = {
    item: payload.item || null,
    imageSrc: payload.imageSrc || '',
    texture: payload.texture || null,
    slotIndex: Number.isFinite(payload.slotIndex) ? payload.slotIndex : 0,
    selectedIndex: Number.isFinite(payload.selectedIndex) ? payload.selectedIndex : -1,
    sourceRect: normalizeRect(payload.sourceRect),
  };
}

export function getWorkFilmPending() {
  return state.pendingWorkFilm;
}

export function clearWorkFilmPending() {
  state.pendingWorkFilm = null;
}

export function primeFilmTextureOverride(src, texture) {
  if (!src || !texture) return;
  state.filmTextureOverrides.set(normalizeTextureKey(src), texture);
}

export function consumeFilmTextureOverride(src) {
  if (!src) return null;
  const key = normalizeTextureKey(src);
  const texture = state.filmTextureOverrides.get(key) || null;
  if (texture) {
    state.filmTextureOverrides.delete(key);
  }
  return texture;
}

export function clearFilmTextureOverrides() {
  state.filmTextureOverrides.clear();
}
