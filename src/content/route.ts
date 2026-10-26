/** Copy y datos de la sección Recorrido (ida y vuelta, Volcán ↔ Tilcara). Datos geográficos © OpenStreetMap contributors (ODbL). */

export interface Stop {
  id: string;
  name: string;
  desc: string;
  /** Posición del hotspot en % del mapa (viewBox 680×385) */
  x: number;
  y: number;
}

export const STOPS: Stop[] = [
  { id: 'volcan', name: 'Volcán', desc: 'Cabecera · km 0 · sale y vuelve', x: 5.81, y: 36.03 },
  { id: 'tumbaya', name: 'Tumbaya', desc: 'Km aprox. 8,0 desde Volcán', x: 20.6, y: 36.47 },
  { id: 'purmamarca', name: 'Purmamarca', desc: 'Km aprox. 19,8 desde Volcán · Andén sobre la RN9', x: 45.6, y: 34.64 },
  { id: 'posta', name: 'Posta de Hornillos', desc: 'Km aprox. 31,9 desde Volcán · Posta histórica', x: 67.53, y: 50.28 },
  { id: 'maimara', name: 'Maimará', desc: 'Km aprox. 34,3 desde Volcán', x: 74.25, y: 58.24 },
  { id: 'tilcara', name: 'Tilcara', desc: 'Cabecera · 42 km desde Volcán · da la vuelta', x: 87.42, y: 62.19 },
];

export const route = {
  id: 'recorrido',
  h2: 'El recorrido, ida y vuelta.',
  lead:
    'Volcán ↔ Tilcara. Seis estaciones y unos 42 km de Quebrada a 2.500 m s. n. m., sobre el ramal del FC Belgrano. El tren sale y regresa por la misma vía. Los 30 tickets viajan por acá.',
  mapLabel:
    'Mapa del recorrido ida y vuelta del Tren Solar de la Quebrada: seis estaciones entre Volcán y Tilcara, regreso por la misma vía, con el Río Grande y la RN9.',
  stationOf: (n: number, total: number) => `Estación ${n} de ${total}`,
  selectStation: (name: string) => `Seleccionar estación ${name}`,
  chipsLabel: 'Estaciones del recorrido, ida y vuelta',
  wayIdle: 'Ida y vuelta · misma vía',
  wayIda: 'Ida · Volcán → Tilcara',
  wayVuelta: 'Vuelta · Tilcara → Volcán',
  legend: {
    round: 'Ida y vuelta',
    train: 'Tren Solar',
    rail: 'Vía FC Belgrano',
    river: 'Río Grande y afluentes',
    road: 'RN9 · RN52 · calles',
  },
  credit: 'Datos geográficos ©',
  creditLink: 'OpenStreetMap contributors',
  creditSuffix: '(ODbL).',
  creditUrl: 'https://www.openstreetmap.org/copyright',
};
