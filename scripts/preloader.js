import gsap from 'gsap';
import { GLTFLoader } from 'three-stdlib';
import * as THREE from 'three';

export class Preloader {
    constructor() {
        this.cacheDom();

        this.loadingManager = new THREE.LoadingManager();
        this.gltfLoader = new GLTFLoader(this.loadingManager);

        this.animationComplete = false;
        this.pendingLoadBatches = 0;
        this.runPromise = null;
        this.runResolver = null;
        this.isCompleting = false;

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

    generateGrid() {
        const gridContainer = document.querySelector('.preloader-grid');
        if (!gridContainer) return;

        // Calculate columns and rows for ~200 squares while keeping them 1:1
        const width = window.innerWidth;
        const height = window.innerHeight;

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

        // Add resize listener
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.generateGrid(), 200);
        });

        const hasSeenPreloader = sessionStorage.getItem('preloaderSeen') === 'true';
        // const hasSeenPreloader = false; // FORCE SHOW for debugging

        if (!this.container) return Promise.resolve();
        if (this.runPromise) return this.runPromise;

        if (hasSeenPreloader) {
            this.container.style.display = 'none';
            return Promise.resolve();
        }

        this.container.style.display = 'flex';
        this.animationComplete = false;
        this.pendingLoadBatches = 0;
        this.isCompleting = false;

        this.runPromise = new Promise((resolve) => {
            this.runResolver = resolve;
            this.startSequence();
        });

        return this.runPromise;
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
                this.gltfLoader.load(url, resolve, undefined, reject);
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
            const randomDelay = 200 + Math.random() * 400;

            setTimeout(() => {
                gsap.to(this.progressIndicator, {
                    '--progress': targetProgress / 100,
                    duration: 0.5,
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
        if (!this.runPromise) return;
        if (this.pendingLoadBatches === 0 && this.animationComplete) {
            this.complete();
        }
    }

    resolveRun() {
        if (this.runResolver) {
            this.runResolver();
        }
        this.runResolver = null;
        this.runPromise = null;
        this.isCompleting = false;
    }

    complete() {
        if (!this.container) {
            this.resolveRun();
            return;
        }
        if (this.isCompleting) return;
        this.isCompleting = true;

        sessionStorage.setItem('preloaderSeen', 'true');

        gsap.to(this.progressBar, {
            opacity: 0,
            duration: 0.075,
            ease: 'power2.inOut',
            delay: 0.3,
            repeat: 1,
            yoyo: true,
            onComplete: () => {
                gsap.set(this.progressBar, { opacity: 0 });

                setTimeout(() => {
                    // If no blocks found (e.g. user didn't add them), just hide container
                    if (!this.preloaderBlocks || this.preloaderBlocks.length === 0) {
                        this.container.style.display = 'none';
                        this.resolveRun();
                        return;
                    }

                    // Loop through all blocks and animate them out with random delays
                    const maxDelay = 0.8; // Speed up: total time window for reveal
                    let completedAnimations = 0;
                    const totalBlocks = this.preloaderBlocks.length;

                    this.preloaderBlocks.forEach((block) => {
                        const randomDelay = Math.random() * maxDelay;

                        gsap.to(block, {
                            opacity: 0,
                            duration: 0.1, // Slightly faster fade per block
                            ease: 'power1.out',
                            delay: randomDelay,
                            onComplete: () => {
                                gsap.set(block, { opacity: 0 });
                                completedAnimations++;
                                // Once the last one finishes (or close to it), resolve
                                if (completedAnimations >= totalBlocks) {
                                    this.container.style.display = 'none';
                                    this.resolveRun();
                                }
                            },
                        });
                    });
                }, 200);
            },
        });
    }
}

export const preloader = new Preloader();
