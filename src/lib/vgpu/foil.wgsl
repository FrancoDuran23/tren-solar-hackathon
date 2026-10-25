// Foil plateado holográfico del ticket Pre-Hackatón (vgpu / WebGPU).
//
// Capa única opaca que pinta el cuerpo del ticket como una lámina de metal
// cepillado: bandas de cromo claras/oscuras, veta fina, y encima un holograma
// de seguridad que reacciona a la luz (puntero en hover, órbita lenta en
// reposo): iridiscencia espectral ancha, guilloché grabado que difracta,
// destello blanco y grano. Sin textura: todo procedural. El DOM va encima en
// tinta navy, así que la luminancia se mantiene entre ~0.40 y ~0.95.

struct Params {
  resolution: vec2f,
  pointer: vec2f,
  tilt: vec2f,
  hover: f32,
  time: f32,
}
@group(0) @binding(0) var<uniform> params: Params;

const SILVER_DK = vec3f(0.37, 0.40, 0.46);
const SILVER_MD = vec3f(0.66, 0.69, 0.74);
const SILVER_LT = vec3f(0.90, 0.92, 0.95);
const WARM_WHITE = vec3f(1.0, 0.97, 0.93);
const ORANGE_300 = vec3f(1.0, 0.541, 0.239);
const LUMA = vec3f(0.299, 0.587, 0.114);

fn stroke(d: f32, w: f32, aa: f32) -> f32 {
  return 1.0 - smoothstep(w, w + aa, abs(d));
}

fn hash11(x: f32) -> f32 {
  return fract(sin(x * 127.1) * 43758.5453);
}

// Ruido 1D suave: veta del cepillado (constante a lo largo de X).
fn noise1(x: f32) -> f32 {
  let i = floor(x);
  let f = fract(x);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(hash11(i), hash11(i + 1.0), u);
}

fn grain(point: vec2f) -> f32 {
  let p = vec2u(abs(point) * 2400.0);
  var n = (p.x * 1597334677u) ^ (p.y * 3812015801u);
  n = (n ^ (n >> 16u)) * 2246822519u;
  return f32(n & 1023u) / 1023.0 - 0.5;
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

// Arcoíris pastel de holograma de seguridad: ciclo completo del espectro,
// normalizado y lavado hacia blanco para no ensuciar el metal.
fn spectrum(t: f32) -> vec3f {
  let wl = 0.405 + 0.295 * fract(t);
  let c = wavelengthColor(wl);
  let peak = max(max(c.r, c.g), max(c.b, 0.001));
  return mix(vec3f(1.0), c / peak, 0.58);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let res = max(params.resolution, vec2f(1.0));
  let aspect = res.x / res.y;
  let p = vec2f((uv.x - 0.5) * aspect, uv.y - 0.5);
  let hover = clamp(params.hover, 0.0, 1.0);
  let t = params.time;

  // Luz: sigue al puntero en hover; en reposo orbita despacio para que el foil viva solo.
  let orbit = vec2f(sin(t * 0.27) * 0.45 * aspect, cos(t * 0.19) * 0.32);
  let ptr = vec2f(params.pointer.x * aspect, params.pointer.y);
  let light = mix(orbit, ptr, hover);
  let d = p - light;
  let tilt = params.tilt;

  // ── Metal cepillado ──
  // Bandas de cromo: reflejo de un entorno abstracto que se desplaza con el tilt.
  let env = dot(p, vec2f(0.55, 1.35)) * 3.2 + tilt.y * 2.5 + tilt.x * 1.2;
  let bands = 0.5 + 0.34 * sin(env) + 0.12 * sin(env * 2.7 + 1.3);
  // Veta horizontal fina (dos octavas) + una más gruesa.
  let streak = (noise1(p.y * 520.0 + 17.0) - 0.5) * 0.09
    + (noise1(p.y * 1700.0 + 3.0) - 0.5) * 0.05
    + (noise1(p.y * 90.0) - 0.5) * 0.06;
  var color = mix(SILVER_DK, SILVER_LT, clamp(bands, 0.0, 1.0));
  color += streak;
  // Reflejo anisótropo: el metal cepillado estira el brillo a lo largo de la veta.
  let aniso = exp(-pow(d.y / 0.20, 2.0)) * exp(-pow(d.x / (0.95 * aspect), 2.0));
  color += SILVER_LT * aniso * 0.16;

  // ── Barrido de luz rasante + glint ──
  let wobble = sin(p.y * 6.0 + p.x * 3.0 + t * 0.35) * 0.05;
  let sd = (d.x * 0.76 + d.y * 0.56 + wobble) / 0.30;
  let band = exp(-sd * sd);
  let glint = exp(-sd * sd * 16.0);
  let spot = exp(-dot(d, d) * 1.8);

  // ── Guilloché grabado (anillos concéntricos deformados) que difracta ──
  let warp = vec2f(sin(p.y * 7.0 + sin(p.x * 4.0)) * 0.07, sin(p.x * 6.0 - p.y * 3.0) * 0.06);
  let q = p + warp - vec2f(0.36 * aspect, 0.42);
  let r = length(q * vec2f(1.0, 0.85));
  let contour = r * 70.0 + sin(atan2(q.y, q.x) * 5.0 + r * 9.0) * 1.4;
  let lines = stroke(sin(contour), 0.08, min(fwidth(contour), 1.0));
  let grad = vec2f(dpdx(contour), dpdy(contour));
  let across = grad / max(length(grad), 0.000001);
  let lightAndView = normalize(-d * 0.6 + vec2f(0.0, -0.35));
  let spectral = diffraction(across, lightAndView, 1.65);

  // ── Iridiscencia ancha (holograma): tiñe el metal conservando su luminancia ──
  let phase = dot(d, vec2f(0.62, -0.40)) * 1.35 + r * 0.30 + t * 0.025;
  let holo = spectrum(phase);
  let holo2 = spectrum(phase * 0.5 + 0.37 + d.x * 0.3);
  let lum = dot(color, LUMA);
  let tinted = holo * (lum / max(dot(holo, LUMA), 0.25));
  let tinted2 = holo2 * (lum / max(dot(holo2, LUMA), 0.25));
  let ambient = 0.6 + 0.4 * hover;
  // Siempre hay un velo iridiscente suave, más saturado dentro del barrido de luz.
  let sheen = exp(-pow((d.x * 0.6 + d.y * 0.8) / 0.60, 2.0));
  color = mix(color, tinted2, 0.09 * ambient);
  color = mix(color, tinted, (0.12 * sheen + 0.40 * band) * ambient);

  // Difracción espectral sobre el grabado y un eco suave fuera de las líneas.
  color += spectral * (0.40 + 0.40 * hover) * (0.18 + band) * (0.12 + 0.88 * lines);
  color += holo * lines * (0.05 + 0.16 * spot * ambient);
  // Destello blanco cálido en el centro del barrido.
  color += WARM_WHITE * glint * (0.06 + 0.12 * spot) * (0.7 + 0.3 * hover);
  color += ORANGE_300 * spot * hover * 0.05;
  color += grain(p + vec2f(2.0)) * (0.035 + band * 0.04);

  // Luz de canto arriba-izquierda y viñeta hacia los bordes.
  let rim = exp(-max(p.y + 0.5, 0.0) * 7.0) * 0.12 + exp(-max(p.x + 0.5 * aspect, 0.0) * 7.0) * 0.08;
  color += SILVER_LT * rim;
  let v = length(vec2f(p.x / aspect, p.y)) * 1.6;
  color *= 1.0 - 0.16 * smoothstep(0.40, 0.85, v);

  return vec4f(clamp(color, vec3f(0.0), vec3f(1.0)), 1.0);
}
