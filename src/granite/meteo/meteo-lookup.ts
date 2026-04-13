import { interpLoc } from '../../system/mcs-meta.ts';
import { range, sum } from '../numbers.ts';
import {
  interpOri,
  type Meteo,
  METEO_HOURS,
  METEO_SLOPES,
  type MeteoTemp,
  type Rads,
} from './meteo-meta.ts';

export function findMeteo(
  temps: MeteoTemp[],
  rads: Rads,
  loc: [number, number],
  [slope, ori]: [number, number],
): Meteo {
  const weights = interpLoc(loc);

  const slopeFloat = (slope / 90) * (METEO_SLOPES.length - 1);
  const slopeLow = Math.floor(slopeFloat);
  const slopeHigh = Math.ceil(slopeFloat);
  const slopeWeight = slopeFloat - slopeLow;

  const { low: oriLow, high: oriHigh, weight: oriWeight } = interpOri(ori);

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
