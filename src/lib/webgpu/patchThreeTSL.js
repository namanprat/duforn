let patched = false;
import { logWebGPUOnce } from "./debugWebGPU.js";

export async function patchThreeTSL() {
  if (patched) return;

  const { TextureNode } = await import("three/webgpu");
  const originalGenerate = TextureNode.prototype.generate;

  if (TextureNode.prototype.__dufornPatchedGenerate) {
    patched = true;
    return;
  }

  TextureNode.prototype.generate = function patchedTextureGenerate(builder, output) {
    const safeOutput =
      typeof output === "string" && output.length > 0 ? output : this.getNodeType(builder);

    return originalGenerate.call(this, builder, safeOutput);
  };

  TextureNode.prototype.__dufornPatchedGenerate = true;
  patched = true;
  logWebGPUOnce("tsl-patch", "patch", "Applied TextureNode.generate null-output guard", {
    threeVersion: "0.183.2",
  });
}
