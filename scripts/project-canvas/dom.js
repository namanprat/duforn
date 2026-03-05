import {
  getWorkFilmTransitionState,
  clearWorkFilmTransitionState,
} from '../work-film-transition-state.js';
import { queryLast } from '../runtime/dom.js';

export function getFilmContainer(containerArg) {
  if (containerArg && containerArg.querySelector) return containerArg;
  return queryLast('[data-page-container="true"][data-page-namespace="film"]') || document;
}

export function ensureBackgroundElement() {
  let bg = document.getElementById('background');
  if (bg) return bg;
  bg = document.createElement('div');
  bg.id = 'background';
  document.body.insertBefore(bg, document.body.firstChild);
  return bg;
}

export function bindFilmTemplateFromTransitionState(containerArg) {
  const containerEl = getFilmContainer(containerArg);
  const state = getWorkFilmTransitionState();
  if (!containerEl || !state) return null;

  const coverImg = containerEl.querySelector('.coverimg img');
  if (coverImg && state.imageSrc) {
    coverImg.src = state.imageSrc;
  }

  const titleEl = containerEl.querySelector('.slide-title');
  if (titleEl && state.title) {
    titleEl.textContent = state.title;
  }

  clearWorkFilmTransitionState();
  return state;
}
