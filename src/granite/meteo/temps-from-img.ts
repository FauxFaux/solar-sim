import {
  METEO_HOURS,
  METEOS_TOTAL,
  TEMP_MAX,
  TEMP_MIN,
  type VirtualArray,
} from './meteo-meta.ts';
import { range } from '../numbers.ts';
import { sleep } from '../../ts.ts';

export async function loadTempsFromArr(arr: VirtualArray) {
  const datums = 2;
  if (arr.length !== datums * METEOS_TOTAL * METEO_HOURS) {
    throw new Error(
      `Invalid array length: expected ${datums * METEOS_TOTAL * METEO_HOURS}, got ${arr.length}`,
    );
  }

  const ntemp = (temp: number) => temp * (TEMP_MAX - TEMP_MIN) + TEMP_MIN;

  let idx = 0;
  const pop = () => ntemp(arr.data(idx++) / 255);

  const temps = range(METEOS_TOTAL).map(() => ({
    temp: [] as number[],
    app: [] as number[],
  }));

  for (let m = 0; m < METEOS_TOTAL; ++m) {
    for (let h = 0; h < METEO_HOURS; ++h) {
      temps[m].temp.push(pop());
    }
    for (let h = 0; h < METEO_HOURS; ++h) {
      temps[m].app.push(pop());
    }
    await sleep(1);
  }

  return temps;
}
