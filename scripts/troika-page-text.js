import * as THREE from 'three';
import gsap from 'gsap';
import SplitType from 'split-type';
import { Text } from 'troika-three-text';

const namespaceRegistry = new Map();
const keyRegistry = new Map();

let overlayScene = null;
let overlayCamera = null;
let layerReady = false;
let parallax = { x: 0, y: 0 };
const PARALLAX_X_MULT = 18;
const PARALLAX_Y_MULT = 12;

function resolveTroikaFontPath(fontFamily) {
  const families = (fontFamily || '')
    .split(',')
    .map(part => part.trim().replace(/^['"]|['"]$/g, '').toLowerCase());

  for (const family of families) {
    if (family.includes('otjubilee')) return '/OTJubilee-Golden.otf';
    if (family.includes('neuemontreal') || family.includes('ppneuemontreal')) return '/PPNeueMontreal-Medium.otf';
    if (family.includes('geist')) return '/GeistMono.woff2';
  }

  return '/OTJubilee-Golden.otf';
}

function applyTextTransform(text, transform) {
  if (transform === 'uppercase') return text.toUpperCase();
  if (transform === 'lowercase') return text.toLowerCase();
  if (transform === 'capitalize') {
    return text.replace(/\b\p{L}/gu, (m) => m.toUpperCase());
  }
  return text;
}

export function initTroikaOverlayLayer() {
  if (layerReady) return;
  overlayScene = new THREE.Scene();
  overlayCamera = new THREE.OrthographicCamera(
    -window.innerWidth / 2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    -window.innerHeight / 2,
    -1000,
    1000
  );
  overlayCamera.position.z = 500;
  layerReady = true;
}

export function resizeTroikaOverlayLayer(width, height) {
  if (!layerReady || !overlayCamera) return;
  overlayCamera.left = -width / 2;
  overlayCamera.right = width / 2;
  overlayCamera.top = height / 2;
  overlayCamera.bottom = -height / 2;
  overlayCamera.updateProjectionMatrix();
}

export function renderTroikaOverlayLayer(renderer) {
  if (!layerReady || !overlayScene || !overlayCamera || !renderer) return;
  const prevAutoClear = renderer.autoClear;
  renderer.autoClear = false;
  renderer.clearDepth();
  renderer.render(overlayScene, overlayCamera);
  renderer.autoClear = prevAutoClear;
}

function getTargets(namespace) {
  if (namespace === 'home') {
    return Array.from(document.querySelectorAll('.hero-text-reveal')).map((sourceEl) => ({
      sourceEl,
      splitType: 'lines',
      direction: 'up'
    }));
  }

  if (namespace === 'contact') {
    return Array.from(document.querySelectorAll('.text-reveal-header:not(a):not(.troika-source-hidden)')).map((sourceEl) => ({
      sourceEl,
      splitType: 'words',
      direction: sourceEl.classList.contains('text-reveal-reverse') ? 'down' : 'up'
    }));
  }

  return [];
}

function clearNamespace(namespace) {
  const existing = namespaceRegistry.get(namespace);
  if (!existing) return;

  const splitsToRevert = new Set();
  existing.entries.forEach((entry) => {
    keyRegistry.delete(entry.key);
    if (entry.mesh?.parent) entry.mesh.parent.remove(entry.mesh);
    if (typeof entry.mesh?.dispose === 'function') entry.mesh.dispose();
    if (entry.split?.revert) splitsToRevert.add(entry.split);
    if (entry.sourceEl) entry.sourceEl.classList.remove('troika-source-hidden');
  });
  splitsToRevert.forEach(split => split.revert());
  namespaceRegistry.delete(namespace);
}

function syncEntryFromDom(entry) {
  if (!entry.sourceEl?.isConnected || !entry.unitEl?.isConnected || !entry.mesh) return;

  const style = window.getComputedStyle(entry.sourceEl);
  const rect = entry.unitEl.getBoundingClientRect();
  const fontSizePx = Number.parseFloat(style.fontSize) || 16;
  const letterSpacingPx = Number.parseFloat(style.letterSpacing);
  const lineHeightPx = Number.parseFloat(style.lineHeight);
  const textAlign = style.textAlign || 'center';
  const rawText = entry.unitEl.textContent?.trim() || '';
  const transformedText = applyTextTransform(rawText, style.textTransform);

  entry.mesh.text = transformedText;
  entry.mesh.font = resolveTroikaFontPath(style.fontFamily || '');
  entry.mesh.fontSize = fontSizePx;
  entry.mesh.fontStyle = style.fontStyle || 'normal';
  entry.mesh.fontWeight = style.fontWeight || '400';
  entry.mesh.textAlign = textAlign;
  entry.mesh.letterSpacing = Number.isFinite(letterSpacingPx) ? (letterSpacingPx / fontSizePx) : 0;
  entry.mesh.lineHeight = Number.isFinite(lineHeightPx) ? (lineHeightPx / fontSizePx) : 'normal';
  entry.mesh.maxWidth = Math.max(rect.width, fontSizePx);

  const color = new THREE.Color();
  color.setStyle(style.color || '#e2e2e2');
  entry.mesh.color = color.getHex();

  entry.baseX = rect.left + rect.width * 0.5 - window.innerWidth * 0.5;
  entry.baseY = window.innerHeight * 0.5 - (rect.top + rect.height * 0.5);
  entry.lineHeightPx = Number.isFinite(lineHeightPx) ? lineHeightPx : fontSizePx * 1.2;

  entry.mesh.position.set(entry.baseX, entry.baseY, 190);
  entry.mesh.sync();
}

export function mountTroikaPageText({ namespace }) {
  if (!layerReady || (namespace !== 'home' && namespace !== 'contact')) return;

  clearNamespace(namespace);

  const targets = getTargets(namespace);
  if (!targets.length) return;

  const entries = [];
  let entryIndex = 0;

  targets.forEach((target) => {
    const { sourceEl, splitType, direction } = target;
    const split = new SplitType(sourceEl, { types: splitType });
    const units = splitType === 'lines' ? split.lines : split.words;
    sourceEl.classList.add('troika-source-hidden');

    if (!units?.length) {
      split.revert();
      sourceEl.classList.remove('troika-source-hidden');
      return;
    }

    units.forEach((unitEl) => {
      const mesh = new Text();
      mesh.anchorX = 'center';
      mesh.anchorY = 'middle';
      mesh.material.depthTest = false;
      mesh.material.depthWrite = false;
      mesh.material.transparent = true;
      mesh.frustumCulled = false;
      mesh.renderOrder = 20;

      overlayScene.add(mesh);

      const key = `${namespace}:${entryIndex}`;
      const entry = {
        key,
        namespace,
        sourceEl,
        split,
        unitEl,
        mesh,
        direction,
        baseX: 0,
        baseY: 0,
        lineHeightPx: 16,
        state: {
          opacity: 1,
          yPercent: 0
        }
      };

      syncEntryFromDom(entry);
      keyRegistry.set(key, entry);
      entries.push(entry);
      entryIndex += 1;
    });
  });

  if (!entries.length) return;
  namespaceRegistry.set(namespace, { entries });
}

export function unmountTroikaPageText(namespace) {
  if (namespace) {
    clearNamespace(namespace);
    return;
  }
  Array.from(namespaceRegistry.keys()).forEach((ns) => clearNamespace(ns));
}

export function setTroikaTextState(key, state) {
  const entry = keyRegistry.get(key);
  if (!entry) return;
  if (typeof state.opacity === 'number') entry.state.opacity = state.opacity;
  if (typeof state.yPercent === 'number') entry.state.yPercent = state.yPercent;
}

function getNamespaceEntries(namespace) {
  return namespaceRegistry.get(namespace)?.entries || [];
}

function tweenToPromise(tween) {
  return new Promise(resolve => tween.eventCallback('onComplete', resolve));
}

export async function animateTroikaTextOut(namespace) {
  const entries = getNamespaceEntries(namespace);
  if (!entries.length) return;

  const params = namespace === 'home'
    ? { duration: 0.3, stagger: 0.03, ease: 'power2.in' }
    : { duration: 0.25, stagger: 0.015, ease: 'power2.in' };

  const tweens = entries.map((entry, index) => gsap.to(entry.state, {
    opacity: 0,
    yPercent: entry.direction === 'down' ? 100 : -100,
    duration: params.duration,
    delay: index * params.stagger,
    ease: params.ease
  }));

  await Promise.all(tweens.map(tweenToPromise));
}

export async function animateTroikaTextIn(namespace) {
  const entries = getNamespaceEntries(namespace);
  if (!entries.length) return;

  const params = namespace === 'home'
    ? { duration: 0.6, stagger: 0.08, ease: 'power2.out' }
    : { duration: 0.8, stagger: 0.04, ease: 'power2.out' };

  entries.forEach((entry) => {
    entry.state.opacity = 0;
    entry.state.yPercent = entry.direction === 'down' ? 100 : -100;
  });

  const tweens = entries.map((entry, index) => gsap.to(entry.state, {
    opacity: 1,
    yPercent: 0,
    duration: params.duration,
    delay: index * params.stagger,
    ease: params.ease
  }));

  await Promise.all(tweens.map(tweenToPromise));
}

export function syncTroikaLayoutOnResize() {
  namespaceRegistry.forEach((namespaceData) => {
    namespaceData.entries.forEach((entry) => syncEntryFromDom(entry));
  });
}

export function applyTroikaFrame({ mouseX = 0, mouseY = 0 } = {}) {
  parallax.x = mouseX * PARALLAX_X_MULT;
  parallax.y = mouseY * PARALLAX_Y_MULT;

  namespaceRegistry.forEach((namespaceData) => {
    namespaceData.entries.forEach((entry) => {
      const yOffset = (entry.state.yPercent / 100) * entry.lineHeightPx;
      entry.mesh.position.x = entry.baseX + parallax.x;
      entry.mesh.position.y = entry.baseY + parallax.y + yOffset;
      entry.mesh.material.opacity = entry.state.opacity;
      entry.mesh.visible = entry.state.opacity > 0.001;
    });
  });
}

export function setTroikaNamespaceOpacity(namespace, opacity) {
  const entries = getNamespaceEntries(namespace);
  if (!entries.length) return;
  const clamped = Math.max(0, Math.min(1, opacity));
  entries.forEach((entry) => {
    entry.state.opacity = clamped;
  });
}
