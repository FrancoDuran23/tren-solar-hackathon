/**
 * Escena del Tren Solar 3D para el hero (detrás del ticket).
 *
 * El modelo es procedural (ver ./solar-train.ts): no carga GLB ni texturas. Se importa
 * dinámicamente desde Hero.astro para que three quede en su propio chunk.
 *
 * Encuadre: la cámara mira de frente al origen; el tren se posiciona de modo que la
 * punta de la nariz caiga en un punto de pantalla relativo al stack del ticket
 * (desktop: a la izquierda del ticket, el cuerpo se pierde en perspectiva por detrás;
 * portrait: por encima del ticket vertical).
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
  /** Overrides de encuadre (debug/tuning) */
  view?: Partial<{ hFrac: number; fx: number; fy: number; yaw: number; camUp: number }>;
  /** Sombras (default true) */
  shadows?: boolean;
}

export interface TrainHandle {
  destroy(): void;
}

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
  const camera = new PerspectiveCamera(28, 1, 0.1, 120);

  /* Luces: sol naranja de la Quebrada arriba a la derecha, relleno frío desde el cielo navy */
  scene.add(new HemisphereLight(0xbfd3f5, 0x1b3a6b, 1.3));
  scene.add(new AmbientLight(0x22365e, 0.6));
  const sun = new DirectionalLight(0xffc08a, 2.8);
  sun.position.set(5, 9, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 40;
  sun.shadow.camera.left = sun.shadow.camera.bottom = -9;
  sun.shadow.camera.right = sun.shadow.camera.top = 9;
  sun.shadow.bias = -0.0012;
  sun.shadow.normalBias = 0.05;
  scene.add(sun);
  const fill = new DirectionalLight(0x9fc0f0, 1.1);
  fill.position.set(-8, 4, 6);
  scene.add(fill);
  const rim = new DirectionalLight(0xff7a2a, 1.1);
  rim.position.set(-3, 2, 7);
  scene.add(rim);

  /* Rig: contiene el tren y recibe rotación/parallax */
  const train = buildSolarTrain();
  const rig = train.group;
  scene.add(rig);

  const ground = new Mesh(new PlaneGeometry(60, 60), new ShadowMaterial({ opacity: 0.4 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  rig.add(ground);

  /* Pose: la nariz apunta a la izquierda y hacia cámara (3/4 frontal, como en el poster) */
  const basePitch = 0;
  let baseYaw = -0.62;
  rig.rotation.set(basePitch, baseYaw, 0);

  const tanHalf = Math.tan((camera.fov * Math.PI) / 360);
  const bodyH = FLOOR_Y + CAR_H + 0.1;

  const frame = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    const aspect = w / h;
    camera.aspect = aspect;
    const wide = aspect > 1.15;
    const v = opts.view ?? {};
    baseYaw = v.yaw ?? (wide ? -0.62 : -0.7);
    rig.rotation.y = baseYaw;

    // Punto de pantalla objetivo para la punta de la nariz (fracciones -0.5..0.5)
    let fx = wide ? -0.08 : -0.08;
    let fy = wide ? -0.14 : -0.02;
    // Alto del cuerpo (a la profundidad de la nariz) como fracción del viewport
    const hFrac = v.hFrac ?? (wide ? 0.45 : 0.16);
    if (opts.anchor) {
      const r = canvas.getBoundingClientRect();
      const a = opts.anchor.getBoundingClientRect();
      if (r.width && r.height && a.width) {
        const ax = (a.left - r.left) / r.width - 0.5;
        const atop = (a.top - r.top) / r.height - 0.5;
        fx = wide ? ax - 0.05 : -0.08;
        fy = wide ? atop : atop - 0.05;
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
    // Cámara un poco por encima del tren, mirando al plano de la nariz (se ve el techo)
    const camUp = (v.camUp ?? 0.1) * depth;
    camera.position.set(0, camUp, dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
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
  const t0 = performance.now();
  const basePos = new Vector3();

  const render = () => renderer.render(scene, camera);

  const tick = (now: number) => {
    raf = 0;
    if (!alive || !visible) return;
    const t = (now - t0) / 1000;
    px += (tx - px) * 0.05;
    py += (ty - py) * 0.05;
    rig.rotation.y = baseYaw + Math.sin(t * 0.3) * 0.03 + px * 0.09;
    rig.rotation.x = basePitch + Math.sin(t * 0.45) * 0.006 + py * 0.03;
    rig.position.y = basePos.y + Math.sin(t * 1.1) * 0.012;
    render();
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (!alive) return;
    if (reduced) {
      render();
      return;
    }
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick);
  };

  const ro = new ResizeObserver(() => {
    frame();
    basePos.copy(rig.position);
    if (reduced) render();
  });
  ro.observe(canvas);
  frame();
  basePos.copy(rig.position);

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
