import { range } from './granite/numbers.ts';
import { deltaDecode, MCS_ZONE_CENTRES } from './system/mcs-meta.ts';
import { createContext } from 'preact';
import { sleep, type State, tryTo } from './ts.ts';
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

interface EncodedMeteo {
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

export async function loadMeteosRaw() {
  await sleep(10);
  return await Promise.all(
    range(MCS_ZONE_CENTRES.length).map(async (zone) => {
      let data: unknown;
      // partial workaround for https://github.com/vitejs/vite/issues/18582
      if (import.meta.env?.MODE) {
        data = (await import(`./assets/meteo-${zone}.json`)).default;
      } else {
        data = (
          await import(/* @vite-ignore */ `./assets/meteo-${zone}.json`, {
            with: { type: 'json' },
          })
        ).default;
      }
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
