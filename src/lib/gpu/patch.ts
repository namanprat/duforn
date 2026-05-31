// @ts-nocheck
let tslPatched = false;
import { logWebGPUOnce } from "./debug";

export async function patchThreeTSL() {
  if (tslPatched) return;

  const { TextureNode } = await import("three/webgpu");
  const originalGenerate = TextureNode.prototype.generate;

  if (TextureNode.prototype.__dufornPatchedGenerate) {
    tslPatched = true;
    return;
  }

  TextureNode.prototype.generate = function patchedTextureGenerate(builder, output) {
    const safeOutput =
      typeof output === "string" && output.length > 0 ? output : this.getNodeType(builder);

    return originalGenerate.call(this, builder, safeOutput);
  };

  TextureNode.prototype.__dufornPatchedGenerate = true;
  tslPatched = true;
  logWebGPUOnce("tsl-patch", "patch", "Applied TextureNode.generate null-output guard", {
    threeVersion: "0.183.2",
  });
}
