/**
 * Trail mask for project-bg shading (ported from Archive (1) trail.js).
 * Produces a soft white stroke that decays each frame — sample .r as height.
 */
export class ProjectBgTrailCanvas {
  constructor(width = 512, height = 512) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, width, height);

    this.circleRadius = width * 0.12;
    this.fadeAlpha = 0.025;
  }

  /**
   * @param {{ x?: number; y?: number } | null} mouse — canvas pixel coordinates
   */
  update(mouse) {
    const { ctx, canvas } = this;
    ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mouse && mouse.x !== undefined && mouse.y !== undefined) {
      ctx.save();
      ctx.filter = "blur(4px)";
      const gradientRadius = this.circleRadius * 2.5;
      const gradient = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        gradientRadius,
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.7)");
      gradient.addColorStop(0.08, "rgba(255, 255, 255, 0.5)");
      gradient.addColorStop(0.15, "rgba(255, 255, 255, 0.35)");
      gradient.addColorStop(0.25, "rgba(255, 255, 255, 0.2)");
      gradient.addColorStop(0.35, "rgba(255, 255, 255, 0.12)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.06)");
      gradient.addColorStop(0.65, "rgba(255, 255, 255, 0.03)");
      gradient.addColorStop(0.8, "rgba(255, 255, 255, 0.01)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, gradientRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  resize(width, height) {
    if (this.canvas.width === width && this.canvas.height === height) return;
    this.canvas.width = width;
    this.canvas.height = height;
    this.circleRadius = width * 0.12;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, width, height);
  }
}
