import React, { useMemo, useRef, useEffect, useState } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { isWebGPURenderer } from "./createWebGPURenderer.js";
import { logWebGPUOnce } from "../../lib/webgpu/debugWebGPU.js";
import { getCssSwatchDarkHex } from "../../lib/cssSwatchDark.js";
import { useControls, folder } from "leva";

export const ARCHIVE_DEFAULTS = {
  dictionary:
    "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@",
  rows: 50,
  cubeCount: 50,
  cubeSpeed: 0.005,
  color1: "#8c1dff",
  color2: "#f223ff",
  color3: "#ff2976",
  color4: "#ff901f",
  color5: "#ffd318",
};

function createASCIITexture(dict) {
  const length = dict.length;
  const glyphSize = 72;
  const fontSize = 46;
  const baselineY = glyphSize / 2;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = length * glyphSize;
  canvas.height = glyphSize;

  ctx.fillStyle = getCssSwatchDarkHex();
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${fontSize}px Menlo`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < length; i++) {
    if (i > 50) {
      for (let j = 0; j < 3; j++) {
        ctx.filter = `blur(${j * 3}px)`;
        ctx.fillText(dict[i], glyphSize / 2 + i * glyphSize, baselineY);
      }
    }
    ctx.filter = "none";
    ctx.fillText(dict[i], glyphSize / 2 + i * glyphSize, baselineY);
  }

  const asciiTexture = new THREE.CanvasTexture(canvas);
  asciiTexture.minFilter = THREE.NearestFilter;
  asciiTexture.magFilter = THREE.NearestFilter;
  asciiTexture.generateMipmaps = false;
  asciiTexture.needsUpdate = true;
  return asciiTexture;
}

function WebGPUArchiveNodes({ renderTarget, asciiTexture, customLength, colors, rows }) {
  const meshRef = useRef(null);
  const [ready, setReady] = useState(false);
  const systemRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function build() {
      logWebGPUOnce("archive-webgpu", "Archive", "Building WebGPU TSL ascii nodes");
      const tsl = await import("three/tsl");
      const { MeshBasicNodeMaterial } = await import("three/webgpu");
      if (cancelled) return;

      const {
        Fn,
        color,
        float,
        positionLocal,
        step,
        uniform,
        vec2,
        uv,
        texture,
        attribute,
        clamp,
        pow,
        length,
        mix,
        floor,
        cos,
        sin,
        atan,
      } = tsl;

      const uColor1 = uniform(color(colors.color1));
      const uColor2 = uniform(color(colors.color2));
      const uColor3 = uniform(color(colors.color3));
      const uColor4 = uniform(color(colors.color4));
      const uColor5 = uniform(color(colors.color5));
      const uCubesTexture = renderTarget.texture;

      const positionMath = Fn(() => {
        let theta = atan(attribute("aPosition").y, attribute("aPosition").x);
        const radius = pow(length(attribute("aPosition")), 0.9);
        const pos = tsl.vec3(radius.mul(cos(theta)), radius.mul(sin(theta)), 0);

        return positionLocal.add(pos);
      });

      const asciiCodeFn = Fn(() => {
        const textureColor = texture(uCubesTexture, attribute("aPixelUV"));
        const brightness = clamp(
          pow(textureColor.r, 1.2).add(attribute("aRandom").mul(0.02)),
          float(0.0),
          float(0.99),
        );
        const glyphInset = float(0.12);
        const asciiUV = vec2(
          mix(glyphInset, float(1.0).sub(glyphInset), uv().x)
            .div(customLength)
            .add(floor(brightness.mul(customLength)).div(customLength)),
          mix(glyphInset, float(1.0).sub(glyphInset), uv().y),
        );

        const asciiCode = texture(asciiTexture, asciiUV);
        let finalColor = uColor1;
        finalColor = mix(finalColor, uColor2, step(0.2, brightness));
        finalColor = mix(finalColor, uColor3, step(0.4, brightness));
        finalColor = mix(finalColor, uColor4, step(0.6, brightness));
        finalColor = mix(finalColor, uColor5, step(0.8, brightness));

        return asciiCode.mul(finalColor);
      });

      const mat = new MeshBasicNodeMaterial({
        wireframe: true,
      });

      mat.positionNode = positionMath();
      mat.colorNode = asciiCodeFn();

      if (cancelled) return;

      systemRef.current = {
        material: mat,
        uniforms: { uColor1, uColor2, uColor3, uColor4, uColor5 },
      };
      setReady(true);
    }

    build();

    return () => {
      cancelled = true;
      if (systemRef.current) {
        systemRef.current.material.dispose();
        systemRef.current = null;
      }
      setReady(false);
    };
  }, [renderTarget, asciiTexture, customLength]);

  useFrame(() => {
    if (systemRef.current) {
      systemRef.current.uniforms.uColor1.value.set(colors.color1);
      systemRef.current.uniforms.uColor2.value.set(colors.color2);
      systemRef.current.uniforms.uColor3.value.set(colors.color3);
      systemRef.current.uniforms.uColor4.value.set(colors.color4);
      systemRef.current.uniforms.uColor5.value.set(colors.color5);
    }
  });

  const instances = Math.floor(rows) * Math.floor(rows);
  const size = 0.1;

  const positions = useMemo(() => new Float32Array(instances * 3), [instances]);
  const aPixelUV = useMemo(() => new Float32Array(instances * 2), [instances]);
  const aRandom = useMemo(() => new Float32Array(instances), [instances]);

  useEffect(() => {
    let index = 0;
    const columns = Math.floor(rows);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        index = i * columns + j;
        aPixelUV[index * 2] = i / (rows - 1);
        aPixelUV[index * 2 + 1] = j / (columns - 1);
        aRandom[index] = Math.pow(Math.random(), 4);

        positions[index * 3] = i * size - (size * (rows - 1)) / 2;
        positions[index * 3 + 1] = j * size - (size * (columns - 1)) / 2;
        positions[index * 3 + 2] = 0;
      }
    }

    if (meshRef.current) {
      meshRef.current.geometry.attributes.aPosition.needsUpdate = true;
      meshRef.current.geometry.attributes.aPixelUV.needsUpdate = true;
      meshRef.current.geometry.attributes.aRandom.needsUpdate = true;
    }
  }, [rows, instances, positions, aPixelUV, aRandom]);

  if (!ready) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, systemRef.current?.material, instances]}>
      <planeGeometry args={[size, size, 1, 1]}>
        <instancedBufferAttribute attach="attributes-aPosition" args={[positions, 3]} />
        <instancedBufferAttribute attach="attributes-aPixelUV" args={[aPixelUV, 2]} />
        <instancedBufferAttribute attach="attributes-aRandom" args={[aRandom, 1]} />
      </planeGeometry>
    </instancedMesh>
  );
}

/** WebGL: show offscreen cube pass as a screen-filling plane (no ASCII instancing). */
function WebGLArchiveFallback({ renderTarget }) {
  const { camera, size } = useThree();
  const [planeW, planeH] = useMemo(() => {
    const vFov = (camera.fov * Math.PI) / 180;
    const dist = Math.max(camera.position.length(), 0.01);
    const h = 2 * Math.tan(vFov / 2) * dist * 1.08;
    const w = h * (size.width / Math.max(size.height, 1));
    return [w, h];
  }, [
    camera.fov,
    camera.position.x,
    camera.position.y,
    camera.position.z,
    size.width,
    size.height,
  ]);

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[planeW, planeH]} />
      <meshBasicMaterial map={renderTarget.texture} toneMapped={false} />
    </mesh>
  );
}

export function ArchiveSceneCore({
  dictionary,
  rows,
  cubeCount,
  cubeSpeed,
  color1,
  color2,
  color3,
  color4,
  color5,
}) {
  const { gl, size } = useThree();
  const webgpu = isWebGPURenderer(gl);

  const asciiTexture = useMemo(() => {
    if (!webgpu) return null;
    return createASCIITexture(dictionary);
  }, [webgpu, dictionary]);

  useEffect(() => {
    return () => {
      asciiTexture?.dispose();
    };
  }, [asciiTexture]);

  const renderTarget = useMemo(
    () =>
      new THREE.RenderTarget(size.width, size.height, {
        samples: 0,
      }),
    [size.width, size.height],
  );

  useEffect(() => {
    return () => {
      renderTarget.dispose();
    };
  }, [renderTarget]);

  const fboScene = useMemo(() => {
    const s = new THREE.Scene();
    s.background = new THREE.Color(getCssSwatchDarkHex());
    return s;
  }, []);

  const fboCamera = useMemo(() => {
    const cam = new THREE.PerspectiveCamera(70, size.width / size.height, 0.01, 1000);
    cam.position.set(0, 0, 5.8);
    return cam;
  }, [size.width, size.height]);

  useEffect(() => {
    const ambient = new THREE.AmbientLight(0xffffff, 0.05);
    const directional = new THREE.DirectionalLight(0xffffff, 2.5);
    directional.position.set(1, 0, 0.866);
    fboScene.add(ambient, directional);
    return () => {
      fboScene.remove(ambient, directional);
      ambient.dispose();
      directional.dispose();
    };
  }, [fboScene]);

  const cubesRef = useRef([]);

  useEffect(() => {
    cubesRef.current = Array.from({ length: cubeCount }, () => undefined);
  }, [cubeCount]);

  const cubePayload = useMemo(() => {
    const range = (min, max) => Math.random() * (max - min) + min;
    const material = new THREE.MeshPhysicalMaterial({ color: 0xffffff });
    const meshes = [];
    for (let i = 0; i < cubeCount; i++) {
      const sizeBox = range(0.5, 0.9);
      const pos = [range(-3, 3), range(-3, 3), range(-3, 3)];
      const rot = [range(0, Math.PI), range(0, Math.PI), range(0, Math.PI)];
      const geom = new THREE.BoxGeometry(sizeBox, sizeBox, sizeBox);
      meshes.push({ geom, pos, rot, key: i });
    }
    return { material, meshes };
  }, [cubeCount]);

  useEffect(() => {
    return () => {
      for (const m of cubePayload.meshes) {
        m.geom.dispose();
      }
      cubePayload.material.dispose();
    };
  }, [cubePayload]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    cubesRef.current.forEach((cube, i) => {
      if (!cube) return;
      cube.rotation.x = Math.sin(time * cubeSpeed * 100 * cube.position.x);
      cube.rotation.y = Math.sin(time * cubeSpeed * 100 * cube.position.y);
      cube.rotation.z = Math.sin(time * cubeSpeed * 100 * cube.position.z);
      cube.position.y = 3 * Math.sin(time * cubeSpeed * 100 + i);
    });

    gl.setRenderTarget(renderTarget);
    gl.render(fboScene, fboCamera);
    gl.setRenderTarget(null);
  });

  const swatchDark = getCssSwatchDarkHex();
  const colors = { color1, color2, color3, color4, color5 };

  const portalMeshes = cubePayload.meshes.map((m, i) => (
    <mesh
      key={m.key}
      geometry={m.geom}
      material={cubePayload.material}
      position={m.pos}
      rotation={m.rot}
      ref={(el) => {
        cubesRef.current[i] = el;
      }}
    />
  ));

  return (
    <>
      <color attach="background" args={[swatchDark]} />
      {createPortal(portalMeshes, fboScene)}
      {webgpu && asciiTexture ? (
        <WebGPUArchiveNodes
          renderTarget={renderTarget}
          asciiTexture={asciiTexture}
          customLength={dictionary.length}
          rows={rows}
          colors={colors}
        />
      ) : (
        <WebGLArchiveFallback renderTarget={renderTarget} />
      )}
    </>
  );
}

function ArchiveSceneWithLeva() {
  const { dictionary, rows, cubeCount, cubeSpeed, color1, color2, color3, color4, color5 } =
    useControls("ASCII Settings", {
      dictionary: ARCHIVE_DEFAULTS.dictionary,
      rows: { value: ARCHIVE_DEFAULTS.rows, min: 10, max: 200, step: 1 },
      scene: folder({
        cubeCount: { value: ARCHIVE_DEFAULTS.cubeCount, min: 1, max: 200, step: 1 },
        cubeSpeed: { value: ARCHIVE_DEFAULTS.cubeSpeed, min: 0.001, max: 0.05, step: 0.001 },
      }),
      colors: folder({
        color1: ARCHIVE_DEFAULTS.color1,
        color2: ARCHIVE_DEFAULTS.color2,
        color3: ARCHIVE_DEFAULTS.color3,
        color4: ARCHIVE_DEFAULTS.color4,
        color5: ARCHIVE_DEFAULTS.color5,
      }),
    });

  return (
    <ArchiveSceneCore
      dictionary={dictionary}
      rows={rows}
      cubeCount={cubeCount}
      cubeSpeed={cubeSpeed}
      color1={color1}
      color2={color2}
      color3={color3}
      color4={color4}
      color5={color5}
    />
  );
}

export default function ArchiveScene() {
  if (import.meta.env.DEV) {
    return <ArchiveSceneWithLeva />;
  }
  return <ArchiveSceneCore {...ARCHIVE_DEFAULTS} />;
}
