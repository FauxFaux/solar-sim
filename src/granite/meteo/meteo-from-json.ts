import { sleep } from '../../ts.ts';
import { range } from '../numbers.ts';
import { deltaDecode, MCS_ZONE_CENTRES } from '../../system/mcs-meta.ts';

interface EncodedMeteo {
  temp: number[];
  app: number[];
  rads: number[][];
}

export async function loadMeteosRaw() {
  await sleep(10);
  return await Promise.all(
    range(MCS_ZONE_CENTRES.length).map(async (zone) => {
      let data: unknown;
      // partial workaround for https://github.com/vitejs/vite/issues/18582
      if (import.meta.env?.MODE) {
        data = (await import(`../../assets/meteo-${zone}.json`)).default;
      } else {
        data = (
          await import(/* @vite-ignore */ `../../assets/meteo-${zone}.json`, {
            with: { type: 'json' },
          })
        ).default;
      }
      return decodeMeteo(data as EncodedMeteo);
    }),
  );
}

export function decodeMeteo({ temp, app, rads }: EncodedMeteo) {
  const detemp = deltaDecode(temp);
  return {
    temp: detemp,
    app: deltaDecode(app).map((a, i) => a + detemp[i]),
    rads: rads.map((rad) => deltaDecode(rad)),
  };
}
