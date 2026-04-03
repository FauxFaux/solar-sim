import { createContext } from 'preact';
import { type State, tryTo } from './ts.ts';
import { decodeMeteo, loadMeteosRaw } from './granite/meteo/meteo-from-json.ts';

const meteo6 = import.meta.env?.MODE
  ? await import('./assets/meteo-6.json')
  : await import('./assets/meteo-6.json', {
      with: { type: 'json' },
    });

export interface Meteo {
  temp: number[];
  app: number[];
  rad: number[];
}

export interface DecodedMeteo {
  temp: number[];
  app: number[];
  rads: number[][];
}

export const MeteoContext = createContext<State<DecodedMeteo[]>>(
  undefined as unknown as State<DecodedMeteo[]>,
);

export function onceMeteosLoaded(set: (meteos: DecodedMeteo[]) => void) {
  loadingMeteos.then((v) => v.success && set(v.value));
}

export const defaultMeteo = [decodeMeteo(meteo6.default)];

const loadingMeteos = tryTo(loadMeteosRaw);
