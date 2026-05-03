// @ts-nocheck
import React, { useEffect, useLayoutEffect, useRef } from "react";
import CameraRig from "./CameraRig";
import Particles from "./Particles";
import SceneExposure from "./SceneExposure";
import WorkModel from "../../models/WorkModel";
import { WorkClothStripScene } from "../../work/WorkClothStrip";
import { applyModelMaterialTuning, normalizeModelBounds } from "./sceneUtils";
import { useWorkSceneControlsStore } from "../../store/workSceneControls";

function WorkSceneBackground() {
  const background = useWorkSceneControlsStore((state) => state.controls.scene.background);

  return <color attach="background" args={[background]} />;
}

function WorkScene() {
  const modelRef = useRef(null);
  const didNormalizeRef = useRef(false);
  const didCloneMaterialsRef = useRef(false);
  const controls = useWorkSceneControlsStore((state) => state.controls);
  const { scene, model, particles, lights } = controls;

  useLayoutEffect(() => {
    const sceneModel = modelRef.current;
    if (!sceneModel || didNormalizeRef.current) return;

    normalizeModelBounds(sceneModel);
    didNormalizeRef.current = true;
  }, []);

  useEffect(() => {
    const sceneModel = modelRef.current;
    if (!sceneModel) return;

    applyModelMaterialTuning(sceneModel, {
      roughnessScale: model.roughnessScale,
      metalnessScale: model.metalnessScale,
      envReflection: model.envReflection,
      clearcoat: model.clearcoat,
      clearcoatRoughness: model.clearcoatRoughness,
      cloneStandardMaterials: !didCloneMaterialsRef.current,
    });

    didCloneMaterialsRef.current = true;
  }, [
    model.clearcoat,
    model.clearcoatRoughness,
    model.envReflection,
    model.metalnessScale,
    model.roughnessScale,
  ]);

  return (
    <>
      <fogExp2 attach="fog" color={scene.fogColor} density={scene.fogDensity} />

      <CameraRig />
      <SceneExposure exposure={scene.exposure} />
      <Particles
        count={Math.round(particles.count)}
        color={particles.color}
        size={particles.size}
        opacity={particles.opacity}
        bounds={{
          xHalf: particles.xHalf,
          yMin: particles.yMin,
          yMax: particles.yMax,
          zMin: particles.zMin,
          zMax: particles.zMax,
        }}
        motion={{
          xAmplitude: particles.xAmplitude,
          zAmplitude: particles.zAmplitude,
          xSpeed: particles.xSpeed,
          zSpeed: particles.zSpeed,
          ySpeed: particles.ySpeed,
        }}
      />

      <spotLight
        position={[lights.keyX, lights.keyY, lights.keyZ]}
        intensity={lights.keyIntensity}
        color={lights.keyColor}
        angle={lights.keyAngle}
        penumbra={lights.keyPenumbra}
        decay={lights.keyDecay}
        distance={60}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-radius={4}
      />
      <spotLight
        position={[lights.fillX, lights.fillY, lights.fillZ]}
        intensity={lights.fillIntensity}
        color={lights.fillColor}
        angle={lights.fillAngle}
        penumbra={lights.fillPenumbra}
        decay={lights.fillDecay}
        distance={60}
      />
      <pointLight
        position={[lights.pointX, lights.pointY, lights.pointZ]}
        intensity={lights.pointIntensity}
        color={lights.pointColor}
        decay={lights.pointDecay}
        distance={lights.pointDistance}
      />
      <ambientLight intensity={lights.ambientIntensity} color={lights.ambientColor} />

      <group position={[model.x, model.y, model.z]} scale={model.scale}>
        <group ref={modelRef}>
          <WorkModel />
        </group>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial transparent opacity={lights.shadowOpacity} />
      </mesh>

      <WorkClothStripScene />
    </>
  );
}

export default function WorkPageScene() {
  return (
    <>
      <WorkSceneBackground />
      <WorkScene />
    </>
  );
}
