import { GLTFLoader, DRACOLoader } from 'three-stdlib';
import * as THREE from 'three';
import { createPaintDebugLogger } from './runtime/debug.js';
import { cloneSceneGraph } from './runtime/assets.js';

const paintDebugMark = createPaintDebugLogger('paint-debug');

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const EXIT_ANIMATION_MS = 900;
const FILL_DURATION_MS = 2600;
const BAR_WIDTH = 30; // number of characters in the progress bar

class Preloader {
    constructor() {
        this.loadingManager = new THREE.LoadingManager();
        this.gltfLoader = new GLTFLoader(this.loadingManager);

        // Setup DRACOLoader for compressed geometry
        this.dracoLoader = new DRACOLoader(this.loadingManager);
        this.dracoLoader.setDecoderPath('/draco/');
        this.gltfLoader.setDRACOLoader(this.dracoLoader);

        this.animationComplete = false;
        this.pendingLoadBatches = 0;
        this.runPromise = null;
        this.runResolver = null;
        this.isCompleting = false;
        this.loadedAssets = new Map();

        // DOM references
        this.container = null;
        this.canvasWrap = null;
        this.loadingText = null;
        this.progressBar = null;
        this.buttonWrap = null;
        this.enterButton = null;
        this.cursorEl = null;

        // Bind methods
        this.init = this.init.bind(this);
        this.load = this.load.bind(this);
    }

    isBlocking() {
        return Boolean(this.runPromise);
    }

    cacheDom() {
        this.container = document.querySelector('.preloader');
        this.canvasWrap = document.querySelector('.preloader-canvas-wrap');
        this.loadingText = document.querySelector('.preloader-loading');
        this.progressBar = document.querySelector('.preloader-progress-bar');
        this.buttonWrap = document.querySelector('.preloader-button-wrap');
        this.enterButton = document.querySelector('.preloader-enter-button');
        this.cursorEl = document.querySelector('.preloader-cursor');
    }

    init() {
        this.cacheDom();

        const hasSeenPreloader = sessionStorage.getItem('preloaderSeen') === 'true';
        // const hasSeenPreloader = false; // FORCE SHOW for debugging

        if (!this.container) return Promise.resolve();
        if (this.runPromise) return this.runPromise;

        if (hasSeenPreloader) {
            this.container.style.display = 'none';
            document.body.classList.remove('preloader-active');
            paintDebugMark('preloader hidden (already seen)');
            window.audioEnabled = true;
            window.gyroEnabled = true;
            return Promise.resolve();
        }

        this.container.style.display = 'flex';
        document.body.classList.add('preloader-active');
        paintDebugMark('preloader shown');
        this.animationComplete = false;
        this.pendingLoadBatches = 0;
        this.isCompleting = false;

        // R3F handles its own initialization now
        this.runPromise = new Promise((resolve) => {
            this.runResolver = resolve;
            this.startFillAnimation();
        });

        return this.runPromise;
    }

    // ----- Asset loading (unchanged) -----

    async load(urls) {
        this.pendingLoadBatches += 1;

        if (!urls || urls.length === 0) {
            this.pendingLoadBatches = Math.max(0, this.pendingLoadBatches - 1);
            this.checkCompletion();
            return;
        }

        const promises = urls.map(url => {
            if (this.loadedAssets.has(url)) {
                return Promise.resolve(this.loadedAssets.get(url));
            }

            return new Promise((resolve, reject) => {
                this.gltfLoader.load(url, (gltf) => {
                    this.loadedAssets.set(url, gltf);
                    resolve(gltf);
                }, undefined, reject);
            });
        });

        try {
            await Promise.all(promises);
        } catch {
        } finally {
            this.pendingLoadBatches = Math.max(0, this.pendingLoadBatches - 1);
            this.checkCompletion();
        }
    }

    hold() {
        this.pendingLoadBatches += 1;
    }

    release() {
        this.pendingLoadBatches = Math.max(0, this.pendingLoadBatches - 1);
        this.checkCompletion();
    }

    getAsset(url) {
        return this.loadedAssets.get(url) || null;
    }

    getAssetClone(url, options = {}) {
        const asset = this.getAsset(url);
        if (!asset?.scene) return asset;

        return {
            ...asset,
            scene: cloneSceneGraph(asset.scene, options),
        };
    }

    clearAssets() {
        this.loadedAssets.clear();
    }

    // ----- Terminal-style fill animation -----

    buildProgressBar(percent) {
        const filled = Math.round((percent / 100) * BAR_WIDTH);
        const empty = BAR_WIDTH - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }

    startFillAnimation() {
        if (!this.loadingText && !this.progressBar) {
            this.animationComplete = true;
            this.checkCompletion();
            return;
        }

        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const ratio = clamp(elapsed / FILL_DURATION_MS, 0, 1);
            const percent = Math.round(ratio * 100);

            // Update terminal-style progress bar
            if (this.progressBar) {
                this.progressBar.textContent = `[${this.buildProgressBar(percent)}] ${String(percent).padStart(3, ' ')}%`;
            }
            window.dispatchEvent(new CustomEvent('preloader-progress', { detail: { percent, text: this.buildProgressBar(percent) } }));

            // Update loading text
            if (this.loadingText) {
                this.loadingText.textContent = '> LOADING ASSETS...';
            }

            if (percent >= 100) {
                if (this.loadingText) {
                    this.loadingText.textContent = '> LOADING COMPLETE';
                }
                this.animationComplete = true;
                this.checkCompletion();
                return;
            }

            requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }

    // ----- Completion -----

    checkCompletion() {
        if (!this.runPromise) return;

        // If animation is complete AND no pending batches, we are done
        if (this.pendingLoadBatches <= 0 && this.animationComplete) {
            this.showEnterButton();
        }
    }

    showEnterButton() {
        if (this.isCompleting) return;
        this.isCompleting = true;

        // Hide progress, show enter button
        if (this.progressBar) {
            this.progressBar.style.opacity = '0.3';
        }
        if (this.buttonWrap) {
            this.buttonWrap.classList.add('is-visible');
        }
        window.preloaderComplete = true;
        window.dispatchEvent(new CustomEvent('preloader-complete'));

        // Bind enter button click
        if (this.enterButton) {
            this.enterButton.addEventListener('click', () => {
                this.handleEnterClick();
            }, { once: true });
        }
    }

    handleEnterClick() {
        window.dispatchEvent(new CustomEvent('preloader-exit-start'));

        // 1. Audio Permission
        window.audioEnabled = true;
        if (typeof window.AudioContext !== 'undefined' || typeof window.webkitAudioContext !== 'undefined') {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioCtx.resume();
        }

        // 2. Gyroscope Permission
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.gyroEnabled = true;
                    }
                    this.exitPreloader();
                })
                .catch(() => {
                    this.exitPreloader();
                });
        } else {
            window.gyroEnabled = true;
            this.exitPreloader();
        }
    }

    exitPreloader() {
        if (!this.container) {
            this.resolveRun();
            return;
        }

        sessionStorage.setItem('preloaderSeen', 'true');

        // CRT power-off animation
        this.container.classList.add('is-exiting');

        // R3F handles its own destruction on display complete, or unmount, we just hide it

        setTimeout(() => {
            this.container.style.display = 'none';
            document.body.classList.remove('preloader-active');
            paintDebugMark('preloader hidden');
            this.resolveRun();
        }, EXIT_ANIMATION_MS);
    }

    resolveRun() {
        if (this.runResolver) {
            this.runResolver();
        }
        this.runResolver = null;
        this.runPromise = null;
        this.isCompleting = false;
    }
}

export const preloader = new Preloader();
