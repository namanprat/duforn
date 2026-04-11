// @ts-nocheck
import fullscreenVertShader from "./wgsl/fullscreen.vert.wgsl?raw";
import dropFragShader from "./wgsl/drop.frag.wgsl?raw";
import updateFragShader from "./wgsl/update.frag.wgsl?raw";
import normalFragShader from "./wgsl/normal.frag.wgsl?raw";

/**
 * @param {GPUDevice} device
 * @param {string} label
 * @param {string} vsCode
 * @param {string} fsCode
 * @param {number} uniformSize
 * @param {GPUTextureFormat} format
 */
function createPipeline(device, label, vsCode, fsCode, uniformSize, format) {
  const module = device.createShaderModule({
    label: `${label} Module`,
    code: vsCode + fsCode,
  });

  const pipeline = device.createRenderPipeline({
    label: `${label} Pipeline`,
    layout: "auto",
    vertex: {
      module,
      entryPoint: "vs_main",
    },
    fragment: {
      module,
      entryPoint: "fs_main",
      targets: [{ format }],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  const uniformBuffer = device.createBuffer({
    size: uniformSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  return { pipeline, uniformBuffer, uniformSize };
}

/**
 * WebGPU heightfield water (drop / wave / normal) from webgpu-water, without sphere pass.
 * Ping-pongs internal textures; copies final state to `displayTexture` for ExternalTexture sampling.
 */
export class HeightfieldWaterSim {
  /**
   * @param {GPUDevice} device
   * @param {number} width
   * @param {number} height
   */
  constructor(device, width, height) {
    this.device = device;
    this.width = width;
    this.height = height;

    const format = device.features.has("float32-filterable") ? "rgba32float" : "rgba16float";
    this._format = format;

    this.textureA = this.#createSimTexture(format, { renderTarget: true });
    this.textureB = this.#createSimTexture(format, { renderTarget: true });
    this.displayTexture = this.#createSimTexture(format, { renderTarget: false });

    this.sampler = device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge",
    });

    this.dropPipeline = createPipeline(
      device,
      "HeightfieldDrop",
      fullscreenVertShader,
      dropFragShader,
      32,
      format,
    );
    this.updatePipeline = createPipeline(
      device,
      "HeightfieldUpdate",
      fullscreenVertShader,
      updateFragShader,
      16,
      format,
    );
    this.normalPipeline = createPipeline(
      device,
      "HeightfieldNormal",
      fullscreenVertShader,
      normalFragShader,
      16,
      format,
    );
  }

  #createSimTexture(format, { renderTarget = true } = {}) {
    let usage =
      GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST;
    if (renderTarget) usage |= GPUTextureUsage.RENDER_ATTACHMENT;
    return this.device.createTexture({
      size: [this.width, this.height],
      format,
      usage,
    });
  }

  /**
   * @param {{ pipeline: GPURenderPipeline, uniformBuffer: GPUBuffer }} pipelineObj
   * @param {Float32Array} uniformsData
   */
  #runPipeline(pipelineObj, uniformsData) {
    this.device.queue.writeBuffer(pipelineObj.uniformBuffer, 0, uniformsData);

    const bindGroup = this.device.createBindGroup({
      layout: pipelineObj.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.textureA.createView() },
        { binding: 1, resource: this.sampler },
        { binding: 2, resource: { buffer: pipelineObj.uniformBuffer } },
      ],
    });

    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.textureB.createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
        },
      ],
    });

    pass.setPipeline(pipelineObj.pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(6);
    pass.end();

    this.device.queue.submit([encoder.finish()]);

    const temp = this.textureA;
    this.textureA = this.textureB;
    this.textureB = temp;
  }

  /**
   * @param {number} x [-1, 1]
   * @param {number} y [-1, 1] (maps to texture V; use same convention as webgpu-water plane Z)
   * @param {number} radius
   * @param {number} strength
   */
  addDrop(x, y, radius, strength) {
    const data = new Float32Array(4);
    data[0] = x;
    data[1] = y;
    data[2] = radius;
    data[3] = strength;
    this.#runPipeline(this.dropPipeline, data);
  }

  stepSimulation() {
    const data = new Float32Array(2);
    data[0] = 1.0 / this.width;
    data[1] = 1.0 / this.height;
    this.#runPipeline(this.updatePipeline, data);
  }

  updateNormals() {
    const data = new Float32Array(2);
    data[0] = 1.0 / this.width;
    data[1] = 1.0 / this.height;
    this.#runPipeline(this.normalPipeline, data);
  }

  /** Copy current sim state (textureA after last pass) into displayTexture for Three.js ExternalTexture. */
  copyToDisplay() {
    const encoder = this.device.createCommandEncoder();
    encoder.copyTextureToTexture(
      { texture: this.textureA },
      { texture: this.displayTexture },
      { width: this.width, height: this.height, depthOrArrayLayers: 1 },
    );
    this.device.queue.submit([encoder.finish()]);
  }

  /**
   * @param {object} opts
   * @param {Array<{ x: number, y: number, radius?: number, strength?: number }>} [opts.drops]
   * @param {number} [opts.stepCount=5]
   */
  tick(opts = {}) {
    const { drops = [], stepCount = 5 } = opts;
    const r = 0.03;
    const s = 0.01;
    for (const d of drops) {
      this.addDrop(d.x, d.y, d.radius ?? r, d.strength ?? s);
    }
    for (let i = 0; i < stepCount; i++) {
      this.stepSimulation();
    }
    this.updateNormals();
    this.copyToDisplay();
  }

  dispose() {
    try {
      this.textureA.destroy();
    } catch {
      /* ignore */
    }
    try {
      this.textureB.destroy();
    } catch {
      /* ignore */
    }
    try {
      this.displayTexture.destroy();
    } catch {
      /* ignore */
    }
    for (const p of [this.dropPipeline, this.updatePipeline, this.normalPipeline]) {
      try {
        p.uniformBuffer.destroy();
      } catch {
        /* ignore */
      }
    }
  }
}
