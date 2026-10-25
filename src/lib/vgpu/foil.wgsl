// Foil solar holográfico del ticket Pre-Hackatón (vgpu / WebGPU).
//
// Capa única opaca que pinta el cuerpo del ticket: la Quebrada + tren del poster
// en duotono navy→naranja, y encima un foil que reacciona a la luz (puntero en
// hover, órbita lenta en reposo): bandas perladas, difracción espectral sobre
// contornos grabados, destello blanco y grano fílmico. El DOM pone el texto encima.

struct Params {
  resolution: vec2f,
  pointer: vec2f,
  tilt: vec2f,
  hover: f32,
  time: f32,
}
@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var art: texture_2d<f32>;
@group(0) @binding(2) var artSampler: sampler;

const NAVY_950 = vec3f(0.024, 0.059, 0.133);
const NAVY_600 = vec3f(0.165, 0.306, 0.525);
const ORANGE_500 = vec3f(1.0, 0.353, 0.122);
const ORANGE_300 = vec3f(1.0, 0.541, 0.239);
const WARM_WHITE = vec3f(1.0, 0.95, 0.90);

fn stroke(d: f32, w: f32, aa: f32) -> f32 {
  return 1.0 - smoothstep(w, w + aa, abs(d));
}

// Longitudes de onda visibles (µm) → respuesta RGB suave.
fn wavelengthColor(wavelength: f32) -> vec3f {
  let response = (vec3f(wavelength) - vec3f(0.610, 0.545, 0.460)) / vec3f(0.045, 0.038, 0.032);
  let visible = smoothstep(0.380, 0.410, wavelength) * (1.0 - smoothstep(0.700, 0.780, wavelength));
  return exp(-0.5 * response * response) * visible;
}

// Rejilla de reflexión: m·λ = d·dot(L+V, across). Modelo de GPU Gems cap. 8 (Stam).
fn diffraction(across: vec2f, lightAndView: vec2f, spacing: f32) -> vec3f {
  let pathDifference = spacing * abs(dot(lightAndView, across));
  let along = dot(lightAndView, vec2f(-across.y, across.x));
  let envelope = exp(-along * along / 0.36);
  var reflected = vec3f(0.0);
  for (var order = 1; order <= 3; order++) {
    let m = f32(order);
    reflected += wavelengthColor(pathDifference / m) / (m * m);
  }
  return reflected * envelope;
}

// Perlado brand: naranja → magenta → azul → blanco → naranja.
fn pearl(t: f32) -> vec3f {
  var keys = array<vec3f, 5>(
    ORANGE_500,
    vec3f(0.86, 0.20, 0.62),
    vec3f(0.22, 0.46, 1.0),
    WARM_WHITE,
    ORANGE_500,
  );
  let k = fract(t) * 4.0;
  let i = u32(floor(k));
  let f = smoothstep(0.0, 1.0, fract(k));
  return mix(keys[i], keys[min(i + 1u, 4u)], f);
}

fn grain(point: vec2f) -> f32 {
  let p = vec2u(abs(point) * 2400.0);
  var n = (p.x * 1597334677u) ^ (p.y * 3812015801u);
  n = (n ^ (n >> 16u)) * 2246822519u;
  return f32(n & 1023u) / 1023.0 - 0.5;
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let res = max(params.resolution, vec2f(1.0));
  let aspect = res.x / res.y;
  let p = vec2f((uv.x - 0.5) * aspect, uv.y - 0.5);
  let hover = clamp(params.hover, 0.0, 1.0);
  let t = params.time;

  // Luz: sigue al puntero en hover; en reposo orbita despacio para que el foil viva solo.
  let orbit = vec2f(sin(t * 0.33) * 0.42 * aspect, cos(t * 0.21) * 0.30);
  let ptr = vec2f(params.pointer.x * aspect, params.pointer.y);
  let light = mix(orbit, ptr, hover);
  let d = p - light;

  // Foto del poster (cover-fit) con parallax leve por tilt.
  let dims = vec2f(textureDimensions(art));
  let texAspect = dims.x / dims.y;
  var fit = vec2f(1.0);
  if (aspect > texAspect) {
    fit = vec2f(1.0, texAspect / aspect);
  } else {
    fit = vec2f(aspect / texAspect, 1.0);
  }
  let auv = clamp((uv - 0.5) * fit * 0.94 + 0.5 + vec2f(0.0, -0.02) + params.tilt * 0.015, vec2f(0.0), vec2f(1.0));
  let rgb = textureSampleLevel(art, artSampler, auv, 0.0).rgb;
  let luma = dot(rgb, vec3f(0.299, 0.587, 0.114));
  let l = smoothstep(0.02, 0.98, pow(luma, 0.9));
  var base = mix(NAVY_950, NAVY_600, smoothstep(0.0, 0.5, l));
  base = mix(base, ORANGE_500, smoothstep(0.42, 0.80, l));
  base = mix(base, WARM_WHITE, smoothstep(0.80, 1.0, l));
  base = mix(base, rgb, 0.24);

  // Barrido de luz rasante + spot.
  let wobble = sin(p.y * 6.0 + p.x * 3.0 + t * 0.4) * 0.05;
  let sd = (d.x * 0.80 + d.y * 0.50 + wobble) / 0.30;
  let band = exp(-sd * sd);
  let glint = exp(-sd * sd * 14.0);
  let spot = exp(-dot(d, d) * 2.0);

  // Contornos grabados (topografía de la Quebrada) que difractan.
  let warp = vec2f(sin(p.y * 7.0 + sin(p.x * 4.0)) * 0.085, sin(p.x * 6.0 - p.y * 3.0) * 0.07);
  let q = p + warp - vec2f(0.18 * aspect, 0.05);
  let r = length(q * vec2f(1.0, 0.8));
  let contour = r * 60.0 + sin(atan2(q.y, q.x) * 3.0 + r * 8.0) * 1.5;
  let lines = stroke(sin(contour), 0.10, min(fwidth(contour), 1.0));
  let grad = vec2f(dpdx(contour), dpdy(contour));
  let across = grad / max(length(grad), 0.000001);
  let lightAndView = normalize(-d * 0.6 + vec2f(0.0, -0.35));
  let spectrum = diffraction(across, lightAndView, 1.65);

  // Bandas perladas diagonales.
  let phase = dot(d, vec2f(0.55, -0.35)) + r * 0.35 + t * 0.03;
  let pearlColor = pearl(phase);

  var color = base;
  let ambient = 0.55 + 0.45 * hover;
  // Sheen ancho siempre presente (el ticket brilla aunque nadie lo toque).
  let sheen = exp(-pow((d.x * 0.6 + d.y * 0.8) / 0.55, 2.0));
  color += pearlColor * sheen * 0.22 * ambient;
  color += pearlColor * band * (0.38 + 0.30 * spot) * ambient;
  color += spectrum * (0.60 + 0.50 * hover) * (0.45 + band);
  color += pearlColor * lines * (0.16 + 0.30 * spot * ambient);
  color += WARM_WHITE * glint * spot * (0.12 + 0.22 * hover);
  color += ORANGE_300 * spot * hover * 0.06;
  color += grain(p + vec2f(2.0)) * (0.03 + band * 0.05);

  // Viñeta suave hacia los bordes.
  let v = length(vec2f(p.x / aspect, p.y)) * 1.6;
  color *= 1.0 - 0.22 * smoothstep(0.35, 0.80, v);

  return vec4f(clamp(color, vec3f(0.0), vec3f(1.0)), 1.0);
}
