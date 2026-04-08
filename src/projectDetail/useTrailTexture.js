import { useEffect, useRef } from "react";
import * as THREE from "three";

export function useTrailTexture({
  width = 512,
  height = 512,
  fadeAlpha = 0.025,
  blurPx = 4,
  radiusFactor = 0.12,
  gradientScale = 2.5,
} = {}) {
  const trailTextureRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const configRef = useRef({ fadeAlpha, blurPx, radiusFactor, gradientScale });

  useEffect(() => {
    configRef.current = { fadeAlpha, blurPx, radiusFactor, gradientScale };
  }, [fadeAlpha, blurPx, radiusFactor, gradientScale]);

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
    } = configRef.current;
    const circleRadius = canvas.width * activeRadiusFactor;

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
      gradient.addColorStop(0, `rgba(255, 255, 255, ${0.78 * intensity})`);
      gradient.addColorStop(0.08, `rgba(255, 255, 255, ${0.56 * intensity})`);
      gradient.addColorStop(0.15, `rgba(255, 255, 255, ${0.4 * intensity})`);
      gradient.addColorStop(0.25, `rgba(255, 255, 255, ${0.24 * intensity})`);
      gradient.addColorStop(0.35, `rgba(255, 255, 255, ${0.16 * intensity})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.08 * intensity})`);
      gradient.addColorStop(0.65, `rgba(255, 255, 255, ${0.04 * intensity})`);
      gradient.addColorStop(0.8, `rgba(255, 255, 255, ${0.015 * intensity})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      if (distance > 0.5) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 * intensity})`;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = circleRadius * stretch;
        ctx.beginPath();
        ctx.moveTo(previousX, previousY);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, gradientRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    tex.needsUpdate = true;
  };

  return { trailTextureRef, updateTrail };
}
