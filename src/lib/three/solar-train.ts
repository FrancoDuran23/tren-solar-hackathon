/**
 * Tren Solar de la Quebrada — modelo 3D procedural low-poly (three.js).
 *
 * Referencias: public/brand/guideline-solar-train-poster.jpg y solar-train-quebrada.jpg.
 * Lectura buscada: dúo/tren turístico moderno (CRRC), carrocería blanca, banda de
 * ventanales panorámicos oscura, nariz aerodinámica con parabrisas envolvente sobre
 * frente navy con logo "M" naranja, faldón naranja que sube hacia la cabina, techo gris
 * con paneles solares, bogies y bajos oscuros.
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
  Mesh,
  MeshStandardMaterial,
  Shape,
  ShapeGeometry,
  Vector2,
  Vector3,
} from 'three';

/* ───────── Dimensiones (unidades de escena) ───────── */
export const CAR_LEN = 3.4; // largo de la caja recta por coche
export const CAR_W = 1.0;
export const CAR_H = 1.3; // alto de la caja (desde el piso de la caja)
export const FLOOR_Y = 0.42; // altura del piso de la caja sobre el riel
export const NOSE_LEN = 1.05;
export const GAP = 0.14; // separación entre coches (fuelle)
export const CARS = 3;

/* ───────── Paleta ───────── */
const C = {
  white: new Color('#f4f3ee'),
  roof: new Color('#c9ccd1'),
  orange: new Color('#ff5a1f'),
  orangeDeep: new Color('#e04a12'),
  navy: new Color('#0b1d3a'),
  glass: new Color('#131c30'),
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
 * `color` por cara según `paint`. `cap` cierra el último anillo con un abanico.
 */
function loft(profile: Vector2[], rings: Ring[], paint: Painter, cap: boolean): BufferGeometry {
  const pos: number[] = [];
  const col: number[] = [];
  const n = profile.length;
  const P = (r: Ring, i: number) => new Vector3(profile[i % n]!.x * r.sx, profile[i % n]!.y * r.sy, r.z);
  const faceNormal = (a: Vector3, b: Vector3, c: Vector3) =>
    new Vector3().subVectors(b, a).cross(new Vector3().subVectors(c, a)).normalize();
  const tri = (a: Vector3, b: Vector3, c: Vector3, color: Color) => {
    for (const v of [a, b, c]) {
      pos.push(v.x, v.y, v.z);
      col.push(color.r, color.g, color.b);
    }
  };
  // El perfil es CCW mirando desde +z. Con anillos en z creciente, el orden
  // (a0, b1, b0) deja la normal hacia afuera; si los anillos van en z decreciente
  // (nariz trasera) se invierte el orden.
  const forward = rings[rings.length - 1]!.z >= rings[0]!.z;
  // Color decidido por quad (no por triángulo) para que los bordes de región no serruchen
  for (let r = 0; r < rings.length - 1; r++) {
    const A = rings[r]!;
    const B = rings[r + 1]!;
    for (let i = 0; i < n; i++) {
      const a0 = P(A, i);
      const a1 = P(A, i + 1);
      const b0 = P(B, i);
      const b1 = P(B, i + 1);
      const ctr = new Vector3().addVectors(a0, a1).add(b0).add(b1).multiplyScalar(0.25);
      if (forward) {
        const color = paint(ctr, faceNormal(a0, b1, b0));
        tri(a0, b1, b0, color);
        tri(a0, a1, b1, color);
      } else {
        const color = paint(ctr, faceNormal(a0, b0, b1));
        tri(a0, b0, b1, color);
        tri(a0, b1, a1, color);
      }
    }
  }
  if (cap) {
    const L = rings[rings.length - 1]!;
    const c = new Vector3(0, (CAR_H * L.sy) / 2, L.z);
    for (let i = 0; i < n; i++) {
      // Tapa mirando hacia afuera del extremo (+z si forward, -z si no)
      const a = forward ? P(L, i) : P(L, i + 1);
      const b = forward ? P(L, i + 1) : P(L, i);
      const ctr = new Vector3().addVectors(a, b).add(c).multiplyScalar(1 / 3);
      tri(a, b, c, paint(ctr, faceNormal(a, b, c)));
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

/* Curvas de la nariz: t = 0 en la unión con la caja, 1 en la punta */
const noseSX = (t: number) => 1 - 0.64 * Math.pow(t, 2.1);
const noseSY = (t: number) => 1 - 0.5 * Math.pow(t, 1.6);

/** Pintor de la caja recta */
function paintBody(c: Vector3, n: Vector3): Color {
  if (n.y > 0.72) return C.roof;
  if (c.y < 0.11 * CAR_H) return C.orange;
  if (n.y < -0.5) return C.ink;
  return C.white;
}

/** Pintor de la nariz; `dir` = +1 si la punta mira a +z */
function paintNose(z0: number, dir: 1 | -1): Painter {
  return (c, n) => {
    const t = Math.min(1, Math.max(0, (Math.abs(c.z - z0) / NOSE_LEN)));
    const fwd = n.z * dir;
    if (n.y < -0.5) return C.ink;
    // Parabrisas envolvente: zona alta que ya se inclina hacia adelante
    if (fwd > 0.32 && c.y > 0.58 * CAR_H) return C.glass;
    // (El paragolpes navy es una placa aparte, ver buildSolarTrain; la trompa queda blanca)
    // Faldón naranja lateral que sube hacia la cabina
    if (Math.abs(n.x) > 0.35 && c.y < CAR_H * (0.11 + 0.16 * t)) return t > 0.6 ? C.orangeDeep : C.orange;
    if (n.y > 0.72) return C.roof;
    return C.white;
  };
}

function box(w: number, h: number, d: number, mat: MeshStandardMaterial, x: number, y: number, z: number): Mesh {
  const m = new Mesh(new BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export interface SolarTrain {
  group: Group;
  /** Punta de la nariz delantera (coords del grupo) */
  noseTip: Vector3;
  /** Largo total */
  length: number;
  materials: MeshStandardMaterial[];
}

export function buildSolarTrain(): SolarTrain {
  const group = new Group();
  const profile = sectionProfile(40);

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
    emissiveIntensity: 1.3,
    roughness: 0.3,
  });
  const materials = [bodyMat, glassMat, inkMat, darkMat, panelMat, orangeMat, lampMat];

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

    /* Ventanales panorámicos (banda oscura con parantes blancos) y puertas */
    const winY0 = 0.62 * CAR_H;
    const winY1 = 0.93 * CAR_H;
    const doorW = 0.3;
    const inner0 = zs + doorW + 0.1;
    const inner1 = ze - doorW - 0.1;
    const span = inner1 - inner0;
    const nWin = 4;
    const gapW = 0.045;
    const winW = (span - gapW * (nWin - 1)) / nWin;
    for (const side of [-1, 1]) {
      const x = side * (CAR_W / 2 + 0.006);
      for (let i = 0; i < nWin; i++) {
        const zc = inner0 + winW / 2 + i * (winW + gapW);
        car.add(box(0.012, winY1 - winY0, winW, glassMat, x, (winY0 + winY1) / 2, zc));
      }
      // Puertas: panel oscuro a cada extremo del coche
      for (const zd of [zs + 0.05 + doorW / 2, ze - 0.05 - doorW / 2]) {
        car.add(box(0.012, 0.94 * CAR_H - 0.06, doorW, darkMat, x, (0.94 * CAR_H + 0.06) / 2, zd));
        car.add(box(0.016, winY1 - winY0 - 0.08, doorW - 0.08, glassMat, x, (winY0 + winY1) / 2 + 0.02, zd));
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
          const wheel = new Mesh(new CylinderGeometry(0.17, 0.17, 0.06, 14), darkMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(side * 0.4, -FLOOR_Y + 0.17, zb + dz);
          wheel.castShadow = true;
          car.add(wheel);
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
      const N = 30;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        rings.push({ z: at + dir * t * NOSE_LEN, sx: noseSX(t), sy: noseSY(t) });
      }
      const nose = new Mesh(loft(profile, rings, paintNose(at, dir), true), bodyMat);
      nose.castShadow = true;
      nose.receiveShadow = true;
      car.add(nose);

      const tipZ = at + dir * NOSE_LEN;
      const tipSX = noseSX(1);
      // Faros
      for (const side of [-1, 1]) {
        const lamp = new Mesh(new CylinderGeometry(0.03, 0.03, 0.03, 12), lampMat);
        lamp.rotation.x = Math.PI / 2;
        lamp.position.set(side * tipSX * CAR_W * 0.33, CAR_H * 0.42, tipZ + dir * 0.004);
        car.add(lamp);
      }
      // Paragolpes navy (placa plana sobre la trompa) + logo "M" naranja
      const navyMat = new MeshStandardMaterial({ color: C.navy, roughness: 0.6, metalness: 0.1 });
      materials.push(navyMat);
      car.add(box(tipSX * CAR_W - 0.03, 0.34 * CAR_H, 0.03, navyMat, 0, 0.17 * CAR_H, tipZ + dir * 0.005));
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
      logo.position.set(0, CAR_H * 0.13, tipZ + dir * 0.024);
      if (dir < 0) logo.rotation.y = Math.PI;
      car.add(logo);
      // Display "JUJUY" (franja naranja luminosa sobre el parabrisas)
      const tD = 0.12;
      const disp = box(0.34, 0.045, 0.02, orangeMat, 0, noseSY(tD) * CAR_H * 0.985, at + dir * tD * NOSE_LEN);
      disp.rotation.x = dir * -0.35;
      car.add(disp);
      // Bajos bajo la nariz (parachoques)
      car.add(box(CAR_W * 0.62 * tipSX + 0.2, 0.2, NOSE_LEN * 0.8, inkMat, 0, -0.1, at + dir * NOSE_LEN * 0.4));
      car.add(box(0.5, 0.1, 0.08, darkMat, 0, 0.06, tipZ - dir * 0.02));
    }

    group.add(car);
  }

  /* Rieles */
  const railMat = new MeshStandardMaterial({ color: new Color('#4a505c'), roughness: 0.35, metalness: 0.7 });
  for (const side of [-1, 1]) {
    const rail = new Mesh(new BoxGeometry(0.05, 0.05, total * 2.2), railMat);
    rail.position.set(side * 0.42, 0.025, 0);
    rail.receiveShadow = true;
    group.add(rail);
  }
  materials.push(railMat);

  const noseTip = new Vector3(0, FLOOR_Y + (noseSY(1) * CAR_H) / 2, z0 + CARS * CAR_LEN + (CARS - 1) * GAP + NOSE_LEN);
  return { group, noseTip, length: total, materials };
}
