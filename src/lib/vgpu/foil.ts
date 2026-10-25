import { clock, effect, frame, frameLoop, init, surface, type Gpu } from 'vgpu';
import fragment from './foil.wgsl';

export interface FoilOptions {
  /** Elemento que recibe el puntero (el canvas tiene pointer-events: none). */
  host?: HTMLElement;
  /** prefers-reduced-motion: un solo frame estático, sin órbita ni seguimiento. */
  reducedMotion?: boolean;
  /** Se llama si la GPU falla después de montar (device lost, frame error): el caller vuelve al CSS. */
  onFail?: (reason: unknown) => void;
}

/**
 * Foil plateado holográfico WebGPU (vgpu.sh) para el cuerpo del ticket. Pinta la
 * capa completa (metal cepillado + holograma procedural, sin texturas); el DOM
 * va encima. Devuelve dispose. Si no hay WebGPU lanza y el caller deja el
 * fallback CSS (gradientes metálicos + sheen).
 */
export async function mountFoil(canvas: HTMLCanvasElement, opts: FoilOptions = {}): Promise<() => void> {
  if (!('gpu' in navigator)) throw new Error('WebGPU no disponible');
  let disposed = false;
  let gpu: Gpu | undefined;
  let removeInput = () => {};
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    removeInput();
    gpu?.dispose();
  };

  const context = await init();
  if (disposed) {
    context.dispose();
    return dispose;
  }
  gpu = context;

  const output = surface(context, canvas, { dpr: [1, 2], label: 'ticket-foil' });
  const shader = effect(context, fragment, {
    label: 'ticket-foil',
    set: {
      params: { resolution: output.size, pointer: [0.2, -0.15], tilt: [0, 0], hover: 0, time: 0 },
    },
  });
  await shader.compile({ colors: [output.format] });
  if (disposed) return dispose;

  // Primer frame verificado antes de prometer nada: si la GPU no puede presentar
  // (headless, driver roto), el caller nunca oculta el fallback CSS.
  shader.set({ params: { resolution: output.size, pointer: [0.2, -0.15], hover: 0, time: 2.4 } });
  frame(context, (f) => f.pass(output, shader));
  await context.settled();
  if (disposed) return dispose;

  // Fallos posteriores (device lost, errores de validación en frame) ⇒ desmontar y avisar.
  const fail = (reason: unknown) => {
    if (disposed) return;
    dispose();
    opts.onFail?.(reason);
  };
  const stopErrors = context.onError(fail);
  context.lost.then(fail, fail);
  window.addEventListener('pagehide', dispose, { once: true });

  // Reduced motion: un frame fijo (y otro por resize), nada se mueve.
  if (opts.reducedMotion) {
    const still = () => {
      shader.set({ params: { resolution: output.size } });
      frame(context, (f) => f.pass(output, shader));
    };
    const stopResize = output.onResize(still);
    removeInput = () => {
      stopResize();
      stopErrors();
    };
    return dispose;
  }

  let targetHover = 0;
  let px = 0.2;
  let py = -0.15;
  let lx = px;
  let ly = py;
  let hover = 0;
  let tx = 0;
  let ty = 0;
  const host = opts.host ?? canvas.parentElement ?? canvas;
  const move = (e: PointerEvent) => {
    if (!e.isPrimary) return;
    const r = canvas.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    px = (e.clientX - r.left) / r.width - 0.5;
    py = (e.clientY - r.top) / r.height - 0.5;
    // Revela al acercarse: 1 dentro del canvas, cae a 0 a un ancho de distancia.
    const dx = Math.max(0, Math.abs(px) - 0.5);
    const dy = Math.max(0, Math.abs(py) - 0.5) * (r.height / r.width);
    const k = Math.max(0, 1 - Math.hypot(dx, dy) / 0.9);
    targetHover = k * k * (3 - 2 * k);
  };
  const leave = () => {
    targetHover = 0;
  };
  host.addEventListener('pointermove', move, { passive: true });
  host.addEventListener('pointerdown', move, { passive: true });
  host.addEventListener('pointerleave', leave);
  host.addEventListener('pointercancel', leave);
  const stopResize = output.onResize(() => shader.set({ params: { resolution: output.size } }));
  removeInput = () => {
    host.removeEventListener('pointermove', move);
    host.removeEventListener('pointerdown', move);
    host.removeEventListener('pointerleave', leave);
    host.removeEventListener('pointercancel', leave);
    stopResize();
    stopErrors();
  };

  const time = clock(context);
  frameLoop(
    context,
    (f) => {
      const k = 1 - Math.exp(-10 * Math.min(time.deltaTime, 0.1));
      hover += (targetHover - hover) * k;
      if (targetHover > 0) {
        lx += (px - lx) * k;
        ly += (py - ly) * k;
      }
      tx += (Math.max(-0.5, Math.min(0.5, lx)) * 0.6 * hover - tx) * k;
      ty += (Math.max(-0.5, Math.min(0.5, ly)) * 0.6 * hover - ty) * k;
      shader.set({ params: { pointer: [lx, ly], tilt: [tx, ty], hover, time: time.time } });
      f.pass(output, shader);
    },
    { fps: 60 },
  );
  return dispose;
}
