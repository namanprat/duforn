// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { configureTexture, createColorFallbackTexture } from "../../lib/assets";
import { buildSpiralTileLayouts, getSpiralHeight } from "./buildSpiralLayout";
import { SPIRAL_CONFIG, SPIRAL_IMAGE_COUNT, SPIRAL_URLS } from "./spiralConfig";
import { buildSpiralTileMaterial, spiralClipVec } from "./spiralMaterials";
import { updateScreenClipRect } from "../../lib/screenClip";

function AboutSpiralGallery({ scroll }) {
  const { gl, camera, size } = useThree();
  const groupRef = useRef(null);
  const spinVelocityRef = useRef(0);
  const cameraYRef = useRef(0);
  const texturesRef = useRef([]);
  const systemsRef = useRef([]);
  const layoutsRef = useRef(null);
  const [ready, setReady] = useState(false);

  if (!layoutsRef.current) {
    layoutsRef.current = buildSpiralTileLayouts();
  }
  const layouts = layoutsRef.current;

  const spiralHeight = getSpiralHeight();

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    const tileLayouts = layoutsRef.current;

    async function run() {
      const texs = await Promise.all(
        SPIRAL_URLS.map(
          (url) =>
            new Promise((resolve) => {
              loader.load(
                url,
                (tex) => {
                  resolve(
                    configureTexture(tex, {
                      colorSpace: THREE.SRGBColorSpace,
                      renderer: gl,
                      anisotropy: gl.capabilities?.getMaxAnisotropy?.() ?? 1,
                    }),
                  );
                },
                undefined,
                () => resolve(createColorFallbackTexture()),
              );
            }),
        ),
      );

      if (cancelled) {
        texs.forEach((t) => t?.dispose?.());
        return;
      }

      texturesRef.current = texs;

      const systems = await Promise.all(
        tileLayouts.map((layout) =>
          buildSpiralTileMaterial(gl, texs[layout.textureIndex % SPIRAL_IMAGE_COUNT]),
        ),
      );

      if (cancelled) {
        systems.forEach((s) => s.dispose());
        texs.forEach((t) => t?.dispose?.());
        return;
      }

      systemsRef.current = systems;
      setReady(true);
    }

    void run();

    return () => {
      cancelled = true;
      systemsRef.current.forEach((s) => s.dispose());
      systemsRef.current = [];
      texturesRef.current.forEach((t) => t?.dispose?.());
      texturesRef.current = [];
      setReady(false);
    };
  }, [gl]);

  useEffect(() => {
    return () => {
      layoutsRef.current?.forEach((l) => l.geometry.dispose());
      layoutsRef.current = null;
    };
  }, []);

  useFrame(() => {
    const group = groupRef.current;
    if (!group || !ready) return;

    const heroProgress = scroll.heroProgressRef.current;
    const velocity = scroll.velocityRef.current;

    spinVelocityRef.current += velocity * SPIRAL_CONFIG.scrollRotationMultiplier;
    group.rotation.y += SPIRAL_CONFIG.baseRotationSpeed + spinVelocityRef.current;
    spinVelocityRef.current *= SPIRAL_CONFIG.rotationDecay;

    const targetCameraY = -(heroProgress * spiralHeight * SPIRAL_CONFIG.cameraYMultiplier);
    cameraYRef.current += (targetCameraY - cameraYRef.current) * SPIRAL_CONFIG.cameraSmoothing;
    camera.position.y = cameraYRef.current;
    camera.position.z = SPIRAL_CONFIG.cameraZ;
    camera.lookAt(0, cameraYRef.current, 0);
    camera.updateProjectionMatrix();

    const scale = Math.max(0.78, Math.min(1, size.width / 1400));
    group.scale.setScalar(scale);

    systemsRef.current.forEach((system) => {
      if (system.uniforms.uCameraPosition?.value?.copy) {
        system.uniforms.uCameraPosition.value.copy(camera.position);
      }
    });

    const heroEl = document.querySelector('[data-about-section="hero"]');
    if (heroEl) {
      updateScreenClipRect(gl, heroEl.getBoundingClientRect(), spiralClipVec);
    } else {
      spiralClipVec.set(0, 0, 0, 0);
    }
  });

  if (!ready) return null;

  return (
    <group ref={groupRef}>
      {layouts.map((layout, i) => {
        const system = systemsRef.current[i];
        if (!system) return null;
        return (
          <group key={i} rotation={[0, layout.tileRotationY, 0]}>
            <mesh
              geometry={layout.geometry}
              material={system.material}
              position={[0, layout.meshPositionY, 0]}
            />
          </group>
        );
      })}
    </group>
  );
}

export default AboutSpiralGallery;
