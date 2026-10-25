import { clock, effect, frameLoop, init, surface, type Gpu } from 'vgpu';
import fragment from './foil.wgsl';

/**
 * Foil holográfico WebGPU (vgpu.sh) para el ticket. Inspirado en el ejemplo
 * `holographic-card`. Devuelve dispose; si no hay WebGPU lanza y el caller
 * deja el sheen CSS como fallback. El caller evita montarlo con reduced-motion.
 */
export async function mountFoil(canvas: HTMLCanvasElement): Promise<() => void> {
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
  const output = surface(context, canvas, { dpr: [1, 2] });
  const shader = effect(context, fragment, {
    label: 'ticket-foil',
    set: { params: { resolution: output.size, pointer: [0.25, -0.2], hover: 0, time: 0 } },
  });
  await shader.compile({ colors: [output.format] });

  let targetHover = 0;
  let px = 0.25;
  let py = -0.2;
  let lx = px;
  let ly = py;
  let hover = 0;
  const move = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    px = (e.clientX - r.left) / r.width - 0.5;
    py = (e.clientY - r.top) / r.height - 0.5;
    targetHover = 1;
  };
  const leave = () => {
    targetHover = 0;
  };
  // El canvas tiene pointer-events: none; escuchamos en el contenedor del ticket.
  const host = canvas.closest<HTMLElement>('[data-stack]') ?? canvas;
  host.addEventListener('pointermove', move, { passive: true });
  host.addEventListener('pointerleave', leave);
  const stopResize = output.onResize(() => shader.set({ params: { resolution: output.size } }));
  removeInput = () => {
    host.removeEventListener('pointermove', move);
    host.removeEventListener('pointerleave', leave);
    stopResize();
  };

  const time = clock(context);
  frameLoop(
    context,
    (frame) => {
      const k = 1 - Math.exp(-10 * Math.min(time.deltaTime, 0.1));
      hover += (targetHover - hover) * k;
      if (targetHover > 0) {
        lx += (px - lx) * k;
        ly += (py - ly) * k;
      }
      shader.set({
        params: { pointer: [lx, ly], hover, time: time.time },
      });
      frame.pass(output, shader);
    },
    { fps: 60 },
  );
  window.addEventListener('pagehide', dispose, { once: true });
  return dispose;
}
