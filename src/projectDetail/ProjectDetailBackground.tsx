// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { usePointerField } from "./usePointerField";

function createColor(value) {
  return new THREE.Color(value);
}

async function buildBackgroundMaterial(controls) {
  const tsl = await import("three/tsl");
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const {
    Fn,
    float,
    vec2,
    vec3,
    uniform,
    uv,
    mix,
    clamp,
    smoothstep,
    length,
    max,
    sin,
    cos,
    mx_noise_float,
    dot,
    normalize,
    pow,
  } = tsl;

  const uniforms = {
    uTime: uniform(0),
    uResolution: uniform(new THREE.Vector2(1, 1)),
    uPointer: uniform(new THREE.Vector2(0, 0)),
    uVelocity: uniform(new THREE.Vector2(0, 0)),
    uSwirlStrength: uniform(controls.swirlStrength),
    uSwirlDensity: uniform(controls.swirlDensity),
    uDistortion: uniform(controls.distortion),
    uPointerInfluence: uniform(controls.pointerInfluence),
    uFadeStrength: uniform(controls.fadeStrength),
    uLargeNoiseScale: uniform(controls.largeNoiseScale),
    uMediumNoiseScale: uniform(controls.mediumNoiseScale),
    uFineNoiseScale: uniform(controls.fineNoiseScale),
    uColorOuter: uniform(createColor(controls.colorOuter)),
    uColorMid: uniform(createColor(controls.colorMid)),
    uColorCore: uniform(createColor(controls.colorCore)),
    uColorShade: uniform(createColor(controls.colorShade)),
  };

  const material = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });

  material.colorNode = Fn(() => {
    const aspect = max(uniforms.uResolution.x.div(uniforms.uResolution.y), float(1.0));
    const coord = uv()
      .sub(0.5)
      .mul(vec2(aspect, float(1.0)));
    const pointer = vec2(uniforms.uPointer.x.mul(aspect), uniforms.uPointer.y);
    const velocity = clamp(length(uniforms.uVelocity).mul(14), 0, 1);
    const pointerShift = pointer.mul(uniforms.uPointerInfluence);
    const radial = length(coord.mul(vec2(0.88, float(1.12))));
    const envelope = float(1).sub(smoothstep(float(0.18), float(1.18), radial));

    const swirl = vec2(
      sin(
        coord.y
          .mul(uniforms.uSwirlDensity)
          .add(coord.x.mul(1.8))
          .add(uniforms.uTime.mul(0.12))
          .add(radial.mul(4.2)),
      ),
      cos(
        coord.x
          .mul(uniforms.uSwirlDensity.mul(0.92))
          .sub(coord.y.mul(1.4))
          .sub(uniforms.uTime.mul(0.1))
          .sub(radial.mul(3.4)),
      ),
    ).mul(uniforms.uSwirlStrength.mul(envelope.add(float(0.2))));

    const warped = coord.add(pointerShift).add(swirl);
    const largeNoise = mx_noise_float(
      vec3(warped.mul(uniforms.uLargeNoiseScale), uniforms.uTime.mul(0.08)),
    );
    const mediumNoise = mx_noise_float(
      vec3(
        warped
          .add(vec2(largeNoise.mul(0.2), largeNoise.mul(-0.14)))
          .mul(uniforms.uMediumNoiseScale),
        uniforms.uTime.mul(0.05).add(4.2),
      ),
    );
    const fineNoise = mx_noise_float(
      vec3(
        warped.add(vec2(mediumNoise.mul(0.08), largeNoise.mul(0.08))).mul(uniforms.uFineNoiseScale),
        uniforms.uTime.mul(0.03).add(8.4),
      ),
    );

    const liquid = largeNoise.mul(0.55).add(mediumNoise.mul(0.3)).add(fineNoise.mul(0.15));
    const pulse = sin(
      warped.x
        .mul(3.6)
        .add(warped.y.mul(2.8))
        .sub(radial.mul(6.4))
        .add(uniforms.uTime.mul(0.1))
        .add(liquid.mul(2.4)),
    )
      .mul(0.5)
      .add(0.5)
      .mul(uniforms.uDistortion);
    const pointerBloom = float(1).sub(
      smoothstep(float(0.04), float(0.58), length(coord.sub(pointer.mul(0.22)))),
    );
    const height = liquid.add(envelope.mul(0.18)).add(pointerBloom.mul(0.06));
    const field = clamp(
      liquid
        .mul(0.78)
        .add(pulse.mul(0.22))
        .add(envelope.mul(uniforms.uFadeStrength))
        .add(pointerBloom.mul(0.08))
        .add(velocity.mul(0.04)),
      0,
      1,
    );
    const milky = mix(
      uniforms.uColorOuter,
      uniforms.uColorMid,
      smoothstep(float(0.08), float(0.78), field),
    );
    const core = mix(
      milky,
      uniforms.uColorCore,
      smoothstep(float(0.38), float(0.94), liquid.add(envelope.mul(0.1))),
    );

    const baseColor = mix(
      core,
      uniforms.uColorShade,
      smoothstep(float(0.6), float(1.02), liquid.add(pulse.mul(0.45))),
    );

    // Marble-ish bas-relief hint: cheap screen-space "lighting" from a pseudo heightfield gradient.
    const eps = float(0.006);
    const hC = height;
    const hX = mx_noise_float(
      vec3(warped.add(vec2(eps, 0)).mul(uniforms.uLargeNoiseScale), uniforms.uTime.mul(0.08)),
    )
      .mul(0.55)
      .add(mediumNoise.mul(0.3))
      .add(fineNoise.mul(0.15));
    const hY = mx_noise_float(
      vec3(warped.add(vec2(0, eps)).mul(uniforms.uLargeNoiseScale), uniforms.uTime.mul(0.08)),
    )
      .mul(0.55)
      .add(mediumNoise.mul(0.3))
      .add(fineNoise.mul(0.15));
    const grad = vec2(hX.sub(hC), hY.sub(hC));
    const normal = normalize(vec3(grad.x.mul(-1.9), grad.y.mul(-1.9), float(1)));
    const lightDir = normalize(vec3(0.25, 0.55, 0.95));
    const diff = clamp(dot(normal, lightDir), 0, 1);
    const viewDir = vec3(0, 0, 1);
    const halfDir = normalize(lightDir.add(viewDir));
    const spec = pow(clamp(dot(normal, halfDir), 0, 1), float(28)).mul(0.12);
    const lit = baseColor.mul(mix(float(0.9), float(1.12), diff)).add(vec3(spec));

    return lit;
  })();

  material.opacityNode = float(1);

  return { material, uniforms };
}

export default function ProjectDetailBackground({ controls }) {
  const meshRef = useRef(null);
  const systemRef = useRef(null);
  const [ready, setReady] = useState(false);
  const { gl, size } = useThree();
  const { pointerRef, velocityRef, step } = usePointerField();

  useEffect(() => {
    let cancelled = false;

    async function build() {
      const system = await buildBackgroundMaterial(controls);
      if (cancelled) {
        system.material.dispose();
        return;
      }

      systemRef.current = system;
      setReady(true);
    }

    build();

    return () => {
      cancelled = true;
      setReady(false);
      systemRef.current?.material.dispose();
      systemRef.current = null;
    };
  }, [controls, gl]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    step(dt, controls.pointerLerp);

    if (meshRef.current) {
      meshRef.current.position.set(0, 0, -25);
      meshRef.current.scale.set(size.width, size.height, 1);
    }

    const system = systemRef.current;
    if (!system) return;

    system.uniforms.uTime.value = state.clock.elapsedTime;
    system.uniforms.uResolution.value.set(size.width, size.height);
    system.uniforms.uPointer.value.copy(pointerRef.current);
    system.uniforms.uVelocity.value.copy(velocityRef.current);
  });

  if (!ready || !systemRef.current) return null;

  return (
    <mesh ref={meshRef} renderOrder={-5}>
      <planeGeometry args={[1, 1]} />
      <primitive object={systemRef.current.material} attach="material" />
    </mesh>
  );
}
