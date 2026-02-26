const STORAGE_KEY = 'work-film-transition-state-v1';
const MAX_AGE_MS = 10 * 60 * 1000;

function hasSessionStorage() {
  return typeof window !== 'undefined' && !!window.sessionStorage;
}

export function setWorkFilmTransitionState(payload) {
  if (!hasSessionStorage() || !payload) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota/private mode failures.
  }
}

export function getWorkFilmTransitionState({ maxAgeMs = MAX_AGE_MS } = {}) {
  if (!hasSessionStorage()) return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const ts = Number(parsed?.timestamp || 0);
    if (!Number.isFinite(ts) || Date.now() - ts > maxAgeMs) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearWorkFilmTransitionState() {
  if (!hasSessionStorage()) return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

