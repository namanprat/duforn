# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at [https://viteplus.dev/guide/](https://viteplus.dev/guide/).

## Review Checklist

- Run `vp install` after pulling remote changes and before getting started.
- Run `vp check` and `vp test` to format, lint, type check and test changes.
- Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.

## WebGPU-first rendering (site architecture)

The **default** path for 3D is **`WebGPURenderer`** via `createWebGPURenderer.ts` / `UnifiedCanvas.tsx`, with **classic `WebGLRenderer` only as a fallback** when WebGPU is unavailable. AI and human contributors should treat **WebGPU + TSL as the primary target** and only add WebGL-only code when the active `gl` is actually `WebGLRenderer`.

### Rules

1. **Prefer `three/webgpu` + `three/tsl`** for new GPU features: node materials (`MeshBasicNodeMaterial`, etc.), `uniform()`, `Fn()`, `pass()`, and dynamic imports of `three/tsl` / `three/webgpu` in async builders—same style as `InkTransitionOverlay.tsx`, `WorkClothStrip.tsx`, `Particles.tsx`, and `ProjectBg.tsx`.
2. **Full-screen or post-style effects on `WebGPURenderer`**: prefer an **in-scene clip-space quad** with TSL node materials (`MeshBasicNodeMaterial` + `vertexNode`/`fragmentNode`) — see **`InkTransitionOverlay.tsx`**. For multi-pass post stacks, use **`RenderPipeline`** from `three/webgpu` and **`pass(scene, camera)`** from `three/tsl`, then chain TSL display nodes (including addons under `three/addons/tsl/display/`). **Do not** use `EffectComposer` / `ShaderPass` from `three/examples/jsm/postprocessing/` on `WebGPURenderer`; those are for classic **`WebGLRenderer`** only.
3. **WebGL fallback**: when branching on `isWebGLRenderer(gl)` from `createWebGPURenderer.ts`, use `pickGpuBranch` / `pickGpuBranchAsync` from `src/lib/rendering/gpuDualPath.ts` and provide matching GLSL (`ShaderMaterial`) paths — e.g. **`ProjectBg.tsx`**, **`InkTransitionOverlay.tsx`**, **`NotFoundScene.tsx`**, **`ProjectDetailBackground.tsx`**, **`ProjectDetailImagePlanes.tsx`**, and **`PoolWaterMaterial.ts`** WebGL branch.
4. **Debugging**: use `logWebGPU` / `logWebGPUOnce` from `src/lib/webgpu/debugWebGPU.ts` for WebGPU build paths. The app applies `patchThreeTSL` at startup (`src/lib/webgpu/patchThreeTSL.ts`); do not assume raw three.js behavior without checking project patches.
5. **Integration**: effects belong in the same R3F canvas as the scene (`UnifiedCanvas`); use `isWebGPURenderer` / `isWebGLRenderer` / `getRendererType` to pick the correct implementation.

If a feature is implemented WebGL-only while the unified canvas is on WebGPU, that is a **bug** unless explicitly scoped to the fallback path.

### TSL / WebGPU patterns (extended)

For node materials, compute shaders, storage buffers, and common TSL pitfalls, read **[docs/TSL_WEBGPU.md](docs/TSL_WEBGPU.md)**.

**Test-page pool water** (`src/components/webgl/water/`): cursor ripples use a **wave-equation** compute sim (`PoolShallowWaterSim` / `PoolShallowWaterSimCPU`, 4rknova-style); surface look uses ocean-style fresnel/env on `PoolWaterMaterial` (WebGPU TSL + WebGL `ShaderMaterial` dual path). Do not use `EffectComposer` / gentlerain pressure sim for this feature.

# TSL & WebGPU Development Guide

A comprehensive guide to Three.js Shading Language (TSL) and WebGPU based on real-world implementation experience. This document captures patterns, pitfalls, and solutions that go beyond official documentation.

**Tech Stack:** Three.js r181.1+, TSL, WebGPU

---

## What is TSL?

TSL (Three.js Shading Language) is a **node-based shader composition system**, not traditional shader code like GLSL/WGSL.

**Mental Model:** Think shader graphs (Unity/Unreal), not if/else statements.

**Key Principle:** You compose shaders by **chaining nodes**, not writing control flow.

---

## Critical TSL Patterns

### 1. No If/Else Statements ❌

TSL does not support conditional branching. Use math operations instead.

```typescript
// ❌ WRONG - If/else doesn't exist in TSL
const result = If(value.lessThan(threshold), () => {
  return float(0.0);
}).else(() => {
  return float(1.0);
});
```

```typescript
// ✅ CORRECT - Use step function
const result = step(threshold, value);  // Returns 0 if value < threshold, 1 otherwise
```

**Math-based conditionals:**

- `step(edge, x)` - Returns 0 if x < edge, 1 otherwise
- `.max(value)` - Clamp to minimum
- `.min(value)` - Clamp to maximum
- `clamp(x, min, max)` - Clamp between range
- `mix(a, b, t)` - Linear interpolation
- Multiply by 0/1 to conditionally disable values

**Example - Phillips spectrum validation:**

```typescript
// Use step instead of if (kLength < 0.0001)
const isValid = step(0.0001, kLength);
const phillipsValue = exp(...).div(...).mul(...);
const phillips = phillipsValue.mul(isValid);  // Multiply by 0 or 1
```

---

### 2. Function Syntax (Not Method Syntax)

TSL functions take parameters as arguments, not method calls on values.

```typescript
// ❌ WRONG - atan2 as method
const phi = reflectDir.z.atan2(reflectDir.x);
```

```typescript
// ✅ CORRECT - atan as function
const phi = atan(reflectDir.z, reflectDir.x);
```

**Common functions:**

- `atan(y, x)` - NOT `atan2`
- `sin(x)`, `cos(x)`, `tan(x)`
- `sqrt(x)`, `exp(x)`, `log2(x)`, `pow(base, exp)`
- `abs(x)`, `floor(x)`, `ceil(x)`, `fract(x)`
- `normalize(v)`, `dot(a, b)`, `cross(a, b)`, `reflect(v, n)`, `length(v)`

---

### 3. Uniform Access in Shaders

Don't access properties on uniform nodes - pass them directly to conversion functions.

```typescript
// ❌ WRONG - Accessing .r, .g, .b on uniform node
const waterColor = vec3(
  this.waterColorUniform.r,
  this.waterColorUniform.g,
  this.waterColorUniform.b
);
```

```typescript
// ✅ CORRECT - Pass uniform node to vec3
const waterColor = vec3(this.waterColorUniform);
```

**Why:** TSL automatically converts `uniform(THREE.Color)` to `vec3` when needed. Accessing properties on the node itself doesn't work.

**Pattern for updating uniforms:**

```typescript
// In material class
public waterColorUniform = uniform(new THREE.Color(0x006994));

// In UI/update code
this.waterMaterial.waterColorUniform.value = new THREE.Color(0xff0000);

// In shader
const color = vec3(this.waterColorUniform);  // Automatic conversion
```

---

### 4. Material Base Classes

Choose the right base class for your rendering needs.

```typescript
// ❌ WRONG - Using MeshStandardNodeMaterial without lights
class Material extends THREE.MeshStandardNodeMaterial {
  // Requires directional/ambient lights or will render black
}
```

```typescript
// ✅ CORRECT - MeshBasicNodeMaterial for unlit/environment-only
class Material extends THREE.MeshBasicNodeMaterial {
  // Only uses environment map, no lights required
}
```

**Base classes:**

- `MeshBasicNodeMaterial` - Unlit, perfect for environment reflections only
- `MeshStandardNodeMaterial` - PBR with lights required
- `MeshPhysicalNodeMaterial` - Advanced PBR with clearcoat, transmission, etc.

**Custom shader nodes:**

```typescript
// Override position, normal, and color
this.positionNode = customPositionFunction();
this.normalNode = customNormalFunction();
this.colorNode = customColorFunction();
```

---

## WebGPU Compute Shaders

### Type System - CRITICAL ⚠️

WGSL is **strongly typed**. f32 and u32 are incompatible.

#### Math Functions Only Work on Floats

```typescript
// ❌ WRONG - floor() only works on floats
const y = idx.div(resolution).floor();  // Error: floor(u32)
```

```typescript
// ✅ CORRECT - Integer division already truncates
const y = idx.div(resolution);  // No floor needed for integers
```

```typescript
// ❌ WRONG - sqrt() only works on floats
const x = idx.mod(resolution);  // u32
const kLength = sqrt(x.mul(x));  // Error: sqrt(u32)
```

```typescript
// ✅ CORRECT - Convert to float first
const x = idx.mod(resolution).toFloat();  // Convert u32 → f32
const kLength = sqrt(x.mul(x));  // Works!
```

**Rule:** Always use `.toFloat()` when converting from `instanceIndex` or integer operations to floats.

**Common conversions:**

```typescript
const idx = instanceIndex;  // u32
const resolution = this.uniforms.resolution;  // u32

// Convert to float for math
const x = idx.mod(resolution).toFloat();
const y = idx.div(resolution).toFloat();
const nx = x.sub(resolution.toFloat().div(2.0));  // Center around 0
```

---

### Compute Shader Structure

```typescript
// Define compute function
this.computeShader = Fn(() => {
  const idx = instanceIndex;  // u32 - thread ID

  // Convert to float for math operations
  const x = idx.mod(resolution);
  const y = idx.div(resolution);
  const xFloat = x.toFloat();
  const yFloat = y.toFloat();

  // Perform calculations...
  const result = sqrt(xFloat.mul(xFloat).add(yFloat.mul(yFloat)));

  // Write to output buffer
  this.outputBuffer.element(idx).assign(vec4(result, 0, 0, 1));
})().compute(count);  // Dispatch 'count' threads
```

**Key points:**

- `instanceIndex` - Current thread ID (u32)
- `.element(idx)` - Access buffer at index
- `.assign(value)` - Write to buffer
- `.compute(count)` - Dispatch count threads

---

### Storage Buffers

```typescript
// Create buffer (CPU side)
const count = width * height;
this.buffer = instancedArray(count, 'vec4');

// Read from buffer (GPU side)
const value = this.buffer.element(idx);  // idx is instanceIndex or computed

// Write to buffer (GPU side)
this.buffer.element(idx).assign(vec4(x, y, z, w));
```

**Supported types:** `'vec4'`, `'vec3'`, `'vec2'`, `'float'`, `'int'`, `'uint'`

---

### Storage Textures - DOESN'T WORK YET ❌

**Problem:** TSL's `storageTexture()` has a bug with `textureDimensions()`.

```typescript
// ❌ WRONG - Causes WGSL error
this.texture = storageTexture(new THREE.DataTexture(...));
this.texture.element(coords).assign(vec4(...));
```

**Error:**

```
no matching call to 'textureDimensions(texture_storage_2d<rgba32float, write>, u32)'
overload expects 1 argument, call passed 2 arguments
```

**Why it fails:**

- TSL calls `textureDimensions(storageTexture, mipLevel)` internally
- WGSL storage textures don't accept mip level parameter
- Only sampled textures accept mip levels

**Workaround - Direct Buffer Access:**

Instead of copying buffers to textures, read buffers directly in materials!

```typescript
// ✅ SOLUTION: Read compute buffers in material shaders

// In compute shader: Write to buffer
this.displacementBuffer.element(idx).assign(vec4(x, y, z, w));

// In material shader: Read from buffer
const customPosition = Fn(() => {
  const uvCoord = uv();  // [0,1] x [0,1]

  // Convert UV to buffer index
  const resolution = float(this.getResolution());
  const x = floor(uvCoord.x.mul(resolution));
  const y = floor(uvCoord.y.mul(resolution));
  const idx = int(y.mul(resolution).add(x));

  // Read directly from compute buffer!
  const buffer = this.getDisplacementBuffer();
  const displacement = buffer.element(idx);

  return positionLocal.add(displacement.xyz);
});

this.positionNode = customPosition();
```

**Benefits:**

- ✅ No buffer → texture copy needed
- ✅ More efficient (one less memory copy)
- ✅ Less VRAM (no duplicate texture)
- ✅ Works around TSL storage texture bug

**UV to Index Pattern:**

```typescript
// Standard pattern for UV → 1D buffer index
const resolution = float(bufferResolution);
const x = floor(uvCoord.x.mul(resolution));
const y = floor(uvCoord.y.mul(resolution));
const idx = int(y.mul(resolution).add(x));
```

---

## Import Patterns

### Three.js WebGPU

```typescript
import * as THREE from 'three/webgpu';  // WebGPU renderer
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
```

### TSL Functions

```typescript
import {
  // Uniforms & storage
  uniform, storage, instancedArray, storageTexture,
  // Types
  vec2, vec3, vec4, float, int, uint,
  // Function wrapper
  Fn,
  // Math
  sin, cos, tan, atan, asin, acos,
  sqrt, exp, pow, log2, abs,
  floor, ceil, fract, mod,
  // Vector ops
  dot, cross, normalize, length, reflect, refract,
  mix, clamp, step, smoothstep,
  // Shader inputs
  uv, positionLocal, positionWorld, positionView,
  normalLocal, normalWorld, normalView,
  cameraPosition, cameraViewMatrix,
  // Texture sampling
  texture, textureBicubic,
  // Compute
  instanceIndex
} from 'three/tsl';
```

**DO NOT import from:** `'three/nodes'` ❌

---

## Shader Node Customization

### Position Node (Vertex Displacement)

```typescript
const customPosition = Fn(() => {
  const pos = positionLocal;
  const uvCoord = uv();
  const time = this.timeUniform;

  // Calculate displacement
  const wave = sin(uvCoord.x.mul(5.0).add(time)).mul(amplitude);

  // Apply to Y position
  return vec3(pos.x, pos.y.add(wave), pos.z);
});

this.positionNode = customPosition();
```

### Normal Node

```typescript
const customNormal = Fn(() => {
  const uvCoord = uv();

  // Create perturbation
  const nx = sin(uvCoord.x.mul(10.0)).mul(0.3);
  const nz = sin(uvCoord.y.mul(8.0)).mul(0.3);

  // Normalize and return
  return normalize(vec3(nx, 1.0, nz));
});

this.normalNode = customNormal();
```

### Color Node (Fragment Shader)

```typescript
const customColor = Fn(() => {
  const viewDir = normalize(cameraPosition.sub(positionWorld));
  const normal = normalWorld;

  // Fresnel using Schlick's approximation
  const cosTheta = max(dot(viewDir, normal), 0.0);
  const fresnel = pow(float(1.0).sub(cosTheta), fresnelPower);

  // Mix colors based on fresnel
  const finalColor = mix(baseColor, reflectionColor, fresnel);

  return vec4(finalColor, 1.0);
});

this.colorNode = customColor();
```

---

## Environment Mapping

### Equirectangular to Reflection

```typescript
// Load environment map
const envMap = await textureLoader.loadAsync('/skybox.jpg');
envMap.mapping = THREE.EquirectangularReflectionMapping;
envMap.colorSpace = THREE.SRGBColorSpace;

// Use as scene background
scene.background = envMap;

// In shader - sample environment
const customColor = Fn(() => {
  const viewDir = normalize(cameraPosition.sub(positionWorld));
  const normal = normalWorld;

  // Calculate reflection direction
  const reflectDir = reflect(viewDir.negate(), normal);

  // Convert 3D direction → equirectangular UV
  const phi = atan(reflectDir.z, reflectDir.x);
  const theta = asin(reflectDir.y);
  const envUV = vec2(
    phi.mul(0.1591).add(0.5),   // 1/(2π) ≈ 0.1591
    theta.mul(0.3183).add(0.5)  // 1/π ≈ 0.3183
  );

  // Sample environment
  const envSample = texture(envMap, envUV);

  return vec4(envSample.xyz, 1.0);
});
```

**Constants:**

- `1/(2π) ≈ 0.1591` - Horizontal wrap (φ: -π to π)
- `1/π ≈ 0.3183` - Vertical range (θ: -π/2 to π/2)

---

## Common Errors & Solutions

### Error: "does not provide an export named 'instancedArray'"

**Cause:** Three.js version too old

**Solution:** Update to r181.1+

```bash
npm install three@^0.181.1
```

---

### Error: "If(...).else is not a function"

**Cause:** Using control flow instead of math

**Solution:** Use `step()`, `max()`, `min()`, or multiplication

```typescript
// ❌ Wrong
If(x.lessThan(0), () => float(0)).else(() => x);

// ✅ Right
x.max(0.0)  // Clamp to minimum 0
```

---

### Error: "floor(u32)" or "sqrt(u32)"

**Cause:** Math functions only work on floats

**Solution:** Convert with `.toFloat()`

```typescript
// ❌ Wrong
const y = idx.div(resolution).floor();

// ✅ Right
const y = idx.div(resolution);  // Integer division truncates
// OR
const y = idx.div(resolution).toFloat();  // If you need float
```

---

### Error: "atan2 is overloaded. Use 'atan' instead"

**Cause:** Using GLSL naming

**Solution:** Use `atan(y, x)` function syntax

```typescript
// ❌ Wrong
const phi = atan2(z, x);

// ✅ Right
const phi = atan(z, x);
```

---

### Error: Uniforms not updating from UI

**Cause:** Accessing properties on uniform node

**Solution:** Pass uniform node to vec3/float directly

```typescript
// ❌ Wrong
const color = vec3(colorUniform.r, colorUniform.g, colorUniform.b);

// ✅ Right
const color = vec3(colorUniform);
```

---

### Error: "no matching call to 'textureDimensions(texture_storage_2d...)"

**Cause:** TSL storage texture bug

**Solution:** Use direct buffer access instead (see Storage Textures section)

---

## Development Workflow

### Incremental Development Pattern

Build complex features in isolated, testable phases:

1. **Phase 1:** Static rendering
   - Verify geometry, camera, basic material work
2. **Phase 2:** Animation
   - Add time uniforms, simple motion
3. **Phase 3:** View-dependent effects
   - Fresnel, reflections, camera-relative calculations
4. **Phase 4:** Geometry modification
   - Vertex displacement, morphing
5. **Phase 5:** Compute shaders
   - GPU calculations, complex simulations

**Why:** Isolate issues at each step. A bug in Phase 5 won't be confused with Phase 1-4 problems.

---

## Performance Notes

### Compute Shader Dispatch

- Resolution 512×512 = 262,144 threads
- Each thread runs in parallel on GPU
- Minimize buffer reads/writes
- Group related calculations in same shader when possible

### Async Operations

```typescript
await renderer.computeAsync(computeShader);
```

- Blocks rendering pipeline
- Consider ping-pong buffers for overlapping compute/render
- Profile with Chrome DevTools → Performance → GPU

### Memory Management

- Reuse buffers when possible
- Direct buffer access > copying to textures
- Storage buffers persist between frames (good for iterative algorithms)

---

## Best Practices

### 1. Type Everything

```typescript
// ✅ Good - Explicit types
const count: number = width * height;
const buffer: any = instancedArray(count, 'vec4');
```

### 2. Defensive Math

```typescript
// Avoid division by zero
const kLengthInv = float(1.0).div(kLength.add(0.0001));

// Avoid negative logs
const r = sqrt(float(-2.0).mul(log2(xi.add(0.0001))));
```

### 3. Normalize Vectors

```typescript
// Always normalize after perturbation
const normal = normalize(vec3(nx, 1.0, nz));
// Not just for display - affects math correctness
```

### 4. Comment Node Graphs

```typescript
// TSL is readable but intent isn't always clear
const fresnel = F0.add(
  float(1.0).sub(F0).mul(pow(float(1.0).sub(cosTheta), power))
);  // Schlick's approximation
// Explain the "why", not just the "what"
```

---

## Resources

- **Three.js WebGPU Examples:** [https://threejs.org/examples/?q=webgpu](https://threejs.org/examples/?q=webgpu)
- **TSL Source:** `node_modules/three/src/nodes/` (study examples!)
- **WGSL Spec:** [https://www.w3.org/TR/WGSL/](https://www.w3.org/TR/WGSL/)
- **WebGPU Spec:** [https://www.w3.org/TR/webgpu/](https://www.w3.org/TR/webgpu/)
