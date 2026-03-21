import React, { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { isWebGPURenderer } from "../components/webgl/createWebGPURenderer.js";
import { logWebGPUOnce } from "../lib/webgpu/debugWebGPU.js";

function createBayerTexture() {
  const bayerData = new Uint8Array([
    0,0,0,255,   128,128,128,255, 32,32,32,255,   160,160,160,255,
    192,192,192,255, 64,64,64,255,   224,224,224,255,  96,96,96,255,
    48,48,48,255,  176,176,176,255, 16,16,16,255,   144,144,144,255,
    240,240,240,255, 112,112,112,255, 208,208,208,255,  80,80,80,255
  ]);
  const tex = new THREE.DataTexture(bayerData, 4, 4, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

const SHADER_UTILS = `
  vec4 permute(vec4 x){return mod(x*x*34.+x,289.);}
  float snoise(vec3 v){
    const vec2 C = 1./vec2(6,3);
    const vec4 D = vec4(0,.5,1,2);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1. - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.x;
    vec3 x2 = x0 - i2 + C.y;
    vec3 x3 = x0 - D.yyy;
    i = mod(i,289.);
    vec4 p = permute( permute( permute(
      i.z + vec4(0., i1.z, i2.z, 1.))
      + i.y + vec4(0., i1.y, i2.y, 1.))
      + i.x + vec4(0., i1.x, i2.x, 1.));
    vec3 ns = .142857142857 * D.wyz - D.xzx;
    vec4 j = p - 49. * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = floor(j - 7. * x_ ) *ns.x + ns.yyyy;
    vec4 h = 1. - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 sh = -step(h, vec4(0));
    vec4 a0 = b0.xzyw + (floor(b0)*2.+ 1.).xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + (floor(b1)*2.+ 1.).xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = inversesqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.);
    return .5 + 12. * dot( m * m * m, vec4( dot(p0,x0), dot(p1,x1),dot(p2,x2), dot(p3,x3) ) );
  }

  vec3 snoiseVec3( vec3 x ){
    return vec3(  snoise(vec3( x )*2.-1.),
                  snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ))*2.-1.,
                  snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 )*2.-1.)
    );
  }

  vec3 curlNoise( vec3 p ){
    const float e = .1;
    vec3 dx = vec3( e   , 0.0 , 0.0 );
    vec3 dy = vec3( 0.0 , e   , 0.0 );
    vec3 dz = vec3( 0.0 , 0.0 , e   );

    vec3 p_x0 = snoiseVec3( p - dx );
    vec3 p_x1 = snoiseVec3( p + dx );
    vec3 p_y0 = snoiseVec3( p - dy );
    vec3 p_y1 = snoiseVec3( p + dy );
    vec3 p_z0 = snoiseVec3( p - dz );
    vec3 p_z1 = snoiseVec3( p + dz );

    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
    float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
    float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

    const float divisor = 1.0 / ( 2.0 * e );
    return normalize( vec3( x , y , z ) * divisor );
  }
`;

function createWebGLSimMaterial() {
  return new THREE.ShaderMaterial({
    depthWrite: false, depthTest: false,
    uniforms: {
      uMap: { value: null },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uTime: { value: 0 },
      uDt: { value: 0.016 },
      uSpeed: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform vec2 uPointer;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform float uDt;
      uniform float uSpeed;
      varying vec2 vUv;

      ${SHADER_UTILS}

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;

        vec2 uv2 = uv + curlNoise(vec3(uv * 4. + uTime * 0.1, uTime * 0.1)).xy * uDt * 0.3;
        vec2 uv1 = uv + curlNoise(vec3(uv * 2. + uTime * 0.1, uTime * 0.1)).xy * uDt * 0.15;

        vec3 mapColor = texture2D(uMap, uv1).rgb;
        vec3 mapColor2 = texture2D(uMap, uv2).rgb;

        vec2 centeredUV = vUv - 0.5;
        centeredUV.x *= uResolution.x / max(uResolution.y, 1.0);
        vec2 pointer = uPointer * 0.5 * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);

        float d = distance(centeredUV, pointer);

        vec3 color = mix(mapColor, mapColor2, 0.5);
        color = mix(color, vec3(1.0), uDt * 2.0);

        float speed = clamp(uSpeed * 2.0, 0.075, 0.25);
        float t = smoothstep(speed, 0.0, d);
        float t2 = pow(t, 10.0);
        float t3 = pow(t, 4.0);
        float scale = speed * 5.0;
        t *= scale; t2 *= scale; t3 *= scale;

        // Grayscale fluid colors (white-ish)
        color = mix(color, vec3(0.28), t);
        color = mix(color, vec3(0.62), t3);
        color = mix(color, vec3(1.0), t2);

        color = clamp(color, 0.0, 1.0);
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}

function createWebGLDisplayMaterial(bayerTex) {
  return new THREE.ShaderMaterial({
    depthWrite: false, depthTest: false,
    uniforms: {
      uDisplay: { value: null },
      uBayer: { value: bayerTex },
      uColorBack: { value: new THREE.Color(0.88, 0.88, 0.88) },
      uColorFront: { value: new THREE.Color(0.97, 0.97, 0.97) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uDisplay;
      uniform sampler2D uBayer;
      uniform vec3 uColorBack;
      uniform vec3 uColorFront;
      varying vec2 vUv;

      void main() {
        float simVal = texture2D(uDisplay, vUv).r;
        float bayer = texture2D(uBayer, gl_FragCoord.xy / 4.0).r;
        
        float mask = step(bayer, simVal);
        vec3 color = mix(uColorBack, uColorFront, mask);
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}


export default function FilmBackground() {
  const { gl } = useThree();
  const systemRef = useRef(null);
  const mouseTargetRef = useRef(new THREE.Vector2(0, 0));
  const [displayMaterial, setDisplayMaterial] = useState(null);

  const bayerTexture = useMemo(() => createBayerTexture(), []);

  useEffect(() => {
    const onMouseMove = (e) => {
      mouseTargetRef.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1)
      );
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function buildWebGPUBackground() {
      logWebGPUOnce("film-background-webgpu", "FilmBackground", "Building WebGPU TSL Dithered Fluid background");
      const { MeshBasicNodeMaterial, RenderTarget } = await import("three/webgpu");
      const tsl = await import("three/tsl");
      const {
        Fn, float, vec2, vec3, vec4, uniform, uniformTexture, texture, mix, clamp, smoothstep, pow, normalize, mx_noise_float, step, screenCoordinate, uv
      } = tsl;

      if (cancelled) return;

      const w = gl.domElement.width;
      const h = gl.domElement.height;

      const makeRT = (rw, rh) =>
        new RenderTarget(rw, rh, {
          magFilter: THREE.LinearFilter,
          minFilter: THREE.LinearFilter,
          generateMipmaps: false,
          type: THREE.HalfFloatType,
          format: THREE.RGBAFormat,
          depthBuffer: false,
          stencilBuffer: false,
        });

      const rt0 = makeRT(w, h);
      const rt1 = makeRT(w, h);

      // Clear RTs
      const prevColor = new THREE.Color();
      const prevAlpha = gl.getClearAlpha();
      gl.getClearColor(prevColor);
      gl.setClearColor(0xffffff, 1.0);
      const prevAutoClear = gl.autoClear;
      gl.autoClear = true;
      for (const rt of [rt0, rt1]) {
        gl.setRenderTarget(rt);
        gl.clear();
      }
      gl.setRenderTarget(null);
      gl.setClearColor(prevColor, prevAlpha);
      gl.autoClear = prevAutoClear;

      const uMap = uniformTexture(rt0.texture);
      const uDisplay = uniformTexture(rt0.texture);
      
      const uPointer = uniform(new THREE.Vector2(0, 0));
      const uDt = uniform(0.016);
      const uSpeed = uniform(0);
      const uTime = uniform(0);
      const uResolution = uniform(new THREE.Vector2(w, h));
      
      const uColorBack = uniform(vec3(0.88, 0.88, 0.88));
      const uColorFront = uniform(vec3(0.97, 0.97, 0.97));
      const uBayerTex = uniformTexture(bayerTexture);

      const curlFn = Fn(([uvPos, freq, t]) => {
        const e = float(0.1);
        const seed = vec3(uvPos.mul(freq), t);
        const fyp = mx_noise_float(seed.add(vec3(0, e, 0)));
        const fyn = mx_noise_float(seed.sub(vec3(0, e, 0)));
        const fxp = mx_noise_float(seed.add(vec3(e, 0, 0)));
        const fxn = mx_noise_float(seed.sub(vec3(e, 0, 0)));
        return normalize(vec2(fyp.sub(fyn), fxn.sub(fxp)));
      }).setLayout({
        name: "curlFn", type: "vec2", inputs: [
          { name: "uvPos", type: "vec2" },
          { name: "freq", type: "float" },
          { name: "t", type: "float" },
        ],
      });

      const simFragFn = Fn(() => {
        const uvCoord = uv();
        const curl1 = curlFn(uvCoord, float(4.0), uTime.mul(0.1));
        const curl2 = curlFn(uvCoord, float(2.0), uTime.mul(0.1));
        const uv1 = uvCoord.add(curl1.mul(uDt).mul(0.3));
        const uv2 = uvCoord.add(curl2.mul(uDt).mul(0.15));

        const mapCol1 = texture(uMap, uv1).rgb;
        const mapCol2 = texture(uMap, uv2).rgb;
        const col = mix(mapCol1, mapCol2, 0.5).toVar();

        col.assign(mix(col, vec3(1.0), uDt.mul(2.0)));

        const aspect = uResolution.x.div(uResolution.y);
        const centeredUV = uvCoord.sub(0.5).mul(vec2(aspect.mul(2.0), 2.0)).toVar();
        const pointer = uPointer.mul(vec2(aspect, 1.0)).toVar();
        const d = centeredUV.sub(pointer).length();

        const speed = clamp(uSpeed.mul(2.0), float(0.075), float(0.25));
        const t = smoothstep(speed, float(0), d).mul(speed.mul(5.0));
        const t2 = pow(smoothstep(speed, float(0), d), float(10.0)).mul(speed.mul(5.0));
        const t3 = pow(smoothstep(speed, float(0), d), float(4.0)).mul(speed.mul(5.0));

        col.assign(mix(col, vec3(0.28), t));
        col.assign(mix(col, vec3(0.62), t3));
        col.assign(mix(col, vec3(1.0), t2));

        return vec4(clamp(col, vec3(0.0), vec3(1.0)), 1.0);
      });

      const simMat = new MeshBasicNodeMaterial({ depthWrite: false, depthTest: false });
      simMat.fragmentNode = simFragFn();

      const displayMat = new MeshBasicNodeMaterial({ depthWrite: false, depthTest: false });
      displayMat.fragmentNode = Fn(() => {
        const simVal = texture(uDisplay, uv()).r;
        const bCoord = screenCoordinate.xy.div(4.0);
        const bayerVal = texture(uBayerTex, bCoord).r;
        const mask = step(bayerVal, simVal);
        return vec4(mix(uColorBack, uColorFront, mask), 1.0);
      })();

      if (cancelled) {
        rt0.dispose();
        rt1.dispose();
        simMat.dispose();
        displayMat.dispose();
        return;
      }

      const simScene = new THREE.Scene();
      const simCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
      const simPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), simMat);
      simScene.add(simPlane);

      systemRef.current = {
        simScene, simCamera, simPlane, simMat, displayMat,
        rt0, rt1, readRT: rt0, writeRT: rt1,
        uMap, uDisplay, uPointer, uDt, uSpeed, uTime, uResolution
      };

      setDisplayMaterial(displayMat);
    }

    function buildWebGLBackground() {
      logWebGPUOnce("film-background-webgl", "FilmBackground", "Using WebGL Dithered Fluid background");
      
      const w = gl.domElement.width || window.innerWidth;
      const h = gl.domElement.height || window.innerHeight;

      const rt0 = new THREE.WebGLRenderTarget(w, h, {
        minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType
      });
      const rt1 = rt0.clone();

      const prevColor = new THREE.Color();
      const prevAlpha = gl.getClearAlpha();
      gl.getClearColor(prevColor);
      gl.setClearColor(0xffffff, 1.0);
      const prevAutoClear = gl.autoClear;
      gl.autoClear = true;
      for (const rt of [rt0, rt1]) {
        gl.setRenderTarget(rt); gl.clear();
      }
      gl.setRenderTarget(null);
      gl.setClearColor(prevColor, prevAlpha);
      gl.autoClear = prevAutoClear;

      const simMat = createWebGLSimMaterial();
      const displayMat = createWebGLDisplayMaterial(bayerTexture);

      simMat.uniforms.uMap.value = rt0.texture;
      displayMat.uniforms.uDisplay.value = rt0.texture;

      const simScene = new THREE.Scene();
      const simCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
      const simPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), simMat);
      simScene.add(simPlane);

      systemRef.current = { 
        simScene, simCamera, simPlane, simMat, displayMat,
        rt0, rt1, readRT: rt0, writeRT: rt1,
        uPointer: simMat.uniforms.uPointer,
        uTime: simMat.uniforms.uTime,
        uResolution: simMat.uniforms.uResolution,
        uDt: simMat.uniforms.uDt,
        uSpeed: simMat.uniforms.uSpeed,
        uMap: simMat.uniforms.uMap,
        uDisplay: displayMat.uniforms.uDisplay
      };
      
      setDisplayMaterial(displayMat);
    }

    if (isWebGPURenderer(gl)) {
      buildWebGPUBackground();
    } else {
      buildWebGLBackground();
    }

    return () => {
      cancelled = true;
      const sys = systemRef.current;
      if (!sys) return;
      sys.rt0?.dispose();
      sys.rt1?.dispose();
      sys.simMat?.dispose();
      sys.displayMat?.dispose();
      sys.simPlane?.geometry?.dispose();
      systemRef.current = null;
    };
  }, [gl, bayerTexture]);

  useEffect(() => {
    const onResize = () => {
      const sys = systemRef.current;
      if (!sys) return;
      if (sys.uResolution?.value) {
        sys.uResolution.value.set(gl.domElement.width, gl.domElement.height);
      }
      sys.rt0?.setSize(gl.domElement.width, gl.domElement.height);
      sys.rt1?.setSize(gl.domElement.width, gl.domElement.height);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [gl]);

  useFrame((state, delta) => {
    const sys = systemRef.current;
    if (!sys) return;

    const prevSpeed = sys.uPointer.value.distanceTo(mouseTargetRef.current);
    sys.uPointer.value.lerp(mouseTargetRef.current, 0.06);
    
    if (sys.uSpeed) sys.uSpeed.value = prevSpeed * 60;
    
    if (sys.uDt) sys.uDt.value = delta;

    if (sys.uTime) {
      if (!isWebGPURenderer(gl)) {
        sys.uTime.value = state.clock.elapsedTime;
      } else {
        sys.uTime.value += delta;
      }
    }
    
    if (sys.uResolution && isWebGPURenderer(gl)) {
       sys.uResolution.value.set(gl.domElement.width, gl.domElement.height);
    }

    // Ping Pong Rendering
    if (sys.simScene && sys.writeRT) {
      const prevTarget = gl.getRenderTarget();
      const prevAutoClear = gl.autoClear;
      gl.autoClear = false;

      sys.uMap.value = sys.readRT.texture;
      gl.setRenderTarget(sys.writeRT);
      gl.render(sys.simScene, sys.simCamera);
      gl.setRenderTarget(prevTarget);
      gl.autoClear = prevAutoClear;

      const tmp = sys.readRT;
      sys.readRT = sys.writeRT;
      sys.writeRT = tmp;
      sys.uDisplay.value = sys.readRT.texture;
    }

  }, 0);

  if (!displayMaterial) return null;

  return (
    <mesh renderOrder={-1} scale={[window.innerWidth, window.innerHeight, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={displayMaterial} attach="material" />
    </mesh>
  );
}
