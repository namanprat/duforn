import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { usePointerField } from "./usePointerField";
import {
  createProjectBgPipeline,
  disposeProjectBgPipeline,
  PROJECT_BG_MODEL_URL,
  tickProjectBgPipeline,
  type ProjectBgPipeline,
} from "./projectBgPipeline";
import { useWorkProjectTransitionStore } from "../store/workProjectTransition";

/** Rising project bg on the work camera during work→project bridge. */
export default function ProjectBgRiseLayer() {
  const { gl, camera, size } = useThree();
  const { scene: gltfScene } = useGLTF(PROJECT_BG_MODEL_URL);
  const { pointerRef, step } = usePointerField();
  const riseOffset = useWorkProjectTransitionStore((s) => s.riseOffset);
  const setProjectBgReady = useWorkProjectTransitionStore((s) => s.setProjectBgReady);

  const pipelineRef = useRef<ProjectBgPipeline | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const pipeline = createProjectBgPipeline(gltfScene);
    pipelineRef.current = pipeline;
    setReady(true);
    setProjectBgReady(true);

    const onPointerMove = () => {
      pipeline.pointerActive = true;
      pipeline.lastPointerMove = performance.now();
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (pipelineRef.current) {
        disposeProjectBgPipeline(pipelineRef.current);
        pipelineRef.current = null;
      }
      setReady(false);
      setProjectBgReady(false);
    };
  }, [gltfScene, setProjectBgReady]);

  useFrame((state, delta) => {
    const pipeline = pipelineRef.current;
    const group = groupRef.current;
    const mesh = meshRef.current;
    if (!ready || !pipeline || !group || !mesh) return;

    tickProjectBgPipeline(pipeline, {
      gl,
      width: size.width,
      height: size.height,
      elapsedTime: state.clock.elapsedTime,
      delta,
      pointer: pointerRef.current,
      stepPointer: step,
    });

    const mat = materialRef.current;
    if (mat && mat.map !== pipeline.renderTarget.texture) {
      mat.map = pipeline.renderTarget.texture;
      mat.needsUpdate = true;
    }

    camera.updateMatrixWorld();
    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);

    const dist = Math.abs(camera.position.z) || 10;
    const vFov = THREE.MathUtils.degToRad(
      (camera as THREE.PerspectiveCamera).fov ?? 70,
    );
    const planeH = 2 * Math.tan(vFov / 2) * dist;
    const planeW = planeH * (size.width / Math.max(size.height, 1));

    mesh.position.set(0, -riseOffset * planeH, -dist);
    mesh.scale.set(planeW, planeH, 1);
  });

  if (!ready) return null;

  return (
    <group ref={groupRef} renderOrder={-4}>
      <mesh ref={meshRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
    </group>
  );
}

useGLTF.preload(PROJECT_BG_MODEL_URL);

export function ProjectBgRiseLayerGate() {
  const mount = useWorkProjectTransitionStore(
    (s) => s.mountProjectLayer && s.direction === "toProject",
  );
  if (!mount) return null;
  return (
    <Suspense fallback={null}>
      <ProjectBgRiseLayer />
    </Suspense>
  );
}
