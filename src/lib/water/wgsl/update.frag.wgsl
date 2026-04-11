@group(0) @binding(0) var waterTexture : texture_2d<f32>;
@group(0) @binding(1) var waterSampler : sampler;

struct UpdateUniforms {
  delta : vec2f,
}
@group(0) @binding(2) var<uniform> u : UpdateUniforms;

@fragment
fn fs_main(@location(0) uv : vec2f) -> @location(0) vec4f {
  var info = textureSample(waterTexture, waterSampler, uv);

  let dx = vec2f(u.delta.x, 0.0);
  let dy = vec2f(0.0, u.delta.y);

  let average = (
    textureSample(waterTexture, waterSampler, uv - dx).r +
    textureSample(waterTexture, waterSampler, uv - dy).r +
    textureSample(waterTexture, waterSampler, uv + dx).r +
    textureSample(waterTexture, waterSampler, uv + dy).r
  ) * 0.25;

  info.g += (average - info.r) * 2.0;
  info.g *= 0.995;
  info.r += info.g;

  return info;
}
