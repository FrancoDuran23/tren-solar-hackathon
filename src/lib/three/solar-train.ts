/**
 * Tren Solar de la Quebrada — modelo 3D procedural low-poly (three.js).
 *
 * Referencias: public/brand/guideline-solar-train-poster.jpg y solar-train-quebrada.jpg.
 * Es un DÚO (dos coches, cabina en cada extremo), no un tren largo: carrocería blanca,
 * banda de ventanales panorámicos oscura, nariz aerodinámica con parabrisas envolvente,
 * frente navy/negro de parabrisas a paragolpes con logo "M" naranja, faldón naranja
 * continuo que sube en cuña hacia la cabina, display "JUJUY", faros dobles, techo gris
 * con equipos y paneles, bogies y bajos oscuros.
 *
 * Todo se construye con lofts de un perfil de sección redondeada; los colores van por
 * cara (vertex colors, flat shading) según región, así no dependemos de texturas.
 */
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Shape,
  ShapeGeometry,
  Vector2,
  Vector3,
} from 'three';

/* ───────── Dimensiones (unidades de escena) ───────── */
export const CAR_LEN = 3.9; // largo de la caja recta por coche
export const CAR_W = 1.0;
export const CAR_H = 1.3; // alto de la caja (desde el piso de la caja)
export const FLOOR_Y = 0.42; // altura del piso de la caja sobre el riel
export const NOSE_LEN = 1.05;
export const GAP = 0.14; // separación entre coches (fuelle)
export const CARS = 2; // dúo: cabina + cabina (Franco: son DOS vagones)

/* ───────── Paleta ───────── */
const C = {
  white: new Color('#f4f3ee'),
  roof: new Color('#c9ccd1'),
  orange: new Color('#ff5a1f'),
  orangeDeep: new Color('#e04a12'),
  navy: new Color('#0b1d3a'),
  glass: new Color('#1d2c4d'),
  ink: new Color('#1c1f26'),
  ink2: new Color('#2a2f3a'),
};

/* ───────── Perfil de sección: rectángulo redondeado, y de 0 (piso) a CAR_H ───────── */
function sectionProfile(n: number): Vector2[] {
  const w = CAR_W / 2;
  const rTop = 0.24;
  const rBot = 0.07;
  const s = new Shape();
  s.moveTo(-w + rBot, 0);
  s.lineTo(w - rBot, 0);
  s.absarc(w - rBot, rBot, rBot, -Math.PI / 2, 0, false);
  s.lineTo(w, CAR_H - rTop);
  s.absarc(w - rTop, CAR_H - rTop, rTop, 0, Math.PI / 2, false);
  s.lineTo(-w + rTop, CAR_H);
  s.absarc(-w + rTop, CAR_H - rTop, rTop, Math.PI / 2, Math.PI, false);
  s.lineTo(-w, rBot);
  s.absarc(-w + rBot, rBot, rBot, Math.PI, Math.PI * 1.5, false);
  s.closePath();
  return s.getSpacedPoints(n);
}

interface Ring {
  z: number;
  sx: number;
  sy: number;
}

type Painter = (centroid: Vector3, normal: Vector3) => Color;

/**
 * Loft no indexado (flat shading) entre anillos del perfil. Devuelve geometría con
 * `color` según `paint`. `cap` cierra el último anillo con un abanico.
 * `perVertex`: el color se decide por vértice (normal promediada) y se interpola, así
 * los bordes de región que cruzan la malla en diagonal (nariz) no quedan en escalera.
 */
function loft(profile: Vector2[], rings: Ring[], paint: Painter, cap: boolean, perVertex = false): BufferGeometry {
  const pos: number[] = [];
  const col: number[] = [];
  const n = profile.length;
  const R = rings.length;
  const P = (r: Ring, i: number) => new Vector3(profile[i % n]!.x * r.sx, profile[i % n]!.y * r.sy, r.z);
  const faceNormal = (a: Vector3, b: Vector3, c: Vector3) =>
    new Vector3().subVectors(b, a).cross(new Vector3().subVectors(c, a)).normalize();
  const tri = (a: Vector3, b: Vector3, c: Vector3, ca: Color, cb: Color, cc: Color) => {
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    col.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b, cc.r, cc.g, cc.b);
  };
  // El perfil es CCW mirando desde +z. Con anillos en z creciente, el orden
  // (a0, b1, b0) deja la normal hacia afuera; si los anillos van en z decreciente
  // (nariz trasera) se invierte el orden.
  const forward = rings[R - 1]!.z >= rings[0]!.z;
  // Normales por quad (q[r][i]) y por vértice (promedio de los 4 quads vecinos)
  const quadN: Vector3[][] = [];
  for (let r = 0; r < R - 1; r++) {
    quadN.push([]);
    for (let i = 0; i < n; i++) {
      const a0 = P(rings[r]!, i);
      const b0 = P(rings[r + 1]!, i);
      const b1 = P(rings[r + 1]!, i + 1);
      quadN[r]!.push(forward ? faceNormal(a0, b1, b0) : faceNormal(a0, b0, b1));
    }
  }
  const vertColor = (r: number, i: number): Color => {
    const nn = new Vector3();
    const ii = ((i % n) + n) % n;
    const ip = (ii - 1 + n) % n;
    if (r > 0) nn.add(quadN[r - 1]![ii]!).add(quadN[r - 1]![ip]!);
    if (r < R - 1) nn.add(quadN[r]![ii]!).add(quadN[r]![ip]!);
    nn.normalize();
    return paint(P(rings[r]!, ii), nn);
  };
  // Color decidido por quad (no por triángulo) para que los bordes de región no serruchen
  for (let r = 0; r < R - 1; r++) {
    const A = rings[r]!;
    const B = rings[r + 1]!;
    for (let i = 0; i < n; i++) {
      const a0 = P(A, i);
      const a1 = P(A, i + 1);
      const b0 = P(B, i);
      const b1 = P(B, i + 1);
      let ca0: Color, ca1: Color, cb0: Color, cb1: Color;
      if (perVertex) {
        ca0 = vertColor(r, i);
        ca1 = vertColor(r, i + 1);
        cb0 = vertColor(r + 1, i);
        cb1 = vertColor(r + 1, i + 1);
      } else {
        const ctr = new Vector3().addVectors(a0, a1).add(b0).add(b1).multiplyScalar(0.25);
        ca0 = ca1 = cb0 = cb1 = paint(ctr, quadN[r]![i]!);
      }
      if (forward) {
        tri(a0, b1, b0, ca0, cb1, cb0);
        tri(a0, a1, b1, ca0, ca1, cb1);
      } else {
        tri(a0, b0, b1, ca0, cb0, cb1);
        tri(a0, b1, a1, ca0, cb1, ca1);
      }
    }
  }
  if (cap) {
    const L = rings[R - 1]!;
    const c = new Vector3(0, (CAR_H * L.sy) / 2, L.z);
    const capN = new Vector3(0, 0, forward ? 1 : -1);
    for (let i = 0; i < n; i++) {
      // Tapa mirando hacia afuera del extremo (+z si forward, -z si no)
      const a = forward ? P(L, i) : P(L, i + 1);
      const b = forward ? P(L, i + 1) : P(L, i);
      if (perVertex) {
        tri(a, b, c, paint(a, capN), paint(b, capN), paint(c, capN));
      } else {
        const ctr = new Vector3().addVectors(a, b).add(c).multiplyScalar(1 / 3);
        const cc = paint(ctr, faceNormal(a, b, c));
        tri(a, b, c, cc, cc, cc);
      }
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

/* Curvas de la nariz: t = 0 en la unión con la caja, 1 en la punta */
// Frente ancho (poster): la planta apenas se estrecha; el techo baja en el parabrisas
const noseSX = (t: number) => 1 - 0.3 * Math.pow(t, 2.4);
const noseSY = (t: number) => 1 - 0.42 * Math.pow(t, 1.9);

/** Pintor de la caja recta */
function paintBody(c: Vector3, n: Vector3): Color {
  if (n.y > 0.72) return C.roof;
  if (c.y < 0.11 * CAR_H) return C.orange;
  if (c.y < 0.135 * CAR_H && Math.abs(n.x) > 0.5) return C.orange;
  if (n.y < -0.5) return C.ink;
  return C.white;
}

const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};
const mix = (a: Color, b: Color, t: number) => (t <= 0 ? a : t >= 1 ? b : a.clone().lerp(b, t));

/**
 * Pintor de la nariz; `dir` = +1 si la punta mira a +z. Los bordes que cruzan la malla
 * en diagonal (cuña naranja, parabrisas) se mezclan en ~1 quad para que, interpolados
 * por vértice, queden rectos y no en escalera. La cara frontal plana va aparte.
 */
function paintNose(z0: number, dir: 1 | -1): Painter {
  const E = 0.02; // ancho de mezcla (la interpolación por quad agrega el resto)
  return (c, n) => {
    const t = Math.min(1, Math.max(0, Math.abs(c.z - z0) / NOSE_LEN));
    const fwd = n.z * dir;
    if (n.y < -0.5) return C.ink;
    const skirtTop = CAR_H * (0.11 + 0.3 * Math.pow(t, 1.3));
    const orange = t > 0.75 ? C.orangeDeep : C.orange;
    let base: Color = n.y > 0.72 ? C.roof : C.white;
    // Parabrisas envolvente: la pendiente del techo que mira adelante (centro); parantes blancos
    if (fwd > 0.22 && n.y > 0.12) {
      const g = smooth(0.46 * CAR_H, 0.46 * CAR_H + E, c.y) * (1 - smooth(0.55, 0.68, Math.abs(n.x)));
      base = mix(base, C.glass, g);
    }
    // Faldón naranja: banda continua que sube en cuña hacia la cabina (poster)
    const side = Math.max(smooth(0.18, 0.3, Math.abs(n.x)), smooth(0.4, 0.55, fwd));
    const k = side * (1 - smooth(skirtTop - E, skirtTop + E, c.y));
    return mix(base, orange, k);
  };
}

/** Recorta un polígono (CCW) a la banda y0 ≤ y ≤ y1 (Sutherland–Hodgman) */
function clipBandY(poly: Vector2[], y0: number, y1: number): Vector2[] {
  const clip = (pts: Vector2[], inside: (p: Vector2) => boolean, yCut: number) => {
    const out: Vector2[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]!;
      const b = pts[(i + 1) % pts.length]!;
      const ia = inside(a);
      const ib = inside(b);
      if (ia) out.push(a);
      if (ia !== ib) {
        const u = (yCut - a.y) / (b.y - a.y);
        out.push(new Vector2(a.x + (b.x - a.x) * u, yCut));
      }
    }
    return out;
  };
  return clip(clip(poly, (p) => p.y >= y0, y0), (p) => p.y <= y1, y1);
}

function box(w: number, h: number, d: number, mat: MeshStandardMaterial, x: number, y: number, z: number): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export interface SolarTrain {
  /** Contenedor: vía fija + `cars` */
  group: Group;
  /** Los coches (lo que avanza por la vía, eje +z = adelante) */
  cars: Group;
  /** Ruedas (giran con el avance; rotación sobre el eje x local) */
  wheels: Mesh[];
  /** Radio de rueda */
  wheelRadius: number;
  /** Punta de la nariz delantera (coords de `cars`) */
  noseTip: Vector3;
  /** Largo total */
  length: number;
  /** Largo de la vía construida (centrada en z = 0) */
  trackLength: number;
  materials: MeshStandardMaterial[];
}

/** Largo de la vía (el tren recorre ±trackLength/2 menos su propio largo) */
export const TRACK_LEN = 110;

export function buildSolarTrain(): SolarTrain {
  const group = new Group();
  const cars = new Group();
  group.add(cars);
  const wheels: Mesh[] = [];
  const WHEEL_R = 0.17;
  const profile = sectionProfile(96);

  const bodyMat = new MeshStandardMaterial({ vertexColors: true, roughness: 0.48, metalness: 0.06, flatShading: true });
  const glassMat = new MeshStandardMaterial({
    color: C.glass,
    roughness: 0.18,
    metalness: 0.55,
    emissive: new Color('#2a4e86'),
    emissiveIntensity: 0.18,
  });
  const inkMat = new MeshStandardMaterial({ color: C.ink, roughness: 0.85, metalness: 0.1, flatShading: true });
  const darkMat = new MeshStandardMaterial({ color: C.ink2, roughness: 0.7, metalness: 0.2, flatShading: true });
  const panelMat = new MeshStandardMaterial({
    color: new Color('#22304d'),
    roughness: 0.2,
    metalness: 0.6,
    emissive: new Color('#2a4e86'),
    emissiveIntensity: 0.3,
  });
  const orangeMat = new MeshStandardMaterial({
    color: C.orange,
    emissive: C.orange,
    emissiveIntensity: 0.55,
    roughness: 0.5,
  });
  const lampMat = new MeshStandardMaterial({
    color: new Color('#fff6e0'),
    emissive: new Color('#ffe9b0'),
    emissiveIntensity: 2.6,
    roughness: 0.3,
  });
  const materials = [bodyMat, glassMat, inkMat, darkMat, panelMat, orangeMat, lampMat];

  const wheelGeo = new CylinderGeometry(WHEEL_R, WHEEL_R, 0.06, 14);
  const pitch = CAR_LEN + GAP;
  const total = CARS * CAR_LEN + (CARS - 1) * GAP + 2 * NOSE_LEN;
  const z0 = -(CARS * CAR_LEN + (CARS - 1) * GAP) / 2; // inicio del primer coche

  for (let k = 0; k < CARS; k++) {
    const car = new Group();
    const zs = z0 + k * pitch;
    const ze = zs + CAR_LEN;
    car.position.y = FLOOR_Y;

    /* Caja */
    const body = new Mesh(loft(profile, [{ z: zs, sx: 1, sy: 1 }, { z: ze, sx: 1, sy: 1 }], paintBody, false), bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    car.add(body);

    /* Ventanales panorámicos: banda ALTA (≈60% de la caja, como en el poster: del
       faldón casi hasta el techo), pocos paños largos con parantes blancos finos */
    const winY0 = 0.33 * CAR_H;
    const winY1 = 0.92 * CAR_H;
    const doorW = 0.3;
    const inner0 = zs + doorW + 0.1;
    const inner1 = ze - doorW - 0.1;
    const span = inner1 - inner0;
    const nWin = 3;
    const gapW = 0.04;
    const winW = (span - gapW * (nWin - 1)) / nWin;
    for (const side of [-1, 1]) {
      const x = side * (CAR_W / 2 + 0.006);
      for (let i = 0; i < nWin; i++) {
        const zc = inner0 + winW / 2 + i * (winW + gapW);
        car.add(box(0.012, winY1 - winY0, winW, glassMat, x, (winY0 + winY1) / 2, zc));
      }
      // Puertas: hoja oscura a cada extremo del coche, con vidrio a la altura de la banda
      for (const zd of [zs + 0.05 + doorW / 2, ze - 0.05 - doorW / 2]) {
        car.add(box(0.012, 0.94 * CAR_H - 0.14, doorW, darkMat, x, (0.94 * CAR_H + 0.14) / 2, zd));
        car.add(box(0.016, winY1 - winY0 - 0.1, doorW - 0.08, glassMat, x, (winY0 + winY1) / 2, zd));
      }
    }

    /* Techo: paneles solares + equipamiento */
    const nPanel = 3;
    const panelL = (CAR_LEN - 0.6) / nPanel - 0.1;
    for (let i = 0; i < nPanel; i++) {
      const zc = zs + 0.3 + panelL / 2 + i * (panelL + 0.1);
      car.add(box(0.36, 0.03, panelL, panelMat, 0, CAR_H + 0.012, zc));
    }
    car.add(box(0.34, 0.12, 0.5, darkMat, 0, CAR_H + 0.06, zs + CAR_LEN * 0.5));

    /* Bajos y bogies */
    car.add(box(CAR_W * 0.84, 0.22, CAR_LEN - 0.3, inkMat, 0, -0.11, (zs + ze) / 2));
    for (const zb of [zs + 0.75, ze - 0.75]) {
      car.add(box(0.7, 0.16, 0.9, darkMat, 0, -0.26, zb));
      for (const side of [-1, 1])
        for (const dz of [-0.28, 0.28]) {
          const wheel = new Mesh(wheelGeo, darkMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(side * 0.4, -FLOOR_Y + WHEEL_R, zb + dz);
          wheel.castShadow = true;
          car.add(wheel);
          wheels.push(wheel);
        }
    }

    /* Fuelle entre coches */
    if (k < CARS - 1) car.add(box(CAR_W * 0.86, CAR_H * 0.92, GAP + 0.04, inkMat, 0, CAR_H * 0.47, ze + GAP / 2));

    /* Narices en los extremos del tren */
    const noses: Array<{ at: number; dir: 1 | -1 }> = [];
    if (k === CARS - 1) noses.push({ at: ze, dir: 1 });
    if (k === 0) noses.push({ at: zs, dir: -1 });
    for (const { at, dir } of noses) {
      const rings: Ring[] = [];
      const N = 56;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        rings.push({ z: at + dir * t * NOSE_LEN, sx: noseSX(t), sy: noseSY(t) });
      }
      const nose = new Mesh(loft(profile, rings, paintNose(at, dir), false, true), bodyMat);
      nose.castShadow = true;
      nose.receiveShadow = true;
      car.add(nose);
      // Ventana lateral de cabina: la banda panorámica sigue hasta el parabrisas
      for (const side of [-1, 1]) {
        const cabW = 0.26;
        car.add(
          box(0.012, winY1 - winY0, cabW, glassMat, side * (CAR_W / 2 * 0.988), (winY0 + winY1) / 2, at + dir * (0.02 + cabW / 2)),
        );
      }

      const tipZ = at + dir * NOSE_LEN;
      const tipSX = noseSX(1);
      const tipSY = noseSY(1);
      // Cara frontal plana, en tres bandas (poster): franja negra con faros arriba,
      // panel blanco con la "M" en el medio, paragolpes oscuro abajo.
      const tipPoly = profile.map((q) => new Vector2(q.x * tipSX, q.y * tipSY));
      const bands: Array<[number, number, Color]> = [
        [0, 0.12 * CAR_H, C.ink],
        [0.12 * CAR_H, 0.37 * CAR_H, C.white],
        [0.37 * CAR_H, CAR_H, C.navy],
      ];
      for (const [b0, b1, color] of bands) {
        const poly = clipBandY(tipPoly, b0, b1);
        if (poly.length < 3) continue;
        const sg = new ShapeGeometry(new Shape(poly));
        const cnt = sg.getAttribute('position').count;
        const cols: number[] = [];
        for (let i = 0; i < cnt; i++) cols.push(color.r, color.g, color.b);
        sg.setAttribute('color', new Float32BufferAttribute(cols, 3));
        const plate = new Mesh(sg, bodyMat);
        plate.position.z = tipZ - dir * 0.002;
        if (dir < 0) plate.rotation.y = Math.PI;
        plate.castShadow = true;
        car.add(plate);
      }
      // Faros
      for (const side of [-1, 1])
        for (const k2 of [0, 1]) {
          const lamp = new Mesh(new CylinderGeometry(0.034, 0.034, 0.03, 12), lampMat);
          lamp.rotation.x = Math.PI / 2;
          lamp.position.set(side * tipSX * CAR_W * (0.27 + 0.14 * k2), CAR_H * 0.43, tipZ + dir * 0.012);
          car.add(lamp);
        }
      // Paragolpes navy (placa plana sobre la trompa) + logo "M" naranja
      // Paragolpes / acople (caja oscura baja en la punta)
      car.add(box(tipSX * CAR_W - 0.1, 0.1 * CAR_H, 0.08, inkMat, 0, 0.06 * CAR_H, tipZ + dir * 0.03));
      car.add(box(0.18, 0.14, 0.12, darkMat, 0, 0.1 * CAR_H, tipZ + dir * 0.06));
      const m = new Shape();
      m.moveTo(-0.11, 0);
      m.lineTo(-0.045, 0.1);
      m.lineTo(0, 0.045);
      m.lineTo(0.045, 0.1);
      m.lineTo(0.11, 0);
      m.lineTo(0.06, 0);
      m.lineTo(0.045, 0.045);
      m.lineTo(0, -0.0);
      m.lineTo(-0.045, 0.045);
      m.lineTo(-0.06, 0);
      m.closePath();
      const logo = new Mesh(new ShapeGeometry(m), orangeMat);
      logo.scale.setScalar(1.35);
      logo.position.set(0, CAR_H * 0.22, tipZ + dir * 0.03);
      if (dir < 0) logo.rotation.y = Math.PI;
      car.add(logo);
      // Display "JUJUY" (franja naranja luminosa sobre el parabrisas)
      const tD = 0.3;
      const disp = box(0.42, 0.06, 0.025, orangeMat, 0, noseSY(tD) * CAR_H + 0.012, at + dir * tD * NOSE_LEN);
      disp.rotation.x = dir * -0.45;
      car.add(disp);
      // Bajos bajo la nariz (parachoques)
      car.add(box(CAR_W * 0.62 * tipSX + 0.2, 0.2, NOSE_LEN * 0.8, inkMat, 0, -0.1, at + dir * NOSE_LEN * 0.4));
      car.add(box(0.5, 0.1, 0.08, darkMat, 0, 0.06, tipZ - dir * 0.02));
    }

    cars.add(car);
  }

  /* Vía fija: rieles + durmientes (referencia estática para leer el avance) */
  const railMat = new MeshStandardMaterial({ color: new Color('#5a606c'), roughness: 0.3, metalness: 0.75 });
  for (const side of [-1, 1]) {
    const rail = new Mesh(new BoxGeometry(0.05, 0.05, TRACK_LEN), railMat);
    rail.position.set(side * 0.42, 0.025, 0);
    rail.receiveShadow = true;
    group.add(rail);
  }
  materials.push(railMat);
  const sleeperMat = new MeshStandardMaterial({ color: new Color('#2b2f3a'), roughness: 0.9, metalness: 0.05 });
  materials.push(sleeperMat);
  const sleeperPitch = 0.62;
  const nSleeper = Math.floor(TRACK_LEN / sleeperPitch);
  const sleepers = new InstancedMesh(new BoxGeometry(1.2, 0.05, 0.2), sleeperMat, nSleeper);
  const m4 = new Matrix4();
  for (let i = 0; i < nSleeper; i++) {
    m4.makeTranslation(0, -0.025, -TRACK_LEN / 2 + sleeperPitch * (i + 0.5));
    sleepers.setMatrixAt(i, m4);
  }
  sleepers.instanceMatrix.needsUpdate = true;
  sleepers.receiveShadow = true;
  group.add(sleepers);

  const noseTip = new Vector3(0, FLOOR_Y + (noseSY(1) * CAR_H) / 2, z0 + CARS * CAR_LEN + (CARS - 1) * GAP + NOSE_LEN);
  return { group, cars, wheels, wheelRadius: WHEEL_R, noseTip, length: total, trackLength: TRACK_LEN, materials };
}
