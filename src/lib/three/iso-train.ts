/**
 * Tren Solar 3D isométrico sobre el mapa del recorrido (#recorrido).
 *
 * El mapa es un SVG plano (viewBox 680×385). Encima va un canvas transparente del mismo
 * tamaño con una cámara ORTOGRÁFICA inclinada (isométrica). El plano del suelo (y = 0)
 * se proyecta a la pantalla con una transformación afín, así que la invertimos: cada
 * punto del path del SVG se lleva al suelo 3D y el tren queda "parado" exactamente
 * sobre la ruta naranja, con la nariz apuntando según la tangente del path.
 *
 * El dúo (ver ./solar-train.ts) va articulado: cada coche se ubica por separado en el
 * path, a una distancia fija (en unidades de mundo) del centro del tren, así en las
 * curvas los dos coches giran de verdad. Las ruedas giran con el avance.
 *
 * Movimiento: `tour()` recorre Volcán → Tilcara (ida) avisando cada estación que pasa;
 * `goTo(i)` se desplaza con easing hasta la estación i. Sin animación en curso no hay
 * requestAnimationFrame; fuera del viewport tampoco.
 */
import {
  ACESFilmicToneMapping,
  AmbientLight,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  Object3D,
  OrthographicCamera,
  PCFShadowMap,
  PlaneGeometry,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { buildSolarTrain, CAR_LEN, GAP, CARS } from './solar-train';

export interface IsoTrainOptions {
  /** Path de la ruta (coords del viewBox). Las longitudes de `stops` son sobre este path. */
  path: SVGPathElement;
  /** Longitud sobre el path de cada estación */
  stops: number[];
  /** Tamaño del viewBox del SVG */
  viewBox: { w: number; h: number };
  /** Estación inicial */
  start?: number;
  /** Sin animación: salta directo */
  reducedMotion?: boolean;
  /** Se llama cuando el tren, en el tour, pasa por una estación */
  onStation?: (i: number) => void;
  /** Overrides de encuadre (tuning) */
  view?: Partial<{ scale: number; az: number; el: number }>;
}

export interface IsoTrainHandle {
  /** Va con easing a la estación i (cancela el tour) */
  goTo(i: number): void;
  /** Recorre desde la estación actual hasta la última, avisando con onStation */
  tour(): void;
  /** Hay animación en curso */
  moving(): boolean;
  destroy(): void;
}

/** Unidades del SVG por unidad de mundo (largo del dúo ≈ 10 u → ≈ 62 px del viewBox).
 *  T27: 6.2 ≈ 0.65 × los 9.5 de T26; el dúo queda proporcional al trazado y no tapa labels. */
const SCALE = 6.2;
/** Azimut de cámara (rad): 0 mira a −z; con ~0.78 un tren que va "a la derecha" muestra el lateral */
const AZ = 0.78;
/** Elevación de cámara (rad): 35.26° es la isométrica exacta; algo menos muestra más lateral */
const EL = 0.47;
/** Duración del tour completo (s) */
const TOUR_SECONDS = 16;
/** Velocidad máx. al ir a una estación (px del viewBox por segundo) */
const GO_SPEED = 240;

const easeInOutCubic = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const easeInOutSine = (k: number) => -(Math.cos(Math.PI * k) - 1) / 2;

export function mountIsoTrain(canvas: HTMLCanvasElement, opts: IsoTrainOptions): IsoTrainHandle {
  const { path, stops, viewBox } = opts;
  const reduced = !!opts.reducedMotion;
  /* Path suavizado: muestreo a 1 px y promedio móvil (±SMOOTH px, ventana simétrica que se
     achica en los extremos para que Volcán y Tilcara queden exactos). El trazado OSM tiene
     quiebres chicos; sin esto el dúo articulado "serrucha". La desviación queda dentro del
     halo de la ruta. Las longitudes de estación (sobre el path original) se mapean por índice. */
  const SMOOTH = 16;
  const rawTotal = path.getTotalLength();
  const N = Math.ceil(rawTotal);
  const raw: Vector2[] = [];
  for (let i = 0; i <= N; i++) {
    const p = path.getPointAtLength(Math.min(rawTotal, i));
    raw.push(new Vector2(p.x, p.y));
  }
  const pts: Vector2[] = raw.map((_, i) => {
    const half = Math.min(SMOOTH, i, N - i);
    const v = new Vector2();
    for (let j = i - half; j <= i + half; j++) v.add(raw[j]!);
    return v.multiplyScalar(1 / (2 * half + 1));
  });
  const cum: number[] = [0];
  for (let i = 1; i <= N; i++) cum.push(cum[i - 1]! + pts[i]!.distanceTo(pts[i - 1]!));
  const total = cum[N]!;
  const smoothLen = (l: number) => cum[Math.round(Math.min(N, Math.max(0, l)))]!;
  const stopsS = stops.map(smoothLen);
  const scale = opts.view?.scale ?? SCALE;

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  /* Frustum ortográfico = el viewBox del SVG, en unidades de mundo */
  const hw = viewBox.w / (2 * scale);
  const hh = viewBox.h / (2 * scale);
  const camera = new OrthographicCamera(-hw, hw, hh, -hh, -200, 400);
  const az = opts.view?.az ?? AZ;
  const el = opts.view?.el ?? EL;
  camera.position.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(120);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  /* Suelo ↔ pantalla. La proyección ortográfica del plano y=0 es afín: NDC = O + M·(x, z) */
  const proj = (x: number, z: number) => {
    const v = new Vector3(x, 0, z).project(camera);
    return new Vector2(v.x, v.y);
  };
  const O = proj(0, 0);
  const ex = proj(1, 0).sub(O);
  const ez = proj(0, 1).sub(O);
  const det = ex.x * ez.y - ez.x * ex.y;
  /** NDC → suelo */
  const toGround = (nx: number, ny: number) => {
    const dx = nx - O.x;
    const dy = ny - O.y;
    return new Vector2((dx * ez.y - ez.x * dy) / det, (ex.x * dy - dx * ex.y) / det);
  };
  /** Punto del viewBox (px) → NDC */
  const svgToNdc = (p: { x: number; y: number }) => new Vector2((p.x / viewBox.w) * 2 - 1, 1 - (p.y / viewBox.h) * 2);
  /** Longitud sobre el path → punto del suelo (x, z) */
  const groundAt = (l: number) => {
    const L = Math.min(total, Math.max(0, l));
    let lo = 0;
    let hi = N;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid]! <= L) lo = mid;
      else hi = mid;
    }
    const seg = cum[hi]! - cum[lo]!;
    const k = seg > 0 ? (L - cum[lo]!) / seg : 0;
    const p = pts[lo]!.clone().lerp(pts[hi]!, k);
    const n = svgToNdc(p);
    return toGround(n.x, n.y);
  };

  /* Luces: sol cálido de la Quebrada desde arriba-izquierda (la sombra cae hacia abajo-derecha
     en el mapa), relleno frío del cielo navy */
  scene.add(new HemisphereLight(0xe6ebf5, 0x1b2a44, 1.4));
  scene.add(new AmbientLight(0x4a5468, 0.6));
  const sun = new DirectionalLight(0xffc48f, 3.0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 80;
  sun.shadow.camera.left = sun.shadow.camera.bottom = -9;
  sun.shadow.camera.right = sun.shadow.camera.top = 9;
  sun.shadow.bias = -0.001;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  scene.add(sun.target);
  const rim = new DirectionalLight(0xff7a2a, 0.9);
  rim.position.set(10, 6, -8);
  scene.add(rim);
  // Relleno desde la cámara: el lateral que mira al espectador queda blanco, no gris
  const fill = new DirectionalLight(0xbfd3f2, 1.1);
  fill.position.set(Math.sin(az) * 10, 6, Math.cos(az) * 10);
  scene.add(fill);

  /* Dúo: sacamos los coches del grupo (la vía fija del hero no va acá) y les damos un pivote
     en su propio centro para colocarlos uno a uno sobre el path */
  const train = buildSolarTrain();
  const pitch = CAR_LEN + GAP;
  const z0 = -(CARS * CAR_LEN + (CARS - 1) * GAP) / 2;
  const pivots: Group[] = [];
  const carNodes = [...train.cars.children];
  carNodes.forEach((car, k) => {
    const pivot = new Group();
    car.position.z = -(z0 + k * pitch + CAR_LEN / 2);
    pivot.add(car);
    pivots.push(pivot);
    scene.add(pivot);
  });

  /* Sombra de contacto sobre el mapa: plano invisible que sólo recibe sombra, sigue al tren */
  const ground = new Mesh(new PlaneGeometry(60, 60), new ShadowMaterial({ opacity: 0.42 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  /** Más allá de los extremos el path se prolonga en línea recta (para que el dúo no se pliegue) */
  const groundExt = (l: number) => {
    if (l >= 0 && l <= total) return groundAt(l);
    const a = l < 0 ? 0 : total;
    const b = l < 0 ? 2 : total - 2;
    const pa = groundAt(a);
    const dir = pa.clone().sub(groundAt(b)).normalize();
    const over = l < 0 ? -l : l - total;
    return pa.add(dir.multiplyScalar(over / scale));
  };
  /* Colocación: centro del tren en longitud `l` del path; cada coche a ±pitch/2 (en mundo)
     medido sobre el path, resolviendo por bisección la longitud que da esa distancia */
  const solveAt = (lc: number, dist: number, dir: 1 | -1) => {
    const c = groundExt(lc);
    const f = (l: number) => groundExt(l).distanceTo(c) - dist;
    let lo = lc;
    let hi = lc + dir * dist * scale * 2.2;
    hi = Math.min(total + dist * scale * 3, Math.max(-dist * scale * 3, hi));
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2;
      if (f(mid) < 0) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  /* Centro del tren para cada estación: en los extremos el dúo queda con la nariz sobre la
     estación (no centrado), así no cuelga fuera del mapa en Volcán ni en Tilcara */
  const halfLen = train.length / 2;
  const centers = stopsS.map((l, i) =>
    i === 0 ? solveAt(l, halfLen, 1) : i === stopsS.length - 1 ? solveAt(l, halfLen, -1) : l,
  );
  const place = (lc: number) => {
    const c = groundExt(lc);
    for (let k = 0; k < pivots.length; k++) {
      // k=0 es la cola (nariz trasera en −z), k=CARS−1 la cabeza (+z adelante)
      const off = (k - (CARS - 1) / 2) * pitch;
      const lk = off === 0 ? lc : solveAt(lc, Math.abs(off), off > 0 ? 1 : -1);
      const g = groundExt(lk);
      // Rumbo por la cuerda del propio coche (bogie a bogie): estable ante quiebres chicos del path
      const half = 0.35 * CAR_LEN * scale;
      const d = groundExt(lk + half).sub(groundExt(lk - half));
      const pv = pivots[k]!;
      pv.position.set(g.x, 0, g.y);
      pv.rotation.y = Math.atan2(d.x, d.y);
    }
    const spin = lc / scale / train.wheelRadius;
    for (const wh of train.wheels) wh.rotation.set(spin, 0, Math.PI / 2);
    ground.position.set(c.x, -0.004, c.y);
    sun.target.position.set(c.x, 0, c.y);
    sun.position.set(c.x - 5, 12, c.y + 9);
  };

  /* Tamaño / DPR */
  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, w > 640 ? 1.6 : 1.25));
    renderer.setSize(w, h, false);
    render();
  };
  const render = () => renderer.render(scene, camera);

  /* Estado de animación */
  let cur = centers[opts.start ?? 0] ?? 0;
  let from = cur;
  let to = cur;
  let t0 = 0;
  let dur = 0;
  let ease = easeInOutCubic;
  let touring = false;
  let lastStation = -1;
  let raf = 0;
  let visible = true;
  let alive = true;

  const nearestPassed = (l: number) => {
    let best = -1;
    for (let i = 0; i < centers.length; i++) if (l >= centers[i]! - 1) best = i;
    return best;
  };

  const tick = (now: number) => {
    raf = 0;
    if (!alive || !visible) return;
    const k = dur > 0 ? Math.min(1, (now - t0) / dur) : 1;
    cur = from + (to - from) * ease(k);
    place(cur);
    render();
    if (touring) {
      const st = nearestPassed(cur);
      if (st !== lastStation && st >= 0) {
        lastStation = st;
        opts.onStation?.(st);
      }
    }
    if (k < 1) raf = requestAnimationFrame(tick);
    else {
      touring = false;
      dur = 0;
    }
  };
  const start = () => {
    if (!alive || !visible || raf || document.hidden) return;
    raf = requestAnimationFrame(tick);
  };
  const animateTo = (target: number, seconds: number, e: (k: number) => number) => {
    from = cur;
    to = target;
    if (reduced || seconds <= 0) {
      dur = 0;
      cur = target;
      place(cur);
      render();
      return;
    }
    dur = seconds * 1000;
    ease = e;
    t0 = performance.now();
    start();
  };

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) {
        // Al volver, retomamos la animación donde quedó en tiempo real
        if (dur > 0) start();
        else render();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    { threshold: 0.05 },
  );
  io.observe(canvas);
  const onVis = () => {
    if (document.hidden && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (dur > 0) start();
  };
  document.addEventListener('visibilitychange', onVis);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  place(cur);
  resize();

  return {
    goTo(i) {
      touring = false;
      const target = centers[i] ?? 0;
      const secs = Math.min(2.4, Math.max(0.8, Math.abs(target - cur) / GO_SPEED));
      animateTo(target, secs, easeInOutCubic);
    },
    tour() {
      const last = centers[centers.length - 1] ?? total;
      if (reduced || cur >= last - 1) return;
      touring = true;
      lastStation = nearestPassed(cur);
      animateTo(last, TOUR_SECONDS * ((last - cur) / Math.max(1, last - (centers[0] ?? 0))), easeInOutSine);
    },
    moving: () => dur > 0,
    destroy() {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      for (const m of train.materials) m.dispose();
      ground.geometry.dispose();
      (ground.material as ShadowMaterial).dispose();
      const disposeGeo = (o: Object3D) => (o as Mesh).geometry?.dispose();
      train.group.traverse(disposeGeo);
      for (const p of pivots) p.traverse(disposeGeo);
      renderer.dispose();
    },
  };
}
