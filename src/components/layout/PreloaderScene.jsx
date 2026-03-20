import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, useReducer } from 'react';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { Text, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { HalftoneGlitchShader } from '../../../scripts/shaders/halftone-shader.js';
import { CRTShader, GrainShader, VignetteShader, createPostFXUniforms } from '../../../scripts/shaders/post-fx.js';
import LogoModel from '../../models/LogoModel.jsx';

const FONT_PATH = '/Px437_Olivetti_M15-2y.ttf';
const REVEAL_DURATION = 0.72;
const EXIT_DURATION = 0.34;
const LETTER_WIDTH = 0.092;
const SPACE_WIDTH = 0.06;
const HEADER_LINES = [
    '╔══════════════════╗',
    '║  DUFORN SYSTEMS  ║',
    '║ TERMINAL v2.0.26 ║',
    '╚══════════════════╝',
];

function getTerminalColor() {
    if (typeof window !== 'undefined') {
        const computed = getComputedStyle(document.documentElement);
        const swatch = computed.getPropertyValue('--swatch-terminal').trim();
        if (swatch && swatch !== '#000000' && swatch !== 'black') return swatch;
    }
    return '#00ff41';
}

function hashSeed(input) {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function seededRange(seed, min, max) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    const normalized = value - Math.floor(value);
    return min + (max - min) * normalized;
}

function buildLetterLayout(text, layoutSeed) {
    const chars = Array.from(text);
    const totalWidth = chars.reduce((sum, char) => sum + (char === ' ' ? SPACE_WIDTH : LETTER_WIDTH), 0);
    let cursor = -totalWidth / 2;

    return chars.map((char, index) => {
        const width = char === ' ' ? SPACE_WIDTH : LETTER_WIDTH;
        const x = cursor + width / 2;
        cursor += width;

        const seed = hashSeed(`${layoutSeed}:${index}:${char}`);
        return {
            id: `${layoutSeed}-${index}-${char}`,
            char,
            x,
            delay: seededRange(seed + 1, 0, 0.18),
            flickerRate: seededRange(seed + 11, 18, 34),
            flickerCutoff: seededRange(seed + 21, 0.28, 0.72),
            pulse: seededRange(seed + 31, 0.9, 1.08),
        };
    });
}

function FlickerTextLine({
    text,
    lineKey,
    position = [0, 0, 0],
    phase,
    fontSize = 0.15,
    color,
    fillOpacity = 1,
    onClick,
    onPointerOver,
    onPointerOut,
}) {
    const groupRef = useRef(null);
    const startedAtRef = useRef(null);
    const previousPhaseRef = useRef(phase);
    const layout = useMemo(() => buildLetterLayout(text, lineKey), [text, lineKey]);

    if (previousPhaseRef.current !== phase) {
        previousPhaseRef.current = phase;
        startedAtRef.current = null;
    }

    useFrame((state) => {
        if (!groupRef.current) return;
        if (startedAtRef.current == null) startedAtRef.current = state.clock.getElapsedTime();

        const elapsed = state.clock.getElapsedTime() - startedAtRef.current;
        const duration = phase === 'out' ? EXIT_DURATION : REVEAL_DURATION;
        const children = groupRef.current.children;

        for (let i = 0; i < children.length; i += 1) {
            const child = children[i];
            const letter = layout[i];
            if (!child || !letter) continue;

            const localElapsed = Math.max(0, elapsed - letter.delay);
            const t = THREE.MathUtils.clamp(localElapsed / duration, 0, 1);

            let opacity = 0;
            if (phase === 'out') {
                const eased = THREE.MathUtils.smoothstep(t, 0, 1);
                const flicker = localElapsed <= duration
                    ? (Math.sin(localElapsed * letter.flickerRate) > letter.flickerCutoff ? 0.3 : 1)
                    : 0;
                opacity = fillOpacity * (1 - eased) * flicker;
            } else {
                const eased = 1 - Math.pow(1 - t, 3);
                const introFlicker = t < 0.78
                    ? (Math.sin(localElapsed * letter.flickerRate) > letter.flickerCutoff ? 0.16 : 1)
                    : 1;
                const glowPulse = t < 1 ? letter.pulse : 1;
                opacity = fillOpacity * THREE.MathUtils.lerp(0.05, 1, eased) * introFlicker * glowPulse;
            }

            child.fillOpacity = Math.max(0, Math.min(fillOpacity, opacity));
            child.material.opacity = 1;
            child.position.x = letter.x;
            child.position.y = 0;
            child.position.z = 0;
        }
    });

    return (
        <group
            ref={groupRef}
            position={position}
            onClick={onClick}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
        >
            {layout.map((letter) => (
                <Text
                    key={letter.id}
                    font={FONT_PATH}
                    fontSize={fontSize}
                    color={color}
                    anchorX="center"
                    anchorY="middle"
                    position={[letter.x, 0, 0]}
                    depthTest={false}
                    renderOrder={999}
                    fillOpacity={letter.char === ' ' ? 0 : fillOpacity * 0.05}
                    letterSpacing={0}
                >
                    {letter.char === ' ' ? '\u00A0' : letter.char}
                </Text>
            ))}
        </group>
    );
}

function Effects({ textScene }) {
    const { gl, scene, camera, size } = useThree();
    const composer = useRef(null);
    const crtPass = useRef(null);
    const halftonePassRef = useRef(null);
    const postFXUniforms = useMemo(() => createPostFXUniforms(), []);
    const terminalColor = useMemo(() => getTerminalColor(), []);

    const halftoneConfig = useMemo(() => ({ color: terminalColor }), [terminalColor]);

    const crtConfig = useMemo(() => ({
        scanlineIntensity: 0.75,
        scanlineCount: 260,
        curvature: 0.65,
        rgbShift: 0.01,
        flickerStrength: 0.02,
        brightness: 1.1,
        contrast: 1.05,
        saturation: 1.7,
        bloomIntensity: 1.0,
    }), []);

    useEffect(() => {
        const comp = new EffectComposer(gl);
        comp.addPass(new RenderPass(scene, camera));

        const halftoneColor = new THREE.Color(halftoneConfig.color);
        const halftoneShaderDef = HalftoneGlitchShader({
            color: halftoneColor,
        });
        const halftonePass = new ShaderPass(halftoneShaderDef);
        halftonePass.uniforms.uResolution.value.set(
            size.width * gl.getPixelRatio(),
            size.height * gl.getPixelRatio(),
        );
        comp.addPass(halftonePass);
        halftonePassRef.current = halftonePass;

        const textRenderPass = new RenderPass(textScene, camera);
        textRenderPass.clear = false;
        textRenderPass.clearDepth = true;
        comp.addPass(textRenderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(size.width, size.height),
            0.1,
            0.35,
            0.8,
        );
        comp.addPass(bloomPass);

        const vignettePass = new ShaderPass(VignetteShader({ darkness: 0.15, offset: 1.0 }));
        comp.addPass(vignettePass);

        const grainPass = new ShaderPass(GrainShader({ grain: 0.03 }));
        grainPass.uniforms.uTime = postFXUniforms.uTime;
        comp.addPass(grainPass);

        const crt = new ShaderPass(CRTShader);
        crt.uniforms.scanlineIntensity.value = crtConfig.scanlineIntensity;
        crt.uniforms.scanlineCount.value = crtConfig.scanlineCount;
        crt.uniforms.curvature.value = crtConfig.curvature;
        crt.uniforms.rgbShift.value = crtConfig.rgbShift;
        crt.uniforms.flickerStrength.value = crtConfig.flickerStrength;
        crt.uniforms.brightness.value = crtConfig.brightness;
        crt.uniforms.contrast.value = crtConfig.contrast;
        crt.uniforms.saturation.value = crtConfig.saturation;
        crt.uniforms.bloomIntensity.value = crtConfig.bloomIntensity;
        comp.addPass(crt);
        crtPass.current = crt;

        comp.addPass(new OutputPass());
        composer.current = comp;

        return () => {
            comp.dispose();
        };
    }, [camera, crtConfig, gl, postFXUniforms, scene, size, terminalColor, textScene, halftoneConfig]);

    useFrame((state) => {
        if (!composer.current) return;
        if (crtPass.current) {
            crtPass.current.uniforms.time.value = state.clock.getElapsedTime();
        }
        if (halftonePassRef.current) {
            halftonePassRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
        postFXUniforms.uTime.value = state.clock.getElapsedTime();
        composer.current.render();
    }, 1);

    return null;
}

function PreloaderModel() {
    const groupRef = useRef(null);
    const modelRef = useRef(null);
    const didInitializeRef = useRef(false);

    const speed = 0.55;

    useLayoutEffect(() => {
        const model = modelRef.current;
        if (!model || didInitializeRef.current) return;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.traverse((child) => {
            if (!child.isMesh) return;
            if (child.geometry) {
                child.geometry.translate(-center.x, -center.y, -center.z);
            }
            child.material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.4,
                metalness: 0.1,
            });
        });
        didInitializeRef.current = true;
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.getElapsedTime() * speed;
        }
    });

    return (
        <group ref={groupRef} scale={[70, 70, 70]} position={[0, 0, 0]}>
            <group ref={modelRef}>
                <LogoModel />
            </group>
        </group>
    );
}

function PreloaderUI() {
    const [{ progress, bar, status, showEnter, cursorVisible, phase }, dispatch] = useReducer(
        (state, action) => {
            const updates = typeof action === 'function' ? action(state) : action;
            return { ...state, ...updates };
        },
        null,
        () => ({
            progress: 0,
            bar: ' '.repeat(30),
            status: '> LOADING ASSETS...',
            showEnter: false,
            cursorVisible: true,
            phase: 'in'
        })
    );
    const terminalColor = useMemo(() => getTerminalColor(), []);
    const [enterHovered, setEnterHovered] = useState(false);
    useCursor(showEnter && enterHovered, 'pointer', 'auto');

    useEffect(() => {
        if (typeof window !== 'undefined' && window.preloaderComplete) {
            dispatch({
                progress: 100,
                bar: '\u2588'.repeat(30),
                status: '> LOADING COMPLETE',
                showEnter: true
            });
        }

        const onProgress = (event) => {
            dispatch((state) => ({
                progress: event.detail.percent,
                bar: event.detail.text || ' '.repeat(30),
                status: event.detail.percent >= 100 ? '> LOADING COMPLETE' : state.status
            }));
        };

        const onComplete = () => {
            dispatch({ showEnter: true });
            window.preloaderComplete = true;
        };

        const onExitStart = () => {
            dispatch({ phase: 'out' });
        };

        window.addEventListener('preloader-progress', onProgress);
        window.addEventListener('preloader-complete', onComplete);
        window.addEventListener('preloader-exit-start', onExitStart);

        return () => {
            window.removeEventListener('preloader-progress', onProgress);
            window.removeEventListener('preloader-complete', onComplete);
            window.removeEventListener('preloader-exit-start', onExitStart);
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            dispatch((state) => ({ cursorVisible: !state.cursorVisible }));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const handleEnter = () => {
        const enterBtn = document.querySelector('.preloader-enter-button');
        if (enterBtn) enterBtn.click();
    };

    const progressLine = `[${bar}]   ${progress}%`;
    const enterLine = `> ENTER_WEBSITE${cursorVisible ? '_' : ' '}`;

    return (
        <group position={[0, 0, 0]}>
            <group position={[0, 1.25, 0]}>
                {HEADER_LINES.map((line, lineIndex) => (
                    <FlickerTextLine
                        key={line}
                        text={line}
                        lineKey={line}
                        position={[0, -lineIndex * 0.24, 0]}
                        phase={phase}
                        fontSize={0.16}
                        color={terminalColor}
                        fillOpacity={0.9}
                    />
                ))}
            </group>

            <FlickerTextLine
                text={status}
                lineKey={`status-${status}`}
                position={[0, -0.95, 0]}
                phase={phase}
                fontSize={0.15}
                color={terminalColor}
                fillOpacity={1}
            />

            <FlickerTextLine
                text={progressLine}
                lineKey={`progress-${progressLine}`}
                position={[0, -1.35, 0]}
                phase={phase}
                fontSize={0.15}
                color={terminalColor}
                fillOpacity={1}
            />

            {showEnter && (
                <group position={[0, -1.95, 0]}>
                    <FlickerTextLine
                        text={enterLine}
                        lineKey={`enter-${enterLine}`}
                        phase={phase}
                        fontSize={0.22}
                        color={terminalColor}
                        fillOpacity={1}
                    />
                    {/* Invisible hit-area plane — absorbs clicks across CRT barrel-distortion offset */}
                    <mesh
                        onClick={handleEnter}
                        onPointerOver={() => setEnterHovered(true)}
                        onPointerOut={() => setEnterHovered(false)}
                    >
                        <planeGeometry args={[4, 0.8]} />
                        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                    </mesh>
                </group>
            )}
        </group>
    );
}

export default function PreloaderScene() {
    const textSceneInfo = useMemo(() => ({ scene: new THREE.Scene() }), []);

    return (
        <>
            <Canvas
                camera={{ position: [0, 0, 6.5], fov: 75, near: 0.1, far: 100 }}
                gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
            >
                <color attach="background" args={['#000000']} />

                <ambientLight intensity={0.5} color={0xffffff} />
                <directionalLight position={[5, 5, 5]} intensity={1} color={0xffffff} />

                <React.Suspense fallback={null}>
                    <PreloaderModel />
                </React.Suspense>

                {createPortal(<PreloaderUI />, textSceneInfo.scene)}

                <Effects textScene={textSceneInfo.scene} />
            </Canvas>
        </>
    );
}
