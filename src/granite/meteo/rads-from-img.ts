import {
  METEO_HOURS,
  METEO_ORIS,
  METEO_SLOPES,
  METEOS_TOTAL,
  RAD_MAX,
  type Rads,
  type VirtualArray,
} from './meteo-meta.ts';
import { interleave, range } from '../numbers.ts';

export async function loadRadsFromArr(arr: VirtualArray): Promise<Rads> {
  const datums = METEO_SLOPES.length * METEO_ORIS.length;
  if (arr.length !== datums * METEOS_TOTAL * METEO_HOURS) {
    throw new Error(
      `Invalid array length: expected ${datums * METEOS_TOTAL * METEO_HOURS}, got ${length}`,
    );
  }

  let idx = 0;
  const pop = () => RAD_MAX * (arr.data(idx++) / 255);

  const rads: Rads = range(METEOS_TOTAL).map(() =>
    range(METEO_SLOPES.length).map(() =>
      range(METEO_ORIS.length).map(() => range(METEO_HOURS).map(() => NaN)),
    ),
  );

  for (const h of interleave(24)) {
    for (const d of range(365)) {
      for (const m of range(METEOS_TOTAL)) {
        for (const slope of range(METEO_SLOPES.length)) {
          for (const ori of range(METEO_ORIS.length)) {
            rads[m][slope][ori][d * 24 + h] = pop();
          }
        }
      }
    }
  }

  return rads;
}
