import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { configureTexture, loadTextureAsset } from "../lib/assets";
import { updateScreenClipRect } from "../lib/screenClip";
import { useWebglStore } from "../store/webgl";
import { ROTATION_DEG, STRIP_ITEMS, STRIP_PATHS } from "./moneyMeStrips/config";
export { MONEY_ME_STRIPS_BG, STRIP_PATHS } from "./moneyMeStrips/config";
import {
  computeStripLayout,
  getStripDimsFromTextures,
  resolveSpaceGap,
} from "./moneyMeStrips/layout";
import {
  buildBackdropMaterial,
  buildStripMaterial,
  type ScreenClipRef,
} from "./moneyMeStrips/materials";
import { setupStripScrollMotion } from "./moneyMeStrips/scrollMotion";

type FrameSize = { width: number; height: number };

function MoneyMeStripsContent({ anchor }: { anchor: HTMLElement }) {
  const { gl, size } = useThree();
  const activePage = useWebglStore((s) => s.activePage);
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const backdropRef = useRef<THREE.Mesh>(null);
  const [textures, setTextures] = useState<THREE.Texture[]>([]);
  const [materials, setMaterials] = useState<THREE.Material[]>([]);
  const [backdropMaterial, setBackdropMaterial] = useState<THREE.Material | null>(null);
  const [frameSize, setFrameSize] = useState<FrameSize>({ width: 0, height: 0 });

  const clipRef = useRef<ScreenClipRef | null>(null);
  if (!clipRef.current) {
    const vec = new THREE.Vector4();
    clipRef.current = { vec, uniform: { value: vec } };
  }

  useEffect(() => {
    const update = () => {
      const rect = anchor.getBoundingClientRect();
      setFrameSize({ width: rect.width, height: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(anchor);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [anchor]);

  useEffect(() => {
    let cancelled = false;
    const clip = clipRef.current!;

    async function load() {
      const texs = await Promise.all(
        STRIP_PATHS.map((url) =>
          loadTextureAsset(url, {
            renderer: gl,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            generateMipmaps: false,
            anisotropy: 4,
          }),
        ),
      );

      if (cancelled) {
        texs.forEach((t) => t.dispose());
        return;
      }

      texs.forEach((t) => {
        configureTexture(t, {
          colorSpace: THREE.SRGBColorSpace,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          generateMipmaps: false,
          anisotropy: 4,
        });
      });

      const [mats, backdrop] = await Promise.all([
        Promise.all(
          texs.map((tex, i) => buildStripMaterial(gl, tex, clip, STRIP_ITEMS[i]?.opacity ?? 1)),
        ),
        buildBackdropMaterial(gl, clip),
      ]);

      if (cancelled) {
        texs.forEach((t) => t.dispose());
        mats.forEach((m) => m.dispose?.());
        backdrop.dispose?.();
        return;
      }

      setTextures(texs);
      setMaterials(mats);
      setBackdropMaterial(backdrop);
    }

    void load();

    return () => {
      cancelled = true;
      setTextures((prev) => {
        prev.forEach((t) => t.dispose());
        return [];
      });
      setMaterials((prev) => {
        prev.forEach((m) => m.dispose?.());
        return [];
      });
      setBackdropMaterial((prev) => {
        prev?.dispose?.();
        return null;
      });
    };
  }, [gl]);

  const stripDims = useMemo(() => getStripDimsFromTextures(textures), [textures]);

  const layout = useMemo(
    () =>
      computeStripLayout({
        frameWidth: frameSize.width,
        frameHeight: frameSize.height,
        stripDims,
        gap: resolveSpaceGap(anchor),
      }),
    [frameSize.width, frameSize.height, stripDims, anchor],
  );

  useFrame(() => {
    if (activePage !== "projectDetail") return;

    const group = groupRef.current;
    if (!group) return;

    const rect = anchor.getBoundingClientRect();
    const visible = rect.width > 0 && rect.height > 0;
    group.visible = visible;
    if (!visible) return;

    updateScreenClipRect(gl, rect, clipRef.current!.vec);

    const viewportW = size.width;
    const viewportH = size.height;
    const x = rect.left - viewportW / 2 + rect.width / 2;
    const y = -rect.top + viewportH / 2 - rect.height / 2;
    group.position.set(x, y + layout.centerYOffset, 1);

    const backdrop = backdropRef.current;
    if (backdrop) {
      backdrop.scale.set(rect.width, rect.height, 1);
    }
  });

  useLayoutEffect(() => {
    if (!textures.length || !frameSize.width) return;

    const ctx = setupStripScrollMotion({
      anchor,
      meshes: meshRefs.current,
      layout,
      frameHeight: frameSize.height,
      viewportHeight: size.height,
    });

    return () => ctx.revert();
  }, [
    anchor,
    textures.length,
    frameSize.width,
    frameSize.height,
    layout.spacing,
    layout.baseScale,
    size.height,
  ]);

  if (!textures.length || materials.length !== STRIP_PATHS.length || !backdropMaterial) {
    return null;
  }

  return (
    <group ref={groupRef} renderOrder={4}>
      <mesh ref={backdropRef} position={[0, 0, -0.5]} renderOrder={3}>
        <planeGeometry args={[1, 1]} />
        <primitive object={backdropMaterial} attach="material" />
      </mesh>
      {textures.map((tex, i) => {
        const { w, h } = stripDims[i];
        const placement = layout.placements[i];
        return (
          <mesh
            key={STRIP_PATHS[i]}
            ref={(el) => {
              meshRefs.current[i] = el;
            }}
            position={[placement.x, placement.y, placement.z]}
            rotation={[0, 0, THREE.MathUtils.degToRad(ROTATION_DEG)]}
            scale={[layout.baseScale, layout.baseScale, 1]}
            renderOrder={4 + i}
          >
            <planeGeometry args={[w, h]} />
            <primitive object={materials[i]} attach="material" />
          </mesh>
        );
      })}
    </group>
  );
}

export default function MoneyMeStrips() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const sync = () => {
      setAnchor(document.querySelector('[data-money-me-strips="true"]'));
    };
    const frameId = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frameId);
  }, []);

  if (!anchor) return null;
  return <MoneyMeStripsContent anchor={anchor} />;
}

/**
 * Transparent DOM slot synced to the unified `#background` canvas via
 * `data-money-me-strips`. The gray frame + strips are drawn on the canvas
 * (which sits behind the page at z-index:-10), so this slot stays transparent
 * to let them show through.
 */
export function MoneyMeStripsPlaceholder() {
  return <div data-money-me-strips="true" className="money-me-strips-anchor" aria-hidden="true" />;
}
