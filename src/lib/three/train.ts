/**
 * Escena del Tren Solar 3D para el hero (detrás del ticket).
 *
 * El modelo es procedural (ver ./solar-train.ts): no carga GLB ni texturas. Se importa
 * dinámicamente desde Hero.astro para que three quede en su propio chunk.
 *
 * Movimiento: el dúo AVANZA por la vía (loop). La vía (rieles + durmientes) queda fija
 * en escena y los coches se trasladan por su eje +z; la cámara no se mueve, así el
 * desplazamiento se lee contra el ticket, el texto y los durmientes. Entra por la
 * derecha (lejos), pasa por detrás del ticket y sale por la izquierda (cerca), donde
 * el CSS del hero lo funde a oscuro. El loop envuelve cuando el tren está fuera de
 * cuadro, con una pausa corta antes del siguiente paso.
 *
 * Encuadre: la cámara mira al origen; el rig se posiciona de modo que la punta de la
 * nariz, en la pose de referencia (s = 0), caiga en un punto de pantalla relativo al
 * stack del ticket (desktop: al borde izquierdo del ticket; portrait: por encima).
 */
import {
  ACESFilmicToneMapping,
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { buildSolarTrain, CAR_H, FLOOR_Y } from './solar-train';

export interface TrainOptions {
  /** Sin animación: un solo frame (y re-render en resize) */
  reducedMotion?: boolean;
  /** Elemento que recibe el pointermove para el parallax (desktop) */
  host?: HTMLElement;
  /** Elemento respecto al cual se ubica el tren (el stack del ticket) */
  anchor?: HTMLElement;
  /** Overrides de encuadre (debug/tuning). `s`: avance fijo en unidades (frame de prueba) */
  view?: Partial<{ hFrac: number; fx: number; fy: number; yaw: number; camUp: number; s: number }>;
  /** Sombras (default true) */
  shadows?: boolean;
}

export interface TrainHandle {
  destroy(): void;
}

/** Segundos que tarda el dúo en recorrer su propio largo (≈ velocidad de estación) */
const PASS_SECONDS = 9;
/** Pausa (s) entre que el tren sale de cuadro y vuelve a entrar */
const GAP_SECONDS = 1.6;
/** Margen fuera de cuadro, en NDC, para entrar/salir */
const NDC_MARGIN = 0.12;

export async function mountTrain(canvas: HTMLCanvasElement, opts: TrainOptions): Promise<TrainHandle> {
  const reduced = !!opts.reducedMotion;
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = opts.shadows !== false;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  const camera = new PerspectiveCamera(24, 1, 0.1, 160);

  /* Luces: sol naranja de la Quebrada arriba a la derecha, relleno frío desde el cielo navy */
  /* Relleno frío neutro (atmósfera charcoal del hero), no navy: el navy queda en la pintura del tren */
  scene.add(new HemisphereLight(0xd6dbe4, 0x2a2d34, 1.25));
  scene.add(new AmbientLight(0x3a3d45, 0.55));
  const sun = new DirectionalLight(0xffc08a, 2.8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 40;
  sun.shadow.camera.left = sun.shadow.camera.bottom = -8;
  sun.shadow.camera.right = sun.shadow.camera.top = 8;
  sun.shadow.bias = -0.0012;
  sun.shadow.normalBias = 0.05;
  scene.add(sun);
  scene.add(sun.target);
  const fill = new DirectionalLight(0x9fc0f0, 0.9);
  fill.position.set(8, 3, 6);
  scene.add(fill);
  const rim = new DirectionalLight(0xff7a2a, 1.2);
  rim.position.set(6, 3, -6);
  scene.add(rim);

  /* Rig: vía fija + coches; recibe rotación (pose) y parallax */
  const train = buildSolarTrain();
  const rig = train.group;
  const cars = train.cars;
  scene.add(rig);

  const ground = new Mesh(new PlaneGeometry(160, 60), new ShadowMaterial({ opacity: 0.4 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  rig.add(ground);

  /* Pose: 3/4 lateral, la nariz apunta a la izquierda y un poco hacia cámara */
  const basePitch = 0;
  let baseYaw = -1.0;
  rig.rotation.set(basePitch, baseYaw, 0);

  const tanHalf = Math.tan((camera.fov * Math.PI) / 360);
  const bodyH = FLOOR_Y + CAR_H + 0.1;
  const halfLen = train.length / 2;

  /* Avance s (unidades, a lo largo de +z local de `cars`); sIn/sOut: límites del loop */
  let s = 0;
  let sIn = 0;
  let sOut = 0;
  const tmp = new Vector3();
  /** NDC x de un punto de `cars` (coords locales) con avance `at` */
  const ndcX = (local: Vector3, at: number) => {
    tmp.copy(local);
    tmp.z += at;
    cars.localToWorld(tmp);
    tmp.project(camera);
    return tmp.x;
  };
  /** Resuelve s tal que ndcX(local, s) = target (ndcX decrece con s: el tren avanza a la izquierda) */
  const solve = (local: Vector3, target: number) => {
    let lo = -halfLen - 80;
    let hi = halfLen + 80;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (ndcX(local, mid) > target) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };

  const frame = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    const aspect = w / h;
    camera.aspect = aspect;
    const wide = aspect > 1.15;
    const v = opts.view ?? {};
    baseYaw = v.yaw ?? (wide ? -1.0 : -1.04);
    rig.rotation.y = baseYaw;
    cars.position.set(0, 0, 0);

    // Punto de pantalla objetivo para la punta de la nariz en la pose de referencia (-0.5..0.5)
    let fx = wide ? -0.02 : -0.1;
    let fy = wide ? -0.16 : -0.1;
    // Alto del cuerpo (a la profundidad de la nariz) como fracción del canvas. En
    // portrait el canvas es todo el hero (alto), así que se fija en px (~112px).
    const hFrac = v.hFrac ?? (wide ? 0.21 : Math.min(0.16, Math.max(0.04, 112 / h)));
    if (opts.anchor) {
      const r = canvas.getBoundingClientRect();
      const a = opts.anchor.getBoundingClientRect();
      if (r.width && r.height && a.width) {
        const ax = (a.left - r.left) / r.width - 0.5;
        const atop = (a.top - r.top) / r.height - 0.5;
        if (wide) {
          // Nariz al borde izquierdo del ticket, techo y ventanales asomando por encima:
          // el ticket tapa bogies y faldón y flota delante.
          fx = ax - 0.03;
          fy = atop - 0.03;
        } else {
          // Portrait: el dúo corre por la franja que el CSS deja sobre el ticket vertical
          // (rieles ~12px por encima del borde superior del stack)
          fx = -0.1;
          fy = atop - (10 + 0.41 * hFrac * h) / h;
        }
      }
    }
    fx = v.fx ?? fx;
    fy = v.fy ?? fy;

    // Nariz en coords del rig (rotación aplicada)
    const tip = train.noseTip.clone().applyEuler(rig.rotation);
    const depth = bodyH / (hFrac * 2 * tanHalf); // distancia cámara→nariz
    const dist = depth + tip.z; // cámara en z = dist mirando al origen
    const visH = 2 * depth * tanHalf;
    const visW = visH * aspect;
    rig.position.set(fx * visW - tip.x, -fy * visH - tip.y, 0);
    // Cámara un poco por encima del tren (se ve el techo con los paneles)
    const camUp = (v.camUp ?? 0.13) * depth;
    camera.position.set(0, camUp, dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    rig.updateMatrixWorld(true);

    // Límites del loop: entra con la nariz fuera de cuadro a la derecha, sale con la
    // cola fuera de cuadro a la izquierda (ambos con margen).
    const tail = new Vector3(0, train.noseTip.y, -train.noseTip.z);
    sIn = solve(train.noseTip, 1 + NDC_MARGIN);
    sOut = solve(tail, -1 - NDC_MARGIN);
    if (sOut < sIn) sOut = sIn; // degenerado (no debería pasar)
    // Mantener la vía construida dentro del recorrido
    const need = Math.max(Math.abs(sIn), Math.abs(sOut)) + halfLen + 1;
    if (need > train.trackLength / 2) console.warn('[train3d] vía corta para el recorrido', need);

    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, wide ? 1.6 : 1.25));
    renderer.setSize(w, h, false);
  };

  /* Parallax con el puntero */
  let tx = 0;
  let ty = 0;
  let px = 0;
  let py = 0;
  const host = opts.host ?? canvas.parentElement ?? document.body;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const onMove = (e: PointerEvent) => {
    if (!fine.matches) return;
    const r = host.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  const onLeave = () => {
    tx = 0;
    ty = 0;
  };
  if (!reduced) {
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);
  }

  let raf = 0;
  let visible = true;
  let alive = true;
  let last = 0;
  let clock = 0; // segundos de animación acumulados (sólo mientras corre)
  let gap = 0; // pausa restante antes de volver a entrar
  const basePos = new Vector3();

  /** Aplica el avance `at` a los coches (posición, ruedas, sol que sigue al tren) */
  const place = (at: number) => {
    cars.position.z = at;
    const spin = at / train.wheelRadius;
    for (const wh of train.wheels) wh.rotation.set(spin, 0, Math.PI / 2);
    // El sol acompaña al dúo para que la sombra de contacto no salga del frustum
    tmp.set(0, 0, at);
    rig.localToWorld(tmp);
    sun.target.position.copy(tmp);
    sun.position.set(tmp.x - 4, tmp.y + 9, tmp.z + 10);
  };

  const render = () => renderer.render(scene, camera);

  const tick = (now: number) => {
    raf = 0;
    if (!alive || !visible) return;
    const dt = Math.min(0.1, last ? (now - last) / 1000 : 0);
    last = now;
    clock += dt;
    px += (tx - px) * 0.05;
    py += (ty - py) * 0.05;
    rig.rotation.y = baseYaw + px * 0.05;
    rig.rotation.x = basePitch + py * 0.02;
    rig.position.y = basePos.y;

    // Avance: velocidad constante; al salir de cuadro, pausa y vuelve a entrar
    const speed = train.length / PASS_SECONDS;
    if (gap > 0) {
      gap -= dt;
      if (gap <= 0) s = sIn;
    } else {
      s += speed * dt;
      if (s > sOut) gap = GAP_SECONDS;
    }
    // Micro-vaivén de marcha (traqueteo suave), sólo con el tren en pantalla
    cars.position.y = Math.sin(clock * 7.3) * 0.006 + Math.sin(clock * 11.1) * 0.003;
    cars.rotation.z = Math.sin(clock * 2.1) * 0.004;
    place(s);
    render();
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (!alive) return;
    if (reduced) {
      place(opts.view?.s ?? 0);
      render();
      return;
    }
    last = 0;
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick);
  };

  const ro = new ResizeObserver(() => {
    frame();
    basePos.copy(rig.position);
    if (reduced) {
      place(opts.view?.s ?? 0);
      render();
    }
  });
  ro.observe(canvas);
  frame();
  basePos.copy(rig.position);
  // Arranca en la pose de referencia (compuesta con el ticket) y sigue de largo
  s = opts.view?.s ?? 0;
  place(s);

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) start();
      else if (raf) {
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
    } else start();
  };
  document.addEventListener('visibilitychange', onVis);

  start();

  return {
    destroy() {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      for (const m of train.materials) m.dispose();
      ground.geometry.dispose();
      (ground.material as ShadowMaterial).dispose();
      rig.traverse((o) => (o as Mesh).geometry?.dispose());
      renderer.dispose();
    },
  };
}
