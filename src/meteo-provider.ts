import { range } from './granite/numbers.ts';
import { deltaDecode, MCS_ZONE_CENTRES } from './system/mcs-meta.ts';
import { createContext } from 'preact';
import { sleep, type State, tryTo } from './ts.ts';
const meteo6 = await import('./assets/meteo-6.json');

export interface Meteo {
  temp: number[];
  app: number[];
  rads: number[][];
}

interface EncodedMeteo {
  temp: number[];
  app: number[];
  rads: number[][];
}

export const MeteoContext = createContext<State<Meteo[]>>(
  undefined as unknown as State<Meteo[]>,
);

export function onceMeteosLoaded(set: (meteos: Meteo[]) => void) {
  loadingMeteos.then((v) => v.success && set(v.value));
}

export const defaultMeteo = [decodeMeteo(meteo6)];

const loadingMeteos = tryTo(loadMeteosRaw);

async function loadMeteosRaw() {
  await sleep(10);
  return await Promise.all(
    range(MCS_ZONE_CENTRES.length).map(async (zone) => {
      const { default: data } = await import(`./assets/meteo-${zone}.json`);
      return decodeMeteo(data as EncodedMeteo);
    }),
  );
}

function decodeMeteo({ temp, app, rads }: EncodedMeteo) {
  const detemp = deltaDecode(temp);
  return {
    temp: detemp,
    app: deltaDecode(app).map((a, i) => a + detemp[i]),
    rads: rads.map((rad) => deltaDecode(rad)),
  };
}
