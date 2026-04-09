import { useEffect, useRef } from "react";
import * as THREE from "three";

export function useTrailTexture({
  width = 512,
  height = 512,
  fadeAlpha = 0.025,
  blurPx = 4,
  radiusFactor = 0.12,
  gradientScale = 2.5,
  smudgeStrength = 0,
  smudgeBlurPx = 0,
  roughness = 0,
  stampAlpha = 1,
} = {}) {
  const trailTextureRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const configRef = useRef({
    fadeAlpha,
    blurPx,
    radiusFactor,
    gradientScale,
    smudgeStrength,
    smudgeBlurPx,
    roughness,
    stampAlpha,
  });
  const previousRef = useRef({ x: null, y: null });

  useEffect(() => {
    configRef.current = {
      fadeAlpha,
      blurPx,
      radiusFactor,
      gradientScale,
      smudgeStrength,
      smudgeBlurPx,
      roughness,
      stampAlpha,
    };
  }, [
    fadeAlpha,
    blurPx,
    radiusFactor,
    gradientScale,
    smudgeStrength,
    smudgeBlurPx,
    roughness,
    stampAlpha,
  ]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.flipY = false;

    canvasRef.current = canvas;
    ctxRef.current = ctx;
    trailTextureRef.current = tex;

    return () => {
      tex.dispose();
      trailTextureRef.current = null;
      canvasRef.current = null;
      ctxRef.current = null;
    };
  }, [width, height]);

  const updateTrail = (mouse) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const tex = trailTextureRef.current;
    if (!ctx || !canvas || !tex) return;

    const {
      fadeAlpha: activeFadeAlpha,
      blurPx: activeBlurPx,
      radiusFactor: activeRadiusFactor,
      gradientScale: activeGradientScale,
      smudgeStrength: activeSmudgeStrength,
      smudgeBlurPx: activeSmudgeBlurPx,
      roughness: activeRoughness,
      stampAlpha: activeStampAlpha,
    } = configRef.current;
    const circleRadius = canvas.width * activeRadiusFactor;

    // Subtle feedback smear: copy the buffer onto itself with a tiny offset.
    // This gives the "ink dragged through paper" feel without a full fluid sim.
    if (mouse && mouse.x !== undefined && mouse.y !== undefined) {
      const prevX = previousRef.current.x ?? mouse.x;
      const prevY = previousRef.current.y ?? mouse.y;
      const dx = mouse.x - prevX;
      const dy = mouse.y - prevY;
      const speed = Math.hypot(dx, dy);
      const normalized = speed > 0.0001 ? 1 / speed : 0;

      if (activeSmudgeStrength > 0.0001) {
        const shift = Math.min(speed, canvas.width * 0.035) * activeSmudgeStrength;
        const sx = -dx * normalized * shift;
        const sy = -dy * normalized * shift;

        ctx.save();
        ctx.globalAlpha = 0.985;
        ctx.globalCompositeOperation = "source-over";
        ctx.filter = activeSmudgeBlurPx > 0 ? `blur(${activeSmudgeBlurPx}px)` : "none";
        ctx.drawImage(canvas, sx, sy);
        ctx.restore();
      }

      previousRef.current.x = mouse.x;
      previousRef.current.y = mouse.y;
    }

    ctx.fillStyle = `rgba(0, 0, 0, ${activeFadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mouse && mouse.x !== undefined && mouse.y !== undefined) {
      const intensity = Math.max(0, Math.min(mouse.intensity ?? 1, 1));
      if (intensity <= 0.001) {
        tex.needsUpdate = true;
        return;
      }

      const previousX = mouse.previousX ?? mouse.x;
      const previousY = mouse.previousY ?? mouse.y;
      const deltaX = mouse.x - previousX;
      const deltaY = mouse.y - previousY;
      const distance = Math.hypot(deltaX, deltaY);
      const stretch = 1 + Math.min(distance / (canvas.width * 0.08), 1.6);

      ctx.save();
      ctx.filter = `blur(${activeBlurPx}px)`;
      ctx.globalCompositeOperation = "lighter";

      const gradientRadius = circleRadius * activeGradientScale;
      const gradient = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        gradientRadius,
      );
      const baseAlpha = Math.max(0, Math.min(activeStampAlpha, 1)) * intensity;
      // Higher contrast core + slower tail-off reads more like ink than "airbrush glow".
      gradient.addColorStop(0, `rgba(255, 255, 255, ${0.95 * baseAlpha})`);
      gradient.addColorStop(0.06, `rgba(255, 255, 255, ${0.75 * baseAlpha})`);
      gradient.addColorStop(0.14, `rgba(255, 255, 255, ${0.5 * baseAlpha})`);
      gradient.addColorStop(0.26, `rgba(255, 255, 255, ${0.28 * baseAlpha})`);
      gradient.addColorStop(0.42, `rgba(255, 255, 255, ${0.14 * baseAlpha})`);
      gradient.addColorStop(0.62, `rgba(255, 255, 255, ${0.06 * baseAlpha})`);
      gradient.addColorStop(0.82, `rgba(255, 255, 255, ${0.02 * baseAlpha})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      if (distance > 0.5) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.22 * baseAlpha})`;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        // A slightly chunkier stroke helps create the “squeegee/ink” impression.
        ctx.lineWidth = circleRadius * stretch * 1.05;
        ctx.beginPath();
        ctx.moveTo(previousX, previousY);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, gradientRadius, 0, Math.PI * 2);
      ctx.fill();

      // Edge roughness: stamp a few small “bleed” droplets around the perimeter.
      if (activeRoughness > 0.001) {
        const droplets = Math.floor(6 + activeRoughness * 18);
        const dropletRadius = Math.max(1, circleRadius * (0.22 + activeRoughness * 0.22));
        ctx.filter = `blur(${Math.max(0.5, activeBlurPx * 0.6)}px)`;
        for (let i = 0; i < droplets; i += 1) {
          const t = (i / droplets) * Math.PI * 2;
          const jitter =
            (Math.sin((mouse.x + mouse.y) * 0.01 + i * 12.77) * 0.5 + 0.5) * activeRoughness;
          const r = gradientRadius * (0.72 + jitter * 0.55);
          const x = mouse.x + Math.cos(t) * r;
          const y = mouse.y + Math.sin(t) * r;
          const a = 0.08 * baseAlpha * (0.6 + jitter);
          ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
          ctx.beginPath();
          ctx.arc(x, y, dropletRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    tex.needsUpdate = true;
  };

  return { trailTextureRef, updateTrail };
}
