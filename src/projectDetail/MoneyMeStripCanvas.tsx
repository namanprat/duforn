// @ts-nocheck
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MONEY_ME_STRIPS_BG, STRIP_PATHS } from "./moneyMeStrips/config";

gsap.registerPlugin(ScrollTrigger);

const ROTATION_DEG = 30;

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
    const theta = THREE.MathUtils.degToRad(ROTATION_DEG);
    const cosT = Math.cos(theta);
    const fitStripW = (size.width * cosT) / count;
    const scaledStripW = fitStripW * 1.43;
    const baseScale = scaledStripW / stripW;
    const spacing = scaledStripW / cosT;
    return { spacing, baseScale };
  }, [size.width, stripDims]);

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
      data-money-me-strip="true"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "3840 / 2160",
        maxHeight: "var(--site--viewport-min-height-supporting)",
        background: MONEY_ME_STRIPS_BG,
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
        <color attach="background" args={[MONEY_ME_STRIPS_BG]} />
        <Strips wrapperRef={wrapperRef} />
      </Canvas>
    </div>
  );
}
