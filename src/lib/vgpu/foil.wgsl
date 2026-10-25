struct Params {
  resolution: vec2f,
  pointer: vec2f,
  hover: f32,
  time: f32,
}
@group(0) @binding(0) var<uniform> params: Params;

// Pearlescence limitada a la paleta brand: navy -> naranja -> blanco.
fn brand(t: f32) -> vec3f {
  let navy = vec3f(0.043, 0.114, 0.227);
  let orange = vec3f(1.0, 0.353, 0.122);
  let white = vec3f(1.0);
  let a = 0.5 + 0.5 * sin(6.2831853 * t);
  let b = 0.5 + 0.5 * sin(6.2831853 * (t * 1.7 + 0.33));
  return mix(mix(navy, orange, a), white, b * b * 0.55);
}

fn hash(p: vec2f) -> f32 {
  let q = vec2u(abs(p) * 1800.0);
  var n = (q.x * 1597334677u) ^ (q.y * 3812015801u);
  n = (n ^ (n >> 16u)) * 2246822519u;
  return f32(n & 1023u) / 1023.0 - 0.5;
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let res = max(params.resolution, vec2f(1));
  let aspect = res.x / res.y;
  let p = vec2f((uv.x - 0.5) * aspect, uv.y - 0.5);
  let light = vec2f(params.pointer.x * 0.5 * aspect, params.pointer.y * 0.5);
  let d = p - light;

  // Banda de luz rasante que sigue al puntero + spotlight suave.
  let sweep = (d.x * 0.8 + d.y * 0.45 + sin(p.y * 7.0 + p.x * 4.0) * 0.05) / 0.22;
  let band = exp(-sweep * sweep);
  let glint = exp(-sweep * sweep * 12.0);
  let spot = exp(-dot(d, d) * 3.0);

  // Contornos grabados concéntricos que difractan.
  let q = p - vec2f(0.12 * aspect, 0.05);
  let r = length(q * vec2f(1.0, 0.8));
  let ring = r * 38.0 + sin(atan2(q.y, q.x) * 3.0 + r * 9.0) * 0.8;
  let lines = 1.0 - smoothstep(0.05, 0.22, abs(sin(ring * 3.1415926)));

  let phase = dot(d, vec2f(0.9, -0.6)) + r * 0.6 + params.time * 0.02;
  let pearl = brand(phase);

  let hover = clamp(params.hover, 0.0, 1.0);
  let ambient = 0.10;
  let reveal = ambient + hover * (0.25 + 0.9 * spot);
  var c = pearl * band * spot * (0.55 + hover);
  c += pearl * lines * reveal * 0.55;
  c += vec3f(1.0) * glint * spot * hover * 0.35;
  c += hash(p + vec2f(2.0)) * 0.05 * (0.3 + band * hover);
  return vec4f(max(c, vec3f(0.0)) * 0.9, 1.0);
}
