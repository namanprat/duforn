import gsap from 'gsap';
import { GLTFLoader, DRACOLoader } from 'three-stdlib';
import * as THREE from 'three';
import { createPaintDebugLogger } from './runtime/debug.js';
import { debounce } from './runtime/timing.js';

const paintDebugMark = createPaintDebugLogger('paint-debug');

export class Preloader {
    constructor() {
        this.cacheDom();

        this.loadingManager = new THREE.LoadingManager();
        this.gltfLoader = new GLTFLoader(this.loadingManager);

        // Setup DRACOLoader for compressed geometry
        this.dracoLoader = new DRACOLoader(this.loadingManager);
        // Serve Draco decoder locally from public/draco/ (copied from three/examples/jsm/libs/draco/gltf/)
        this.dracoLoader.setDecoderPath('/draco/');
        this.gltfLoader.setDRACOLoader(this.dracoLoader);

        this.animationComplete = false;
        this.pendingLoadBatches = 0;
        this.readyPromise = null;
        this.readyResolver = null;
        this.exitPromise = null;
        this.exitResolver = null;
        this.isCompleting = false;
        this.hasCompleted = false;
        this.enterConfirmed = false;
        this.isBlocking = false;
        this.loadedAssets = new Map();
        this.resizeHandler = null;
        this._lastGridWidth = 0;
        this._lastGridHeight = 0;

        // Bind methods
        this.init = this.init.bind(this);
        this.load = this.load.bind(this);
    }

    cacheDom() {
        this.container = document.querySelector('.preloader');
        this.progressBar = document.querySelector('.progress-bar');
        this.progressIndicator = document.querySelector('.progress-bar-indicator');
        this.progressText = document.querySelector('.progress-bar-copy span');
        // this.preloaderBlocks will be populated after generation
        this.resizeObserver = null;
    }

    generateGrid(force = false) {
        const gridContainer = document.querySelector('.preloader-grid');
        if (!gridContainer) return;

        // Calculate columns and rows for ~200 squares while keeping them 1:1
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Skip regeneration if viewport dimensions haven't changed
        if (!force && width === this._lastGridWidth && height === this._lastGridHeight) return;
        this._lastGridWidth = width;
        this._lastGridHeight = height;

        // Target roughly 200 blocks total
        // area = w * h
        // blockSize = sqrt(area / 200)
        const area = width * height;
        const targetBlockSize = Math.sqrt(area / 200);

        const cols = Math.ceil(width / targetBlockSize);
        const rows = Math.ceil(height / targetBlockSize);

        gridContainer.style.setProperty('grid-template-columns', `repeat(${cols}, 1fr)`);
        gridContainer.style.setProperty('grid-template-rows', `repeat(${rows}, 1fr)`);

        gridContainer.innerHTML = ''; // Clear existing
        const totalBlocks = cols * rows;

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < totalBlocks; i++) {
            const block = document.createElement('div');
            block.classList.add('preloader-block');
            fragment.appendChild(block);
        }
        gridContainer.appendChild(fragment);

        this.preloaderBlocks = document.querySelectorAll('.preloader-block');
    }

    init() {
        this.cacheDom();
        this.generateGrid();

        if (!this.container) return Promise.resolve();
        if (this.readyPromise) return this.readyPromise;
        if (this.hasCompleted) return Promise.resolve();

        this.setupResizeListener();
        this.container.style.display = 'flex';
        this.container.style.opacity = '1';
        this.container.style.pointerEvents = '';
        document.body.classList.add('preloader-active');
        paintDebugMark('preloader shown');
        this.animationComplete = false;
        this.pendingLoadBatches = 0;
        this.isCompleting = false;
        this.enterConfirmed = false;
        this.isBlocking = true;

        this.readyPromise = new Promise((resolve) => {
            this.readyResolver = resolve;
        });
        this.exitPromise = new Promise((resolve) => {
            this.exitResolver = resolve;
        });
        this.startSequence();

        return this.readyPromise;
    }

    async load(urls) {
        this.pendingLoadBatches += 1;

        if (!urls || urls.length === 0) {
            this.pendingLoadBatches = Math.max(0, this.pendingLoadBatches - 1);
            this.checkCompletion();
            return;
        }

        const promises = urls.map(url => {
            return new Promise((resolve, reject) => {
                this.gltfLoader.load(url, (gltf) => {
                    this.loadedAssets.set(url, gltf);
                    resolve(gltf);
                }, undefined, reject);
            });
        });

        try {
            await Promise.all(promises);
        } catch (error) {
            console.error('Error loading assets:', error);
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

    clearAssets() {
        this.loadedAssets.clear();
    }

    startSequence() {
        if (!this.progressIndicator || !this.progressText || !this.progressBar) {
            this.animationComplete = true;
            this.checkCompletion();
            return;
        }

        gsap.set(this.preloaderBlocks, { opacity: 1 });
        gsap.set(this.progressIndicator, { '--progress': 0 });
        if (this.progressText) this.progressText.textContent = '0%';

        gsap.to(this.progressBar, {
            opacity: 1,
            duration: 0.075,
            ease: 'power2.inOut',
            delay: 0.5,
            repeat: 1,
            yoyo: true,
            onComplete: () => {
                gsap.set(this.progressBar, { opacity: 1 });
                this.startIncrements();
            },
        });
    }

    startIncrements() {
        let currentProgress = 0;
        const totalSteps = 5;
        let stepCount = 0;
        const increments = this.generateRandomIncrements(totalSteps);

        const animateNextStep = () => {
            // If we are at the last step but assets aren't loaded yet, wait
            if (stepCount >= totalSteps) {
                this.animationComplete = true;
                this.checkCompletion();
                return;
            }

            const increment = increments[stepCount];
            // Cap at 99% until assets are actually loaded? 
            // User's code goes to 100. Let's stick to user's logic but maybe pause at 99 if needed.
            // For now, let's just run the animation. 
            // If animation finishes before assets, it will sit at 100% until pending loads finish.

            const targetProgress = Math.min(currentProgress + increment, 100);
            const randomDelay = 30 + Math.random() * 70;

            setTimeout(() => {
                gsap.to(this.progressIndicator, {
                    '--progress': targetProgress / 100,
                    duration: 0.15,
                    ease: 'power2.out',
                    onUpdate: () => {
                        // Update text
                        const val = Math.round(gsap.getProperty(this.progressIndicator, '--progress') * 100);
                        if (this.progressText) this.progressText.textContent = `${val}%`;
                    },
                    onComplete: () => {
                        currentProgress = targetProgress;
                        stepCount++;
                        animateNextStep();
                    },
                });
            }, randomDelay);
        };

        animateNextStep();
    }

    generateRandomIncrements(totalSteps) {
        const increments = [];
        let remaining = 100;
        const maxSingleIncrement = 30;

        for (let i = 0; i < totalSteps - 1; i++) {
            const maxIncrement = Math.min(
                maxSingleIncrement,
                remaining - (totalSteps - 1 - i),
            );
            const minIncrement = Math.max(
                5,
                Math.floor((remaining / (totalSteps - i)) * 0.5),
            );
            const increment =
                Math.floor(Math.random() * (maxIncrement - minIncrement)) + minIncrement;
            increments.push(increment);
            remaining -= increment;
        }

        increments.push(remaining);
        return increments.sort(() => Math.random() - 0.5);
    }

    checkCompletion() {
        if (!this.readyPromise) return;
        if (this.pendingLoadBatches === 0 && this.animationComplete) {
            this.complete();
        }
    }

    isBlockingContent() {
        return this.isBlocking;
    }

    hasEntered() {
        return this.enterConfirmed;
    }

    waitForExit() {
        if (this.hasCompleted || !this.container) return Promise.resolve();
        return this.exitPromise || Promise.resolve();
    }

    resolveReady() {
        if (this.readyResolver) {
            this.readyResolver();
        }
        this.readyResolver = null;
        this.readyPromise = null;
    }

    resolveExit() {
        if (this.exitResolver) {
            this.exitResolver();
        }
        this.exitResolver = null;
        this.exitPromise = null;
        this.isCompleting = false;
        this.hasCompleted = true;
        this.isBlocking = false;
        document.body.classList.remove('preloader-active');
        this.teardownResizeListener();
    }

    setupResizeListener() {
        if (this.resizeHandler) return;
        this.resizeHandler = debounce(() => this.generateGrid(), 200);

        window.addEventListener('resize', this.resizeHandler, { passive: true });
    }

    teardownResizeListener() {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler.cancel?.();
            this.resizeHandler = null;
        }
    }

    complete() {
        if (!this.container) {
            this.resolveReady();
            this.resolveExit();
            return;
        }
        if (this.isCompleting) return;
        this.isCompleting = true;

        // preloaderSeen flag removed — permission prompt shows on every visit

        setTimeout(() => {
            // Fade progress bar, then show ENTER button over the solid grid
            gsap.to(this.progressBar, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.inOut',
                onComplete: () => {
                    this.showEnterButton();
                    this.resolveReady();
                },
            });
        }, 500);
    }

    showEnterButton() {
        const wrapper = document.createElement('div');
        Object.assign(wrapper.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            opacity: 0,
            zIndex: 100,
            color: 'var(--theme-accent)',
        });

        const hint = document.createElement('p');
        hint.textContent = '// audio + haptics + motion';
        Object.assign(hint.style, {
            fontFamily: 'inherit',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            opacity: 0.5,
            margin: 0,
        });

        const enterBtn = document.createElement('button');
        enterBtn.textContent = 'ENTER';
        enterBtn.className = 'preloader-enter-btn';
        Object.assign(enterBtn.style, {
            background: 'transparent',
            border: '1px solid currentColor',
            color: 'inherit',
            padding: '1rem 3rem',
            fontFamily: 'inherit',
            fontSize: '1rem',
            letterSpacing: '0.1em',
            cursor: 'pointer',
        });

        wrapper.appendChild(hint);
        wrapper.appendChild(enterBtn);
        this.container.appendChild(wrapper);

        gsap.to(wrapper, { opacity: 1, duration: 0.5, ease: 'power2.out' });

        const onEnter = (e) => {
            if (e.type === 'touchstart') e.preventDefault();
            if (!this.enterConfirmed) this.handleEnterClick(wrapper);
        };
        enterBtn.addEventListener('click', onEnter);
        enterBtn.addEventListener('touchstart', onEnter, { passive: false });
    }

    handleEnterClick(wrapper) {
        this.enterConfirmed = true;
        window.gyroPermissionRequested = true;

        // 1. Gyroscope Permission (first — opens system prompt on iOS, must be in user gesture)
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.gyroEnabled = true;
                        window.dispatchEvent(new CustomEvent('gyro-enabled'));
                    }
                    this.outroAnimation(wrapper);
                })
                .catch(err => {
                    this.outroAnimation(wrapper);
                });
        } else {
            // Android or older devices where permission isn't requested explicitly
            window.gyroEnabled = true;
            window.dispatchEvent(new CustomEvent('gyro-enabled'));
            this.outroAnimation(wrapper);
        }

        // 2. Audio Permission (must also be in user gesture to unlock on iOS)
        window.audioEnabled = true;
        window.hapticsEnabled = true;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                const audioCtx = new AudioCtx();
                audioCtx.resume();
                window.__unlockedAudioCtx = audioCtx;
            }
        } catch (_) { /* audio unlock failed, continue */ }

        // 3. Haptics warm-up
        if (typeof window.hapticTrigger === 'function') {
            window.hapticTrigger([{ duration: 10, intensity: 0.1 }]);
        } else if (typeof navigator.vibrate === 'function') {
            navigator.vibrate(10);
        }
    }

    outroAnimation(wrapper) {
        // Fade out the enter button immediately
        gsap.to(wrapper, { opacity: 0, duration: 0.25, ease: 'power2.inOut' });

        if (!this.preloaderBlocks || this.preloaderBlocks.length === 0) {
            this.finishPreloader(wrapper);
            return;
        }

        // Scatter blocks as the outro
        const maxDelay = 0.5;
        let completedAnimations = 0;
        const totalBlocks = this.preloaderBlocks.length;

        this.preloaderBlocks.forEach((block) => {
            const randomDelay = Math.random() * maxDelay;
            gsap.to(block, {
                opacity: 0,
                duration: 0.1,
                ease: 'power1.out',
                delay: randomDelay,
                onComplete: () => {
                    completedAnimations++;
                    if (completedAnimations >= totalBlocks) {
                        this.finishPreloader(wrapper);
                    }
                },
            });
        });
    }

    finishPreloader(wrapper) {
        // wrapper already faded in outroAnimation — only fade the container
        gsap.to(this.container, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.inOut',
            onComplete: () => {
                this.container.style.display = 'none';
                this.container.style.pointerEvents = '';
                paintDebugMark('preloader hidden');
                wrapper.remove();
                this.resolveExit();
            }
        });
    }
}

export const preloader = new Preloader();
