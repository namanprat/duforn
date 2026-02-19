import * as THREE from 'three';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { VignetteShader, GrainShader, EdgeDistortionShader } from './shaders/post-fx.js';

/**
 * Canonical work-page signature:
 * RenderPass -> Bloom -> [Vignette] -> Grain -> Chromatic Edge -> Output
 */
export function applyWorkSignaturePostFX(composer, scene, camera, postFXUniforms, options = {}) {
  const {
    bloomStrength = 0.15,
    bloomRadius = 0.5,
    bloomThreshold = 0.5,
    vignetteDarkness = 0.65,
    vignetteOffset = 0.68,
    includeBloom = true,
    includeVignette = true,
    edgeShift = 0.012,
    edgeStart = 0.1,
    edgeEnd = 0.6,
  } = options;

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  if (includeBloom) {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      bloomStrength,
      bloomRadius,
      bloomThreshold
    );
    composer.addPass(bloomPass);
  }

  if (includeVignette) {
    const vignettePass = new ShaderPass(VignetteShader({ darkness: vignetteDarkness, offset: vignetteOffset }));
    composer.addPass(vignettePass);
  }

  const grainPass = new ShaderPass(GrainShader());
  if (postFXUniforms?.uTime) {
    grainPass.uniforms.uTime = postFXUniforms.uTime;
  }
  if (postFXUniforms?.uGrain) {
    grainPass.uniforms.uGrain = postFXUniforms.uGrain;
  }
  composer.addPass(grainPass);

  const edgeDistortionPass = new ShaderPass(EdgeDistortionShader({ shift: edgeShift, edgeStart, edgeEnd, preserveAlpha: true }));
  composer.addPass(edgeDistortionPass);

  const outputPass = new OutputPass();
  if (outputPass.material) {
    outputPass.material.transparent = true;
    outputPass.material.blending = THREE.NormalBlending;
  }
  composer.addPass(outputPass);
}
