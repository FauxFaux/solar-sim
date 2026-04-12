import { sleep } from '../../ts.ts';
import { range } from '../numbers.ts';
import { deltaDecode } from '../../system/mcs-meta.ts';
import { loadTemps } from './temps-loader.ts';
import { METEOS_TOTAL } from './meteo-meta.ts';

interface EncodedMeteo {
  rads: number[][];
}

export async function loadMeteosRaw() {
  await sleep(10);
  const [temps, rads] = await Promise.all([
    loadTemps(),
    Promise.all(
      range(METEOS_TOTAL).map(async (zone) => {
        const data: unknown = (await import(`../../assets/meteo-${zone}.json`))
          .default;
        return decodeMeteo(data as EncodedMeteo);
      }),
    ),
  ]);

  return range(METEOS_TOTAL).map((i) => ({
    ...rads[i],
    ...temps[i],
  }));
}

export function decodeMeteo({ rads }: EncodedMeteo) {
  return {
    rads: rads.map((rad) => deltaDecode(rad)),
  };
}
