import { useEffect, useRef, useState } from 'react';
import { ROUTE_SVG } from './route-map-svg';
import { STOPS, route } from '../../content/route';
import './route-map.css';

const NS = 'http://www.w3.org/2000/svg';

interface Geo {
  path: SVGPathElement;
  trv: SVGGElement;
  lens: number[];
  total: number;
  cur: number;
}

/**
 * Mapa interactivo Volcán → Tilcara. Island React: al entrar en viewport anima la ruta
 * (stroke-dash); click en un hotspot o chip selecciona la estación y mueve el marcador.
 */
export default function RouteMap() {
  const [sel, setSel] = useState(0);
  const [on, setOn] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const geo = useRef<Geo | null>(null);

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
      io.disconnect();
      sc?.removeEventListener('scroll', onScroll);
      trv.remove();
    };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    svg?.querySelectorAll<SVGGElement>('g.stp').forEach((g, i) => g.classList.toggle('sel', i === sel));
    const g = geo.current;
    if (!g) return;
    const from = g.cur;
    const to = g.lens[sel] ?? 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

    // Si el mapa está en modo scroll (mobile), centrar la estación elegida.
    const sc = scrollRef.current;
    const st = STOPS[sel];
    if (sc && st && sc.scrollWidth > sc.clientWidth + 4) {
      const x = (st.x / 100) * sc.scrollWidth - sc.clientWidth / 2;
      sc.scrollTo({ left: Math.max(0, x), behavior: reduce ? 'auto' : 'smooth' });
    }
    return () => cancelAnimationFrame(raf);
  }, [sel]);

  const s = STOPS[sel]!;

  return (
    <div ref={rootRef} className={`rmap${on ? ' route-on' : ''}`}>
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
            {STOPS.map((st, i) => (
              <button
                key={st.id}
                type="button"
                className={`rmap-dot${i === sel ? ' sel' : ''}`}
                style={{ left: `${st.x}%`, top: `${st.y}%` }}
                aria-pressed={i === sel}
                aria-label={route.selectStation(st.name)}
                onClick={() => setSel(i)}
              />
            ))}
          </div>
        </div>
        <div className="rmap-detail" aria-live="polite">
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
            onClick={() => setSel(i)}
          >
            <span className="rn">{String(i + 1).padStart(2, '0')}</span> {st.name}
          </button>
        ))}
      </div>
    </div>
  );
}
