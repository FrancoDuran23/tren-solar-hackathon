import { useEffect, useRef, useState } from 'react';
import { ROUTE_SVG } from './route-map-svg';
import { STOPS, route } from '../../content/route';
import type { IsoTrainHandle } from '../../lib/three/iso-train';
import { stationReached, type LegDir } from '../../lib/route-tour';
import './route-map.css';

const NS = 'http://www.w3.org/2000/svg';
/** Misma duración que cada tramo de `iso-train` (ida o vuelta). */
const LEG_MS = 16000;
const TURN_MS = 650;

interface Geo {
  path: SVGPathElement;
  trv: SVGGElement;
  lens: number[];
  total: number;
  cur: number;
}

type Way = 'idle' | 'ida' | 'vuelta';

/**
 * Mapa interactivo Volcán ↔ Tilcara, ida y vuelta por la misma vía. Island React: al
 * entrar en viewport anima la ruta (stroke-dash) y el Tren Solar 3D isométrico
 * (three.js, canvas sobre el SVG) va y vuelve marcando cada estación; click en un
 * hotspot o chip corta el tour y el tren va hasta ahí con easing. Sin WebGL el
 * marcador 2D hace el mismo ida y vuelta.
 */
export default function RouteMap() {
  const [sel, setSel] = useState(0);
  const [on, setOn] = useState(false);
  const [iso, setIso] = useState(false);
  const [noGl, setNoGl] = useState(false);
  const [leg, setLeg] = useState<Way>('idle');
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const geo = useRef<Geo | null>(null);
  const train = useRef<IsoTrainHandle | null>(null);
  /** La última selección vino del usuario (chip/hotspot), no del tren en su recorrido */
  const byUser = useRef(false);
  /** El tour automático está moviendo el marcador; el efecto de `sel` no lo pelea */
  const autoTour = useRef(false);
  const stopAuto = useRef<(() => void) | null>(null);
  const pick = (i: number) => {
    byUser.current = true;
    autoTour.current = false;
    stopAuto.current?.();
    stopAuto.current = null;
    setLeg('idle');
    train.current?.goTo(i);
    setSel(i);
  };

  useEffect(() => {
    const svg = svgRef.current;
    const path = svg?.querySelector<SVGPathElement>('#rmap-path');
    if (!svg || !path) return;
    const total = path.getTotalLength();
    const samples: { l: number; x: number; y: number }[] = [];
    for (let i = 0; i <= 600; i++) {
      const l = (total * i) / 600;
      const p = path.getPointAtLength(l);
      samples.push({ l, x: p.x, y: p.y });
    }
    const lens = Array.from(svg.querySelectorAll<SVGGElement>('g.stp')).map((g) => {
      const m = g.transform.baseVal.consolidate()?.matrix;
      if (!m) return 0;
      let best = samples[0]!;
      for (const s of samples) {
        if (Math.hypot(s.x - m.e, s.y - m.f) < Math.hypot(best.x - m.e, best.y - m.f)) best = s;
      }
      return best.l;
    });
    const trv = document.createElementNS(NS, 'g');
    trv.setAttribute('class', 'rmap-trv');
    trv.setAttribute('aria-hidden', 'true');
    for (const [cls, r] of [
      ['h', '9'],
      ['c', '4.5'],
    ] as const) {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('class', cls);
      c.setAttribute('r', r);
      trv.appendChild(c);
    }
    svg.appendChild(trv);
    const p0 = path.getPointAtLength(lens[0] ?? 0);
    trv.setAttribute('transform', `translate(${p0.x} ${p0.y})`);
    geo.current = { path, trv, lens, total, cur: lens[0] ?? 0 };
    const both = markRoundTrip(svg, path, lens);

    // Tren 3D isométrico: three en su propio chunk, montado sólo si hay WebGL
    let dead = false;
    const canvas = canvasRef.current;
    if (canvas) {
      import('../../lib/three/iso-train')
        .then(({ mountIsoTrain }) => {
          if (dead) return;
          const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          train.current = mountIsoTrain(canvas, {
            path,
            stops: lens,
            viewBox: { w: 680, h: 385 },
            start: 0,
            reducedMotion: reduced,
            onStation: (i) => {
              if (!autoTour.current) return;
              byUser.current = false;
              setSel(i);
            },
            onLeg: (dir) => {
              if (autoTour.current) setLeg(dir < 0 ? 'vuelta' : 'ida');
            },
            onTourEnd: () => {
              autoTour.current = false;
              setLeg('idle');
            },
          });
          setIso(true);
        })
        .catch((err) => {
          console.warn('[iso-train] sin WebGL, queda el marcador 2D', err);
          if (!dead) setNoGl(true);
        });
    } else if (!dead) setNoGl(true);

    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setOn(true);
      },
      { threshold: 0.25 },
    );
    if (rootRef.current) io.observe(rootRef.current);

    // Mobile: el mapa scrollea horizontal; al llegar al final se saca la máscara de "hay más".
    const sc = scrollRef.current;
    const onScroll = () => {
      if (!sc) return;
      sc.classList.toggle('end', sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 4);
    };
    sc?.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      dead = true;
      io.disconnect();
      sc?.removeEventListener('scroll', onScroll);
      trv.remove();
      both.remove();
      train.current?.destroy();
      train.current = null;
    };
  }, []);

  // Al entrar en viewport, con el tren montado, arranca ida y vuelta
  useEffect(() => {
    if (!(on && iso) || byUser.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    autoTour.current = true;
    train.current?.tour();
  }, [on, iso]);

  // Sin WebGL: el marcador 2D hace la misma ida y la misma vuelta
  useEffect(() => {
    if (!on || !noGl || byUser.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const g = geo.current;
    if (!g) return;
    autoTour.current = true;
    const stop = runMarkerRoundTrip(g, {
      onStation: (i) => {
        if (!autoTour.current) return;
        byUser.current = false;
        setSel(i);
      },
      onLeg: (dir) => {
        if (autoTour.current) setLeg(dir < 0 ? 'vuelta' : 'ida');
      },
      onDone: () => {
        autoTour.current = false;
        setLeg('idle');
      },
    });
    stopAuto.current = stop;
    return () => {
      stop();
      if (stopAuto.current === stop) stopAuto.current = null;
    };
  }, [on, noGl]);

  useEffect(() => {
    const svg = svgRef.current;
    svg?.querySelectorAll<SVGGElement>('g.stp').forEach((g, i) => g.classList.toggle('sel', i === sel));
    const g = geo.current;
    if (!g) return;
    const from = g.cur;
    const to = g.lens[sel] ?? 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // El tour (3D o marcador) mueve el tren; este efecto solo actualiza el resaltado.
    if (autoTour.current && !byUser.current) return;
    const dur = reduce ? 0 : 900;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = dur ? Math.min(1, (t - t0) / dur) : 1;
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const l = from + (to - from) * e;
      const p = g.path.getPointAtLength(l);
      g.trv.setAttribute('transform', `translate(${p.x} ${p.y})`);
      g.cur = l;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    // Si el mapa está en modo scroll (mobile), centrar la estación elegida por el usuario
    // (el recorrido automático no mueve el scroll).
    const sc = scrollRef.current;
    const st = STOPS[sel];
    if (byUser.current && sc && st && sc.scrollWidth > sc.clientWidth + 4) {
      const x = (st.x / 100) * sc.scrollWidth - sc.clientWidth / 2;
      sc.scrollTo({ left: Math.max(0, x), behavior: reduce ? 'auto' : 'smooth' });
    }
    return () => cancelAnimationFrame(raf);
  }, [sel]);

  const s = STOPS[sel]!;

  return (
    <div ref={rootRef} className={`rmap${on ? ' route-on' : ''}${iso ? ' has-iso' : ''}`}>
      <figure className="rmap-map tk-panel tk-corner">
        <div className="rmap-scroll" ref={scrollRef}>
          <div className="rmap-inner">
            <svg
              ref={svgRef}
              className="rmap-svg"
              viewBox="0 0 680 385"
              role="img"
              aria-label={route.mapLabel}
              dangerouslySetInnerHTML={{ __html: ROUTE_SVG }}
            />
            <canvas ref={canvasRef} className="rmap-iso" aria-hidden="true" />
            {STOPS.map((st, i) => (
              <button
                key={st.id}
                type="button"
                className={`rmap-dot${i === sel ? ' sel' : ''}`}
                style={{ left: `${st.x}%`, top: `${st.y}%` }}
                aria-pressed={i === sel}
                aria-label={route.selectStation(st.name)}
                onClick={() => pick(i)}
              />
            ))}
          </div>
        </div>
        <div className="rmap-detail" aria-live="polite">
          <p className={`rmap-way${leg === 'vuelta' ? ' is-vuelta' : ''}`} data-leg={leg}>
            {leg === 'ida' ? route.wayIda : leg === 'vuelta' ? route.wayVuelta : route.wayIdle}
          </p>
          <div className="rmap-dk">{route.stationOf(sel + 1, STOPS.length)}</div>
          <div className="rmap-dn">{s.name}</div>
          <p className="rmap-dd">{s.desc}</p>
          <p className="rmap-dc">
            {route.credit}{' '}
            <a href={route.creditUrl} target="_blank" rel="noopener noreferrer">
              {route.creditLink}
            </a>{' '}
            {route.creditSuffix}
          </p>
        </div>
        <figcaption className="rmap-legend">
          <span>
            <i className="lg lg-both" />
            {route.legend.round}
          </span>
          <span>
            <i className="lg lg-rt" />
            {route.legend.train}
          </span>
          <span>
            <i className="lg lg-rl" />
            {route.legend.rail}
          </span>
          <span>
            <i className="lg lg-rv" />
            {route.legend.river}
          </span>
          <span>
            <i className="lg lg-rd" />
            {route.legend.road}
          </span>
        </figcaption>
      </figure>
      <div className="rmap-chips" role="group" aria-label={route.chipsLabel}>
        {STOPS.map((st, i) => (
          <button
            key={st.id}
            type="button"
            className={`rmap-chip${i === sel ? ' sel' : ''}`}
            aria-pressed={i === sel}
            onClick={() => pick(i)}
          >
            <span className="rn">{String(i + 1).padStart(2, '0')}</span> {st.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Chevrons a ambos lados de la vía: la ida apunta a Tilcara, la vuelta a Volcán. Misma línea. */
function markRoundTrip(svg: SVGSVGElement, path: SVGPathElement, stops: number[]) {
  const total = path.getTotalLength();
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'rt-both');
  g.setAttribute('aria-hidden', 'true');
  for (const frac of [0.33, 0.62, 0.91]) {
    let l = total * frac;
    for (const s of stops) {
      if (Math.abs(s - l) < 40) l = s + (l >= s ? 46 : -46);
    }
    l = Math.min(total - 28, Math.max(28, l));
    const p = path.getPointAtLength(l);
    const q = path.getPointAtLength(Math.min(total, l + 18));
    const ang = Math.atan2(q.y - p.y, q.x - p.x);
    const side = 13;
    const ox = -Math.sin(ang) * side;
    const oy = Math.cos(ang) * side;
    const deg = (ang * 180) / Math.PI;
    g.appendChild(chevron(p.x + ox, p.y + oy, deg, 'ida'));
    g.appendChild(chevron(p.x - ox, p.y - oy, deg + 180, 'vuelta'));
  }
  const firstStop = svg.querySelector('g.stp');
  if (firstStop) svg.insertBefore(g, firstStop);
  else svg.appendChild(g);
  return g;
}

function chevron(x: number, y: number, deg: number, cls: string) {
  const c = document.createElementNS(NS, 'path');
  c.setAttribute('class', `rt-chev ${cls}`);
  c.setAttribute('d', 'M-8 -5.2 L2.4 0 L-8 5.2');
  c.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)})`);
  return c;
}

/**
 * Marcador 2D: ida hasta la última estación, pausa, vuelta a la primera por la misma vía.
 * Devuelve una función que corta el recorrido.
 */
function runMarkerRoundTrip(
  g: Geo,
  cbs: {
    onStation: (i: number) => void;
    onLeg: (dir: LegDir) => void;
    onDone: () => void;
  },
) {
  const stops = g.lens;
  const home = stops[0] ?? 0;
  const end = stops[stops.length - 1] ?? g.total;
  const span = Math.max(1, end - home);
  let dead = false;
  let raf = 0;
  let dir: LegDir = 1;
  let from = g.cur;
  let to = end;
  let t0 = performance.now();
  let legMs = LEG_MS * ((to - from) / span);
  let phase: 'run' | 'dwell' = 'run';
  let dwellEnd = 0;
  let last = stationReached(stops, g.cur, 1);
  cbs.onLeg(1);

  const frame = (now: number) => {
    if (dead) return;
    if (phase === 'dwell') {
      if (now < dwellEnd) {
        raf = requestAnimationFrame(frame);
        return;
      }
      dir = -1;
      from = g.cur;
      to = home;
      t0 = now;
      legMs = LEG_MS * ((from - to) / span);
      phase = 'run';
      last = stationReached(stops, g.cur, -1);
    }
    const k = legMs > 0 ? Math.min(1, (now - t0) / legMs) : 1;
    const e = -(Math.cos(Math.PI * k) - 1) / 2;
    const l = from + (to - from) * e;
    const p = g.path.getPointAtLength(Math.min(g.total, Math.max(0, l)));
    g.trv.setAttribute('transform', `translate(${p.x} ${p.y})`);
    g.cur = l;
    const st = stationReached(stops, l, dir);
    if (st !== last && st >= 0) {
      last = st;
      cbs.onStation(st);
    }
    if (k < 1) {
      raf = requestAnimationFrame(frame);
      return;
    }
    if (dir > 0) {
      phase = 'dwell';
      dwellEnd = now + TURN_MS;
      dir = -1;
      last = stationReached(stops, g.cur, -1);
      cbs.onLeg(-1);
      raf = requestAnimationFrame(frame);
      return;
    }
    cbs.onDone();
  };
  raf = requestAnimationFrame(frame);
  return () => {
    dead = true;
    cancelAnimationFrame(raf);
  };
}
