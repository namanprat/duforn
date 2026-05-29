// @ts-nocheck
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STRIP_PATHS = [
  "/money-me/strip-01.png",
  "/money-me/strip-02.png",
  "/money-me/strip-03.png",
  "/money-me/strip-04.png",
  "/money-me/strip-05.png",
];

const ROTATION_DEG = 30;
const BG_HEX = "#3C3C3C";

function resolveSpaceGap(el) {
  if (!el) return 0;
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;visibility:hidden;width:var(--spacing-space-3);height:0;";
  el.appendChild(probe);
  const px = parseFloat(getComputedStyle(probe).width) || 0;
  el.removeChild(probe);
  return px;
}

function Strips({ wrapperRef }) {
  const textures = useTexture(STRIP_PATHS);
  const { size, invalidate } = useThree();
  const groupRef = useRef(null);
  const meshRefs = useRef([]);

  useMemo(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = 4;
    });
  }, [textures]);

  const stripDims = useMemo(() => {
    return textures.map((t) => {
      const img = t.image;
      const w = img?.naturalWidth ?? img?.width ?? 540;
      const h = img?.naturalHeight ?? img?.height ?? 3596;
      return { w, h };
    });
  }, [textures]);

  const layout = useMemo(() => {
    const count = STRIP_PATHS.length;
    const stripW = stripDims[0]?.w ?? 540;
    const gap = resolveSpaceGap(wrapperRef.current);
    const theta = THREE.MathUtils.degToRad(ROTATION_DEG);
    const cosT = Math.cos(theta);
    const fitStripW = (size.width * cosT - (count - 1) * gap) / count;
    const scaledStripW = fitStripW * 1.43;
    const baseScale = scaledStripW / stripW;
    const spacing = (scaledStripW + gap) / cosT;
    return { spacing, baseScale };
  }, [size.width, stripDims, wrapperRef]);

  useLayoutEffect(() => {
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      const offset = size.height * 0.25;
      const theta = THREE.MathUtils.degToRad(ROTATION_DEG);
      const axisX = -Math.sin(theta);
      const axisY = Math.cos(theta);
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
        onUpdate: () => invalidate(),
      });

      meshRefs.current.forEach((mesh, i) => {
        if (!mesh) return;
        const baseX = (i - (STRIP_PATHS.length - 1) / 2) * layout.spacing;
        const dir = i % 2 === 0 ? 1 : -1;
        mesh.position.x = baseX + offset * dir * axisX;
        mesh.position.y = offset * dir * axisY;
        tl.to(
          mesh.position,
          {
            x: baseX - offset * dir * axisX,
            y: -offset * dir * axisY,
            ease: "none",
            duration: 1,
          },
          0,
        );
      });

      invalidate();
    }, wrapperRef);

    return () => ctx.revert();
  }, [size.width, size.height, layout, invalidate, wrapperRef]);

  return (
    <group ref={groupRef}>
      {textures.map((tex, i) => {
        const { w, h } = stripDims[i];
        const x = (i - (STRIP_PATHS.length - 1) / 2) * layout.spacing;
        return (
          <mesh
            key={STRIP_PATHS[i]}
            ref={(el) => (meshRefs.current[i] = el)}
            position={[x, 0, 0]}
            rotation={[0, 0, THREE.MathUtils.degToRad(ROTATION_DEG)]}
            scale={[layout.baseScale, layout.baseScale, 1]}
          >
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial map={tex} transparent />
          </mesh>
        );
      })}
    </group>
  );
}

export default function MoneyMeStripCanvas() {
  const wrapperRef = useRef(null);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "3840 / 2160",
        maxHeight: "var(--site--viewport-min-height-supporting)",
        background: BG_HEX,
        overflow: "hidden",
      }}
      data-film-plane-target="true"
    >
      <Canvas
        orthographic
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ zoom: 1, position: [0, 0, 10], near: 0.1, far: 1000 }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        gl={{ alpha: true }}
      >
        <color attach="background" args={[BG_HEX]} />
        <Strips wrapperRef={wrapperRef} />
      </Canvas>
    </div>
  );
}
