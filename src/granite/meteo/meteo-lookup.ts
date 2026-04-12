import { interpLoc } from '../../system/mcs-meta.ts';
import { range, sum } from '../numbers.ts';
import {
  type Meteo,
  METEO_HOURS,
  METEO_ORIS,
  METEO_SLOPES,
} from './meteo-meta.ts';
import { rads, temps } from './meteo-database.ts';

export function findMeteo(
  loc: [number, number],
  [slope, ori]: [number, number],
): Meteo {
  const weights = interpLoc(loc);

  const slopeFloat = (slope / 90) * METEO_SLOPES.length;
  const slopeLow = Math.floor(slopeFloat);
  const slopeHigh = Math.ceil(slopeFloat);
  const slopeWeight = slopeFloat - slopeLow;

  // TODO: didn't validate this maths at all, very sick of staring at it
  // 1 extra: -180 == 180
  const oriFloat = (180 + ori) / 45 - 1;
  let oriLow = Math.floor(oriFloat);
  if (oriLow < 0) oriLow = METEO_ORIS.length - 1;
  const oriHigh = Math.ceil(oriFloat);
  const oriWeight = oriFloat - oriLow;

  console.log({
    slopeLow,
    slopeHigh,
    slopeWeight,
    oriLow,
    oriHigh,
    oriWeight,
  });

  const radCopy: Record<number, number[]> = {};
  for (const [idx] of weights) {
    // slope, ori, hour
    const r = rads[idx];

    radCopy[idx] = [];

    for (let i = 0; i < METEO_HOURS; ++i) {
      const slope0 =
        r[slopeLow][oriLow][i] * (1 - oriWeight) +
        r[slopeLow][oriHigh][i] * oriWeight;
      const slope1 =
        r[slopeHigh][oriLow][i] * (1 - oriWeight) +
        r[slopeHigh][oriHigh][i] * oriWeight;

      const slope = slope0 * (1 - slopeWeight) + slope1 * slopeWeight;
      radCopy[idx].push(slope);
    }
  }

  return {
    temp: range(METEO_HOURS).map((i) =>
      sum(weights.map(([idx, weight]) => weight * temps[idx].temp[i])),
    ),
    app: range(METEO_HOURS).map((i) =>
      sum(weights.map(([idx, weight]) => weight * temps[idx].app[i])),
    ),
    rad: range(METEO_HOURS).map((i) =>
      sum(weights.map(([idx, weight]) => weight * radCopy[idx][i])),
    ),
  };
}
